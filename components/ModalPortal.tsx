"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalPortalProps {
  children: React.ReactNode
}

export default function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🚀 ModalPortal mounting...');
    setMounted(true)
    return () => {
      console.log('🚀 ModalPortal unmounting...');
      setMounted(false)
    }
  }, [])

  if (!mounted) {
    console.log('🚀 ModalPortal not mounted yet');
    return null
  }

  console.log('🚀 ModalPortal rendering to document.body');
  // Render modal directly to document.body to avoid stacking context issues
  return createPortal(children, document.body)
}
