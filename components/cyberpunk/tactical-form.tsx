"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, User, Mail, Lock, Send, AlertTriangle } from "lucide-react"

interface TacticalFormProps {
  title?: string
  subtitle?: string
  onSubmit?: (data: any) => void
}

export default function TacticalForm({
  title = "SECURE ACCESS",
  subtitle = "Enter credentials for tactical system",
  onSubmit,
}: TacticalFormProps) {
  const [formData, setFormData] = useState({
    callsign: "",
    email: "",
    password: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (onSubmit) {
      onSubmit(formData)
    }

    setIsSubmitting(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-orange-500" />
          <div>
            <h2 className="text-white font-bold text-xl tracking-wider">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-neutral-500">SECURE CONNECTION</span>
            </div>
          </div>
        </div>
        <p className="text-neutral-400 text-sm">{subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-orange-500 mb-2 tracking-wider">CALLSIGN</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="text"
                value={formData.callsign}
                onChange={(e) => setFormData({ ...formData, callsign: e.target.value })}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-orange-500"
                placeholder="Enter tactical callsign"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-orange-500 mb-2 tracking-wider">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-orange-500"
                placeholder="classified@tactical.ops"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-orange-500 mb-2 tracking-wider">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-orange-500"
                placeholder="Enter secure password"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-orange-500 mb-2 tracking-wider">MESSAGE (OPTIONAL)</label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-500 focus:border-orange-500 resize-none"
              placeholder="Additional tactical information..."
              rows={3}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-400">
            <strong>SECURITY NOTICE:</strong> All communications are encrypted and monitored for tactical operations.
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium tracking-wider"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              PROCESSING...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              TRANSMIT DATA
            </div>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-neutral-700">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>ENCRYPTION: AES-256</span>
          <span>STATUS: SECURE</span>
        </div>
      </div>
    </motion.div>
  )
}
