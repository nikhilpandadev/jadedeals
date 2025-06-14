import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

interface CarouselItem {
  id: string
  type: 'deal' | 'testimonial'
  title: string
  description: string
  image?: string
  discount?: string
  price?: string
  originalPrice?: string
  author?: string
  rating?: number
  category?: string
}

interface CarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  className?: string
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      )
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPlaying, items.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1)
  }

  const handleMouseEnter = () => {
    setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsPlaying(autoPlay)
  }

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div 
      className={`relative w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Carousel Content */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl">
        <div className="relative h-96 md:h-80">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-6 md:p-8">
            {currentItem.type === 'deal' ? (
              <div className="text-center max-w-4xl w-full px-4">
                <div className="mb-4">
                  {currentItem.category && (
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                      {currentItem.category}
                    </span>
                  )}
                  {currentItem.discount && (
                    <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-bold px-4 py-2 rounded-full ml-2">
                      {currentItem.discount} OFF
                    </div>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight px-4">
                  {currentItem.title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto px-4">
                  {currentItem.description}
                </p>
                {currentItem.price && (
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                      {currentItem.price}
                    </span>
                    {currentItem.originalPrice && (
                      <span className="text-lg md:text-xl text-gray-500 line-through">
                        {currentItem.originalPrice}
                      </span>
                    )}
                  </div>
                )}
                <Link
                  to={`/deal/${currentItem.id}`}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 md:px-8 py-3 rounded-xl font-semibold text-base md:text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-block"
                >
                  View Deal
                </Link>
              </div>
            ) : (
              <div className="text-center max-w-2xl w-full px-4">
                <Quote className="h-12 w-12 text-emerald-500 mx-auto mb-6" />
                <blockquote className="text-lg md:text-xl lg:text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
                  "{currentItem.description}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div>
                    <div className="font-semibold text-gray-900">{currentItem.author}</div>
                    {currentItem.rating && (
                      <div className="flex items-center justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < currentItem.rating! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {items.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Previous slide"
                type="button"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Next slide"
                type="button"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      {showDots && items.length > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                index === currentIndex
                  ? 'bg-emerald-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel