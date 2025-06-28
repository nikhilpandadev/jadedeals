import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, ThumbsUp, Heart, MoreHorizontal, Flag, Edit, Trash2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, DealComment } from '../lib/supabase'
import { getUserAvatar } from '../utils/avatars'

interface DealCommentsProps {
  dealId: string
  initialComments?: DealComment[]
  onCommentCountChange?: (count: number) => void
}

const DealComments: React.FC<DealCommentsProps> = ({ 
  dealId, 
  initialComments = [], 
  onCommentCountChange 
}) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<DealComment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchComments()
  }, [dealId])

  const fetchComments = async () => {
    try {
      // First, try the direct relationship approach
      let { data, error } = await supabase
        .from('deal_comments')
        .select(`
          *,
          user_profiles!deal_comments_user_id_profile_fkey(email)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      // If that fails, fall back to a manual join approach
      if (error && error.message.includes('relationship')) {
        console.error('Direct relationship failed, trying manual approach...')
        
        const { data: commentsData, error: commentsError } = await supabase
          .from('deal_comments')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false })

        if (commentsError) throw commentsError

        // Get user profiles for all comment authors
        const userIds = [...new Set(commentsData?.map(c => c.user_id).filter(Boolean))]
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .in('id', userIds)

          if (profilesError) throw profilesError

          // Combine the data
          data = commentsData?.map(comment => ({
            ...comment,
            user_profiles: profilesData?.find(p => p.id === comment.user_id) || null
          }))
        } else {
          data = commentsData
        }
      }

      if (error && !error.message.includes('relationship')) throw error

      const processedComments = data?.map(comment => ({
        ...comment,
        user: {
          email: comment.user_profiles?.email || 'Unknown User'
        }
      })) || []

      setComments(processedComments)
      onCommentCountChange?.(processedComments.length)
    } catch (error) {
      console.error('Error fetching comments:', error)
      // Set empty comments array on error to prevent infinite loading
      setComments([])
      onCommentCountChange?.(0)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('deal_comments')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          comment: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return

    try {
      const { error } = await supabase
        .from('deal_comments')
        .update({ 
          comment: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user?.id)

      if (error) throw error

      setEditingComment(null)
      setEditText('')
      await fetchComments()
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('deal_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id)

      if (error) throw error

      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const displayedComments = showAll ? comments : comments.slice(0, 5)
  const hasMoreComments = comments.length > 5

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={getUserAvatar(user.email || '', user.id)}
              alt="Your avatar"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this deal..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Join the conversation</h4>
          <p className="text-gray-600 mb-4">Sign in to share your thoughts about this deal</p>
          <a
            href="/login"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 inline-block"
          >
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
            <img
              src={getUserAvatar(comment.user?.email || '', comment.user_id)}
              alt="Commenter avatar"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.email?.split('@')[0] || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                
                {user?.id === comment.user_id && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id)
                        setEditText(comment.comment)
                      }}
                      className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Edit comment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="bg-emerald-500 text-white px-4 py-1 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null)
                        setEditText('')
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreComments && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            {showAll 
              ? `Show Less Comments` 
              : `Show ${comments.length - 5} More Comments`
            }
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}

export default DealComments