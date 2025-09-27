"use client"

import { useState } from 'react'

interface MobileButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export default function MobileButton({ onClick, children, className = '', disabled = false }: MobileButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsPressed(true)
    console.log('Touch start')
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsPressed(false)
    console.log('Touch end')
    if (!disabled) {
      onClick()
    }
  }

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!disabled) {
      onClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
      className={`touch-button ${className} ${isPressed ? 'scale-95' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </button>
  )
}
