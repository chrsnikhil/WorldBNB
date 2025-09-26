"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Shield, Terminal, Users, Settings, Home, Code } from "lucide-react"
import Link from "next/link"

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
}

interface TacticalNavbarProps {
  items?: NavItem[]
  className?: string
}

const defaultItems: NavItem[] = [
  { label: "HOME", href: "/", icon: Home },
  { label: "DASHBOARD", href: "/dashboard", icon: Terminal },
  { label: "COMPONENTS", href: "/components", icon: Code },
  { label: "AGENTS", href: "/agents", icon: Users },
  { label: "SYSTEMS", href: "/systems", icon: Settings },
]

export default function TacticalNavbar({ items = defaultItems, className = "" }: TacticalNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeItem, setActiveItem] = useState("HOME")

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-700 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">TACTICAL OPS</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-500">v2.1.7</span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {items.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveItem(item.label)}
                    className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
                      activeItem === item.label
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>
                    )}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Status & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* System Status */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">ALL SYSTEMS OPERATIONAL</span>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-neutral-400 hover:text-orange-500"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-neutral-700 py-4 overflow-hidden"
            >
              <div className="space-y-2">
                {items.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setActiveItem(item.label)
                          setIsOpen(false)
                        }}
                        className={`w-full justify-start gap-3 py-3 ${
                          activeItem === item.label
                            ? "bg-orange-500 text-white"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
