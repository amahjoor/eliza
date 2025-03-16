'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'

export default function AISettings() {
  const { user, loading } = useAuth()
  const [aiSettings, setAISettings] = useState({
    noteDetailLevel: 3,
    preferredModel: 'gpt-4-turbo',
    defaultTemplateId: null as string | null
  })
  const [templates, setTemplates] = useState<Array<{id: string, name: string}>>([])

  const [isSaving, setIsSaving] = useState(false)
  
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
        // Success notification
      }
    } catch (error) {
      console.error('Error saving AI settings:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Note Detail Level</label>
          <input
            type="range"
            min="1"
            max="5"
            value={aiSettings.noteDetailLevel}
            onChange={(e) => setAISettings({...aiSettings, noteDetailLevel: parseInt(e.target.value)})}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Concise</span>
            <span>Balanced</span>
            <span>Detailed</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Preferred AI Model</label>
          <select
            value={aiSettings.preferredModel}
            onChange={(e) => setAISettings({...aiSettings, preferredModel: e.target.value})}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
          >
            <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Default Note Template</label>
          <select
            value={aiSettings.defaultTemplateId || ''}
            onChange={(e) => setAISettings({...aiSettings, defaultTemplateId: e.target.value === '' ? null : e.target.value})}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
          >
            <option value="">System Default</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
