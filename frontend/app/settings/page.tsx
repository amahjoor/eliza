'use client'

import React, { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'integrations' | 'ai'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  // If loading, show loading indicator
  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }
  
  // Mock save function
  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64">
          <div className="glass-panel p-4">
            <nav className="space-y-1">
              <button
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'profile' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Profile
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'account' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
                onClick={() => setActiveTab('account')}
              >
                🔐 Account & Security
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'notifications' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                🔔 Notifications
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'integrations' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
                onClick={() => setActiveTab('integrations')}
              >
                🔄 Integrations
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'ai' ? 'bg-primary-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
                }`}
                onClick={() => setActiveTab('ai')}
              >
                🧠 AI Settings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Picture */}
                    <div className="w-full md:w-1/3">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-neutral-700 flex items-center justify-center mb-4">
                          <span className="text-4xl">{user?.firstName?.charAt(0) || '👤'}</span>
                        </div>
                        <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg text-sm">
                          Upload Photo
                        </button>
                      </div>
                    </div>
                    
                    {/* Personal Information */}
                    <div className="w-full md:w-2/3">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              defaultValue={user?.firstName || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              defaultValue={user?.lastName || ''}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            defaultValue={user?.email || ''}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-800 pt-6">
                    <button
                      className={`px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center ${
                        isSaving ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Account & Security Settings */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Confirm your new password"
                        />
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg text-sm">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-800 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Account Management</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-neutral-400">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Meeting Reminders</h4>
                          <p className="text-sm text-neutral-400">
                            Receive email reminders before scheduled meetings
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Meeting Notes</h4>
                          <p className="text-sm text-neutral-400">
                            Receive email when meeting notes are generated
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Action Items</h4>
                          <p className="text-sm text-neutral-400">
                            Receive email for new action items assigned to you
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-800 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Browser Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Enable Browser Notifications</h4>
                          <p className="text-sm text-neutral-400">
                            Allow browser notifications for important updates
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Integrations</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Meeting Platforms</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl">Z</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Zoom</h4>
                            <p className="text-sm text-neutral-400">
                              Connect to record and transcribe Zoom meetings
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm">
                          Connect
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl">G</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Google Meet</h4>
                            <p className="text-sm text-neutral-400">
                              Connect to record and transcribe Google Meet meetings
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg text-sm">
                          Connect
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl">T</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Microsoft Teams</h4>
                            <p className="text-sm text-neutral-400">
                              Connect to record and transcribe Microsoft Teams meetings
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">AI Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Meeting Notes</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Default Meeting Note Template
                        </label>
                        <select
                          className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="standard">Standard Template</option>
                          <option value="detailed">Detailed Template</option>
                          <option value="concise">Concise Template</option>
                          <option value="custom">Custom Template</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Meeting Note Detail Level
                        </label>
                        <div className="w-full">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            defaultValue="3"
                            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-neutral-400 mt-1">
                            <span>Concise</span>
                            <span>Balanced</span>
                            <span>Detailed</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Automatically Generate Meeting Notes</h4>
                          <p className="text-sm text-neutral-400">
                            Generate meeting notes automatically after transcription
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Sync to Knowledge Base</h4>
                          <p className="text-sm text-neutral-400">
                            Automatically sync meeting notes to knowledge base
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-800 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Knowledge Base</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Show AI-Generated Content</h4>
                          <p className="text-sm text-neutral-400">
                            Display AI-generated content in knowledge base
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Enable People Insights</h4>
                          <p className="text-sm text-neutral-400">
                            Generate insights about people based on meeting participation
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
