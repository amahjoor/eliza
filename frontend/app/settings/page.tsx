'use client'

import React, { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import AISettingsPage from './ai-settings'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('ai')

  // Simple settings page with tabs
  // Only AI settings tab is fully implemented
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      {/* Settings Tabs */}
      <div className="flex border-b border-neutral-700 mb-8">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'account' 
              ? 'border-b-2 border-primary-500 text-primary-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'ai' 
              ? 'border-b-2 border-primary-500 text-primary-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('ai')}
        >
          AI Settings
        </button>
        
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'notifications' 
              ? 'border-b-2 border-primary-500 text-primary-500' 
              : 'text-neutral-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      
      {/* Settings Content */}
      <div>
        {activeTab === 'ai' && <AISettingsPage />}
        
        {/* Other tabs would be implemented here */}
        {activeTab !== 'ai' && (
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h2>
            <p className="text-neutral-400">
              This settings section is not yet implemented.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
