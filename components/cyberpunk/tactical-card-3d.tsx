"use client"

import { useState, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { X } from "lucide-react"
import type * as THREE from "three"
import ErrorBoundary from "@/components/error-boundary"

interface TacticalCard3DProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
  glowColor?: "orange" | "green" | "blue" | "red"
}

function Card3D({ isFlipped, glowColor }: { isFlipped: boolean; glowColor: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Spinning animation when flipped
      if (isFlipped) {
        meshRef.current.rotation.y += 0.02
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      } else {
        // Subtle hover animation
        meshRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0
        meshRef.current.rotation.x = hovered ? Math.cos(state.clock.elapsedTime * 2) * 0.05 : 0
      }
    }
  })

  const glowColorMap = {
    orange: "#f97316",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
  }

  return (
    <mesh ref={meshRef} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <boxGeometry args={[2, 2.8, 0.1]} />
      <meshStandardMaterial
        color="#404040"
        metalness={0.8}
        roughness={0.2}
        emissive={glowColorMap[glowColor as keyof typeof glowColorMap]}
        emissiveIntensity={hovered ? 0.1 : 0.05}
      />

      {/* Diagonal grid pattern */}
      <Html
        transform
        occlude
        position={[0, 0, 0.051]}
        style={{
          width: "200px",
          height: "280px",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-full h-full opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 40%, ${glowColorMap[glowColor as keyof typeof glowColorMap]}40 41%, ${glowColorMap[glowColor as keyof typeof glowColorMap]}40 42%, transparent 43%),
              linear-gradient(-45deg, transparent 40%, ${glowColorMap[glowColor as keyof typeof glowColorMap]}40 41%, ${glowColorMap[glowColor as keyof typeof glowColorMap]}40 42%, transparent 43%)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </Html>
    </mesh>
  )
}

// Fallback component for when 3D rendering fails
function Card3DFallback({ glowColor }: { glowColor: string }) {
  const glowColorMap = {
    orange: "from-orange-500/20 to-orange-600/10",
    green: "from-green-500/20 to-green-600/10",
    blue: "from-blue-500/20 to-blue-600/10",
    red: "from-red-500/20 to-red-600/10",
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={`w-32 h-44 bg-gradient-to-br ${glowColorMap[glowColor as keyof typeof glowColorMap]} rounded-lg border border-neutral-600 flex items-center justify-center`}>
        <div className="text-neutral-400 text-xs text-center">
          <div className="w-8 h-8 border-2 border-current rounded mb-2 mx-auto flex items-center justify-center">
            <div className="w-2 h-2 bg-current rounded-full"></div>
          </div>
          <div>3D CARD</div>
          <div className="text-xs opacity-60">FALLBACK</div>
        </div>
      </div>
    </div>
  )
}

export default function TacticalCard3D({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  glowColor = "orange",
}: TacticalCard3DProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const glowColors = {
    orange: "shadow-orange-500/20 hover:shadow-orange-500/40 border-orange-500/30",
    green: "shadow-green-500/20 hover:shadow-green-500/40 border-green-500/30",
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/30",
    red: "shadow-red-500/20 hover:shadow-red-500/40 border-red-500/30",
  }

  const iconColors = {
    orange: "text-orange-500",
    green: "text-green-500",
    blue: "text-blue-500",
    red: "text-red-500",
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        whileHover={{
          y: -5,
          rotateX: 5,
          rotateY: 2,
          transition: { duration: 0.2 },
        }}
        transition={{ duration: 0.6 }}
        onClick={() => setIsPopupOpen(true)}
        className={`
          relative bg-neutral-900 border rounded-lg p-6 cursor-pointer
          shadow-2xl transition-all duration-300
          transform-gpu perspective-1000
          ${glowColors[glowColor]}
          ${className}
        `}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <ErrorBoundary fallback={<Card3DFallback glowColor={glowColor} />}>
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <Card3D isFlipped={false} glowColor={glowColor} />
              </Suspense>
            </Canvas>
          </ErrorBoundary>
        </div>

        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 ${glowColors[glowColor]} blur-xl -z-10`}
        />

        {/* Header */}
        <div className="relative z-20 flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded ${iconColors[glowColor]} bg-neutral-800/80 backdrop-blur-sm`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-lg tracking-wider">{title}</h3>
              {subtitle && <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                glowColor === "orange"
                  ? "bg-orange-500"
                  : glowColor === "green"
                    ? "bg-green-500"
                    : glowColor === "blue"
                      ? "bg-blue-500"
                      : "bg-red-500"
              }`}
            />
            <span className="text-xs text-neutral-500">ACTIVE</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20">{children}</div>

        {/* Bottom border accent */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-lg ${
            glowColor === "orange"
              ? "bg-gradient-to-r from-transparent via-orange-500 to-transparent"
              : glowColor === "green"
                ? "bg-gradient-to-r from-transparent via-green-500 to-transparent"
                : glowColor === "blue"
                  ? "bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                  : "bg-gradient-to-r from-transparent via-red-500 to-transparent"
          }`}
        />

        {/* Corner accents */}
        <div
          className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${
            glowColor === "orange"
              ? "border-orange-500"
              : glowColor === "green"
                ? "border-green-500"
                : glowColor === "blue"
                  ? "border-blue-500"
                  : "border-red-500"
          }`}
        />
        <div
          className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${
            glowColor === "orange"
              ? "border-orange-500"
              : glowColor === "green"
                ? "border-green-500"
                : glowColor === "blue"
                  ? "border-blue-500"
                  : "border-red-500"
          }`}
        />
      </motion.div>

      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.5, rotateY: 180 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                rotateY: { duration: 1, ease: "easeInOut" },
              }}
              className="relative bg-neutral-900 border border-neutral-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsPopupOpen(false)}
                className="absolute top-4 right-4 z-30 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* 3D Card Display */}
              <div className="h-96 relative">
                <ErrorBoundary fallback={<Card3DFallback glowColor={glowColor} />}>
                  <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <ambientLight intensity={0.6} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <Suspense fallback={null}>
                      <Card3D isFlipped={true} glowColor={glowColor} />
                    </Suspense>
                  </Canvas>
                </ErrorBoundary>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {Icon && (
                    <div className={`p-3 rounded ${iconColors[glowColor]} bg-neutral-800`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-white font-bold text-2xl tracking-wider">{title}</h2>
                    {subtitle && <p className="text-neutral-400 mt-1">{subtitle}</p>}
                  </div>
                </div>

                <div className="space-y-4">{children}</div>

                {/* Additional popup content */}
                <div className="mt-6 pt-6 border-t border-neutral-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${iconColors[glowColor]}`}>100%</div>
                      <div className="text-xs text-neutral-400">OPERATIONAL</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${iconColors[glowColor]}`}>24/7</div>
                      <div className="text-xs text-neutral-400">MONITORING</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${iconColors[glowColor]}`}>SECURE</div>
                      <div className="text-xs text-neutral-400">ENCRYPTED</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
