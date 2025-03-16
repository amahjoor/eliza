'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'

export default function AISettings() {
  const { user, loading } = useAuth()
  const [aiSettings, setAISettings] = useState({
    noteDetailLevel: 3,
    preferredModel: 'gpt-4-turbo',
    defaultTemplateId: null
  })
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  useEffect(() => {
    if (user && user.settings?.ai) {
      setAISettings(user.settings.ai)
    }
    
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates?type=meeting_note', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      }
    }
    
    fetchTemplates()
  }, [user])
  
  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ai: aiSettings
        })
      })
      
      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving AI settings:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-700 rounded w-1/4 mt-4"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Note Detail Level</label>
          <input
            type="range"
            min="1"
            max="5"
            value={aiSettings.noteDetailLevel}
            onChange={(e) => setAISettings({...aiSettings, noteDetailLevel: parseInt(e.target.value)})}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>Concise</span>
            <span>Balanced</span>
            <span>Detailed</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Controls how detailed the AI-generated meeting notes will be
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Preferred AI Model</label>
          <select
            value={aiSettings.preferredModel}
            onChange={(e) => setAISettings({...aiSettings, preferredModel: e.target.value})}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
          </select>
          <p className="text-xs text-neutral-500 mt-1">
            GPT-4 Turbo provides higher quality results but may be slower. GPT-3.5 Turbo is faster but less accurate.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Default Note Template</label>
          <select
            value={aiSettings.defaultTemplateId || ''}
            onChange={(e) => setAISettings({...aiSettings, defaultTemplateId: e.target.value || null})}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">System Default</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <p className="text-xs text-neutral-500 mt-1">
            Select a template to use by default when generating meeting notes
          </p>
        </div>
        
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          
          {saveStatus === 'success' && (
            <span className="ml-3 text-green-500 text-sm">Settings saved successfully!</span>
          )}
          
          {saveStatus === 'error' && (
            <span className="ml-3 text-red-500 text-sm">Error saving settings. Please try again.</span>
          )}
        </div>
      </div>
    </div>
  )
}
