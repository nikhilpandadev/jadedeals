import React, { useState } from 'react'
import { X, Copy, Check, Share2, Facebook, Twitter, MessageCircle } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  dealId: string
  dealTitle: string
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, dealId, dealTitle }) => {
  const [copied, setCopied] = useState(false)
  
  if (!isOpen) return null

  const dealUrl = `${window.location.origin}/deal/${dealId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dealUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dealUrl)}`
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(dealUrl)}&text=${encodeURIComponent(`Check out this amazing deal: ${dealTitle}`)}`
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this amazing deal: ${dealTitle} ${dealUrl}`)}`
    }
  ]

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Share2 className="h-5 w-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Share Deal</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">Share this amazing deal with your friends!</p>
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-sm font-medium text-gray-900 mb-2">{dealTitle}</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={dealUrl}
                readOnly
                className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 mb-3">Share on social media</p>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleSocialShare(option.url)}
                className={`flex flex-col items-center space-y-2 p-4 rounded-lg text-white transition-colors ${option.color}`}
              >
                {option.icon}
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShareModal