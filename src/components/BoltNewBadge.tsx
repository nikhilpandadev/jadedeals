import React from 'react'

interface BoltNewBadgeProps {
  variant?: 'auto' | 'light' | 'dark' | 'text'
  size?: 'small' | 'medium' | 'large'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

const BoltNewBadge: React.FC<BoltNewBadgeProps> = ({
  variant = 'auto',
  size = 'medium',
  position = 'bottom-right',
  className = ''
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'bottom-4 right-4'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1'
      case 'medium':
        return 'text-sm px-3 py-1.5'
      case 'large':
        return 'text-base px-4 py-2'
      default:
        return 'text-sm px-3 py-1.5'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return 'bg-white text-gray-800 border border-gray-200 shadow-lg'
      case 'dark':
        return 'bg-gray-900 text-white border border-gray-700 shadow-lg'
      case 'text':
        return 'bg-transparent text-gray-600 hover:text-gray-800'
      case 'auto':
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
    }
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          inline-flex items-center space-x-2 rounded-full font-medium
          transition-all duration-200 hover:scale-105 transform
          ${getSizeClasses()} ${getVariantClasses()}
        `}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="flex-shrink-0"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>Built with Bolt</span>
      </a>
    </div>
  )
}

export default BoltNewBadge