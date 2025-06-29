import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Edit, Trash2, CornerDownRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, DealComment } from '../lib/supabase'
import { getUserAvatar } from '../utils/avatars'

interface DealCommentsProps {
  dealId: string
  onCommentCountChange?: (count: number) => void
}

const DealComments: React.FC<DealCommentsProps> = ({ 
  dealId, 
  onCommentCountChange 
}) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<DealComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchComments()
  }, [dealId])

  const fetchComments = async () => {
    try {
      let { data, error } = await supabase
        .from('deal_comments')
        .select(`*, user_profiles!deal_comments_user_id_profile_fkey(*)`)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true })
      if (error && error.message.includes('relationship')) {
        // fallback manual join
        const { data: commentsData, error: commentsError } = await supabase
          .from('deal_comments')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: true })
        if (commentsError) throw commentsError
        const userIds = [...new Set(commentsData?.map(c => c.user_id).filter(Boolean))]
        let profilesData: any[] = []
        if (userIds.length > 0) {
          const { data: pd, error: pe } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', userIds)
          if (pe) throw pe
          profilesData = pd
        }
        data = commentsData?.map(comment => ({
          ...comment,
          user_profiles: profilesData?.find(p => p.id === comment.user_id) || null
        }))
      }
      if (error && !error.message.includes('relationship')) throw error
      // Map user
      const processedComments: DealComment[] = data?.map(comment => ({
        ...comment,
        user: comment.user_profiles || undefined,
        replies: []
      })) || []
      // Build nested structure
      const commentMap: { [id: string]: DealComment } = {}
      processedComments.forEach(c => { commentMap[c.id] = c })
      const roots: DealComment[] = []
      processedComments.forEach(c => {
        if (c.parent_id) {
          if (commentMap[c.parent_id]) {
            commentMap[c.parent_id].replies = commentMap[c.parent_id].replies || []
            commentMap[c.parent_id].replies!.push(c)
          }
        } else {
          roots.push(c)
        }
      })
      setComments(roots)
      onCommentCountChange?.(processedComments.length)
    } catch (error) {
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
          comment: newComment.trim(),
          parent_id: null
        })
      if (error) throw error
      setNewComment('')
      await fetchComments()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyText.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('deal_comments')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          comment: replyText.trim(),
          parent_id: parentId
        })
      if (error) throw error
      setReplyTo(null)
      setReplyText('')
      await fetchComments()
    } catch (error) {
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
    }
  }

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

  // Recursive render
  const renderComments = (comments: DealComment[], level = 0) => (
    <div className={level > 0 ? 'ml-8 border-l-2 border-emerald-100 pl-4' : ''}>
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg mb-2">
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
              <>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </p>
                <button
                  className="flex items-center text-xs text-emerald-600 hover:underline mt-2"
                  onClick={() => {
                    setReplyTo(comment.id)
                    setReplyText('')
                  }}
                >
                  <CornerDownRight className="h-3 w-3 mr-1" /> Reply
                </button>
                {replyTo === comment.id && (
                  <form
                    onSubmit={e => { e.preventDefault(); handleReplySubmit(comment.id) }}
                    className="mt-2"
                  >
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={2}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      placeholder="Write a reply..."
                    />
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        type="submit"
                        disabled={loading || !replyText.trim()}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Replying...' : 'Reply'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReplyTo(null); setReplyText('') }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
            {/* Render replies recursively */}
            {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)})
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
        {comments.length > 0 ? renderComments(comments) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealComments