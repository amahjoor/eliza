'use client'

import React, { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import AISettings from './ai-settings'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-neutral-700 rounded w-full mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-neutral-700 rounded"></div>
            <div className="h-40 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="glass-panel p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
          <p className="text-neutral-400">
            Please log in to access your settings
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="flex border-b border-neutral-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'general'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'ai'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('ai')}
        >
          AI & Intelligence
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'account'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'integrations'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
      </div>
      
      {activeTab === 'general' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all">
                Save Profile
              </button>
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-neutral-400">Receive meeting summaries via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Action Item Reminders</h3>
                  <p className="text-sm text-neutral-400">Get reminders for upcoming action items</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Browser Notifications</h3>
                  <p className="text-sm text-neutral-400">Show desktop notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all">
                Save Notifications
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'ai' && (
        <div className="grid md:grid-cols-2 gap-6">
          <AISettings />
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Template Management</h2>
            <div className="space-y-4">
              <p className="text-neutral-400">
                Create and manage templates for meeting notes, summaries, and other AI-generated content.
              </p>
              
              <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-all flex items-center">
                <span className="mr-2">📝</span> Manage Templates
              </button>
              
              <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-all flex items-center">
                <span className="mr-2">➕</span> Create New Template
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'account' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Account Security</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all">
                Update Password
              </button>
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Data Export</h3>
                <p className="text-sm text-neutral-400 mb-2">
                  Export all your data including meetings, notes, and knowledge base
                </p>
                <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-all">
                  Export Data
                </button>
              </div>
              
              <div className="pt-2 border-t border-neutral-700">
                <h3 className="font-medium text-red-500">Danger Zone</h3>
                <p className="text-sm text-neutral-400 mb-2">
                  Permanently delete your account and all associated data
                </p>
                <button className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white text-sm rounded-lg transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'integrations' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Meeting Platforms</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full mr-3">
                    <span className="text-xl">Z</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Zoom</h3>
                    <p className="text-xs text-neutral-400">Connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-all">
                  Disconnect
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-green-600 rounded-full mr-3">
                    <span className="text-xl">G</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Google Meet</h3>
                    <p className="text-xs text-neutral-400">Not connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-all">
                  Connect
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-full mr-3">
                    <span className="text-xl">T</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Microsoft Teams</h3>
                    <p className="text-xs text-neutral-400">Not connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-all">
                  Connect
                </button>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Productivity Tools</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full mr-3">
                    <span className="text-xl">S</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Slack</h3>
                    <p className="text-xs text-neutral-400">Not connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-all">
                  Connect
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-700 rounded-full mr-3">
                    <span className="text-xl">N</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Notion</h3>
                    <p className="text-xs text-neutral-400">Not connected</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-all">
                  Connect
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-600 rounded-full mr-3">
                    <span className="text-xl">+</span>
                  </div>
                  <div>
                    <h3 className="font-medium">More Integrations</h3>
                    <p className="text-xs text-neutral-400">Coming soon</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-all" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
