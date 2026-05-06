import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const { pathname } = useLocation()

  // Tự động cuộn lên đầu trang khi chuyển hướng (đổi route)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#60D86E] text-white shadow-lg hover:bg-[#45c45a] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center animate-fade-in"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  )
}
