'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    // Set active tab based on current path
    if (pathname === '/') setActiveTab('home')
    else if (pathname.startsWith('/meetings')) setActiveTab('meetings')
    else if (pathname.startsWith('/people')) setActiveTab('people')
    else if (pathname.startsWith('/projects')) setActiveTab('projects')
    else if (pathname.startsWith('/settings')) setActiveTab('settings')
  }, [pathname])

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', href: '/' },
    { id: 'meetings', label: 'Meetings', icon: '📁', href: '/meetings' },
    { id: 'people', label: 'People', icon: '👥', href: '/people' },
    { id: 'projects', label: 'Projects', icon: '📂', href: '/projects' },
  ]

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 relative mr-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-white font-bold text-xl">Eliza.ai</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`relative px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {item.icon}
                {item.label}
                {activeTab === item.id && (
                  <div className="nav-indicator w-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                <span className="text-white">👤</span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-neutral-800 ring-1 ring-black ring-opacity-5 z-10">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
                  onClick={() => setShowDropdown(false)}
                >
                  ⚙️ Settings
                </Link>
                <div className="border-t border-neutral-700 my-1"></div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
                  onClick={() => {
                    // Handle logout
                    setShowDropdown(false)
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-neutral-800">
          <div className="flex justify-between">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 ${
                  activeTab === item.id
                    ? 'text-primary-400'
                    : 'text-neutral-400'
                }`}
              >
                <div className="text-xl">{item.icon}</div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
