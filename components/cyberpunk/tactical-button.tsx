"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface TacticalButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "danger" | "success"
  size?: "sm" | "md" | "lg"
  icon?: LucideIcon
  iconPosition?: "left" | "right"
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export default function TacticalButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}: TacticalButtonProps) {
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-orange-500/20",
    secondary: "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-600 shadow-neutral-500/20",
    danger: "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-red-500/20",
    success: "bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-green-500/20",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          relative border font-medium tracking-wider transition-all duration-200
          hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        <div className={`flex items-center gap-2 ${loading ? "opacity-0" : "opacity-100"}`}>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded opacity-0 hover:opacity-20 transition-opacity duration-200 bg-current blur-sm -z-10" />
      </Button>
    </motion.div>
  )
}
