"use client"

import { useState } from "react"
import {
  Home,
  MapPin,
  Star,
  Heart,
  Search,
  Calendar,
  Users,
  Shield,
  Globe,
  Lock,
  ChevronRight,
  Building,
  Wifi,
  Car,
  Coffee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import BootLoader from "@/components/boot-loader"
import { motion } from "framer-motion"
import Link from "next/link"

export default function WorldBNBLanding() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return <BootLoader onComplete={() => setIsLoading(false)} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
      className="min-h-screen bg-neutral-900"
    >
      {/* Navigation - World Mini App Style */}
      <nav className="border-b border-neutral-700 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-orange-500 font-bold text-lg tracking-wider">WorldBNB</h1>
                <p className="text-neutral-500 text-xs">World Ecosystem</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-400">LIVE</span>
              </div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2">
                EXPLORE
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - World Mini App Style */}
      <section className="relative overflow-hidden rounded-2xl mx-6">
        <div className="px-6 py-6">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-orange-500 text-xs font-medium">WORLD ECOSYSTEM</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  WORLD
                  <br />
                  <span className="text-orange-500">ACCOMMODATION</span>
                  <br />
                  NETWORK
                </h1>
                <p className="text-neutral-400 text-base leading-relaxed mb-4">
                  Discover unique stays around the world, built exclusively for the World ecosystem. 
                  Connect with hosts, explore destinations, and experience authentic local living.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                  <Search className="w-4 h-4 mr-2" />
                  FIND YOUR STAY
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  BECOME A HOST
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-neutral-500">WorldBNB v1.0</span>
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-orange-500">$ worldbnb --search</div>
                  <div className="text-neutral-400">Searching available properties...</div>
                  <div className="text-green-500">✓ 1,247 properties found</div>
                  <div className="text-green-500">✓ 89 hosts online</div>
                  <div className="text-green-500">✓ Payment system ready</div>
                  <div className="text-orange-500 animate-pulse">█</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - World Mini App Style */}
      <section id="features" className="py-8 bg-neutral-800/50 rounded-2xl mx-6">
        <div className="px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              WORLD <span className="text-orange-500">FEATURES</span>
            </h2>
            <p className="text-neutral-400 text-base max-w-2xl mx-auto">
              Discover unique accommodations and experiences built exclusively for the World ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Home,
                title: "UNIQUE STAYS",
                description: "Discover one-of-a-kind accommodations from local hosts worldwide",
                badge: "1,247+",
              },
              {
                icon: MapPin,
                title: "GLOBAL DESTINATIONS",
                description: "Explore properties in cities and countries around the world",
                badge: "89 CITIES",
              },
              {
                icon: Star,
                title: "PREMIUM EXPERIENCES",
                description: "Curated stays with exceptional ratings and reviews",
                badge: "4.9★ AVG",
              },
              {
                icon: Shield,
                title: "SECURE BOOKINGS",
                description: "Safe and secure payment processing with World ecosystem integration",
                badge: "100% SAFE",
              },
              {
                icon: Users,
                title: "TRUSTED HOSTS",
                description: "Verified hosts with excellent track records and local expertise",
                badge: "VERIFIED",
              },
              {
                icon: Globe,
                title: "WORLD ECOSYSTEM",
                description: "Built exclusively for the World ecosystem with seamless integration",
                badge: "NATIVE",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-500 text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <feature.icon className="w-8 h-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section - World Mini App Style */}
      <section id="destinations" className="py-8 rounded-2xl mx-6">
        <div className="px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              POPULAR <span className="text-orange-500">DESTINATIONS</span>
            </h2>
            <p className="text-neutral-400 text-base max-w-2xl mx-auto">
              Explore trending destinations and unique stays around the world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                title: "TOKYO, JAPAN",
                description: "Modern apartments in the heart of the city",
                icon: Building,
                color: "orange",
              },
              {
                title: "PARIS, FRANCE",
                description: "Charming historic apartments near landmarks",
                icon: Heart,
                color: "green",
              },
              {
                title: "NEW YORK, USA",
                description: "Luxury lofts with stunning city views",
                icon: Star,
                color: "blue",
              },
              {
                title: "LONDON, UK",
                description: "Traditional townhouses in prime locations",
                icon: Home,
                color: "purple",
              },
            ].map((destination, index) => (
              <div key={destination.title}>
                <Card className="bg-neutral-800 border-neutral-700 hover:border-orange-500/50 transition-colors group p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <destination.icon className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-white text-sm font-bold tracking-wider mb-2">{destination.title}</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    {destination.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Search className="w-4 h-4 mr-2" />
              EXPLORE ALL DESTINATIONS
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - World Mini App Style */}
      <section className="py-8 bg-neutral-800/30 rounded-2xl mx-6">
        <div className="px-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "ACTIVE HOSTS", value: "1,247", icon: Users, color: "text-blue-500" },
              { label: "BOOKINGS COMPLETED", value: "15,892", icon: Calendar, color: "text-green-500" },
              { label: "GLOBAL DESTINATIONS", value: "89", icon: Globe, color: "text-orange-500" },
              { label: "CUSTOMER SATISFACTION", value: "4.9★", icon: Star, color: "text-yellow-500" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                  <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-neutral-400 text-xs font-medium tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - World Mini App Style */}
      <section className="py-8 rounded-2xl mx-6">
        <div className="px-6 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              READY TO <span className="text-orange-500">EXPLORE</span>?
            </h2>
            <p className="text-neutral-400 text-base mb-6 max-w-2xl mx-auto">
              Start your journey with WorldBNB and discover unique stays around the world
            </p>
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                <Search className="w-4 h-4 mr-2" />
                FIND YOUR STAY
              </Button>
              <Button
                variant="outline"
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                BECOME A HOST
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - World Mini App Style */}
      <footer id="contact" className="border-t border-neutral-700 py-6 bg-neutral-900 rounded-t-2xl">
        <div className="px-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <h3 className="text-orange-500 font-bold text-xl tracking-wider mb-2">WorldBNB</h3>
              <p className="text-neutral-400 text-sm mb-4">
                The world's first accommodation platform built exclusively for the World ecosystem. 
                Discover unique stays and connect with hosts globally.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-xs text-neutral-500">BOOKINGS: 15,892+</div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-xs text-neutral-400">LIVE BOOKINGS ACTIVE</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 tracking-wider">NAVIGATION</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-neutral-400 hover:text-orange-500 text-sm transition-colors">
                  Features
                </a>
                <a href="#destinations" className="block text-neutral-400 hover:text-orange-500 text-sm transition-colors">
                  Destinations
                </a>
                <a href="#host" className="block text-neutral-400 hover:text-orange-500 text-sm transition-colors">
                  Become a Host
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 tracking-wider">PLATFORM INFO</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <div>Version: v1.0</div>
                <div>Hosts: 1,247+</div>
                <div>Destinations: 89 Cities</div>
                <div>Rating: 4.9★ Average</div>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-neutral-500 text-sm">
              © 2025 WorldBNB. Built for the World Ecosystem - Connecting Travelers Globally.
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Badge variant="outline" className="border-green-500/30 text-green-500">
                <Globe className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
