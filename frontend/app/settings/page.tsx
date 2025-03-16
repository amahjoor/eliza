'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

// Mock user data
const getUserData = () => {
  return {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    profilePicture: '/images/profile.jpg',
    settings: {
      notifications: {
        email: true,
        browser: true,
        mobile: false
      },
      privacy: {
        shareTranscripts: false,
        shareNotes: true,
        allowAIAnalysis: true
      },
      meetings: {
        autoRecord: true,
        autoTranscribe: true,
        autoSummarize: true,
        defaultTemplate: 'general'
      },
      appearance: {
        theme: 'dark',
        fontSize: 'medium',
        compactView: false
      },
      integrations: {
        zoom: true,
        teams: false,
        googleMeet: true,
        slack: false
      }
    }
  };
};

// Settings section component
const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <div className="glass-panel p-6 rounded-xl mb-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
};

// Toggle switch component
const ToggleSwitch = ({ 
  label, 
  isChecked, 
  onChange 
}: { 
  label: string, 
  isChecked: boolean, 
  onChange: (checked: boolean) => void 
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isChecked ? 'bg-primary' : 'bg-gray-700'
        }`}
        onClick={() => onChange(!isChecked)}
        role="switch"
        aria-checked={isChecked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Select component
const Select = ({ 
  label, 
  value, 
  options, 
  onChange 
}: { 
  label: string, 
  value: string, 
  options: { value: string, label: string }[], 
  onChange: (value: string) => void 
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-300">{label}</span>
      <select
        className="p-2 bg-background-light border border-white/10 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    // In a real app, you would fetch user data from an API
    // For now, we'll use our mock data function
    const data = getUserData();
    setUser(data);
  }, []);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-12 pt-24">
          <div className="text-center">
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const updateSetting = (category: string, setting: string, value: any) => {
    setUser({
      ...user,
      settings: {
        ...user.settings,
        [category]: {
          ...user.settings[category],
          [setting]: value
        }
      }
    });
    
    // In a real app, you would save this to the backend
    setSaveMessage('Changes saved automatically');
    setTimeout(() => setSaveMessage(''), 3000);
  };
  
  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('All settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex items-center">
            {saveMessage && (
              <span className="text-green-500 mr-4">{saveMessage}</span>
            )}
            <button 
              className="primary-button"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="glass-panel p-6 rounded-xl mb-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 mb-4"></div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <button className="glass-button mt-4 w-full">
                  Edit Profile
                </button>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Navigation</h2>
              <nav>
                <ul className="space-y-2">
                  <li>
                    <a href="#account" className="block py-2 text-primary">Account Settings</a>
                  </li>
                  <li>
                    <a href="#notifications" className="block py-2">Notifications</a>
                  </li>
                  <li>
                    <a href="#privacy" className="block py-2">Privacy</a>
                  </li>
                  <li>
                    <a href="#meetings" className="block py-2">Meeting Preferences</a>
                  </li>
                  <li>
                    <a href="#appearance" className="block py-2">Appearance</a>
                  </li>
                  <li>
                    <a href="#integrations" className="block py-2">Integrations</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <SettingsSection title="Notifications">
              <ToggleSwitch 
                label="Email Notifications" 
                isChecked={user.settings.notifications.email} 
                onChange={(value) => updateSetting('notifications', 'email', value)}
              />
              <ToggleSwitch 
                label="Browser Notifications" 
                isChecked={user.settings.notifications.browser} 
                onChange={(value) => updateSetting('notifications', 'browser', value)}
              />
              <ToggleSwitch 
                label="Mobile Notifications" 
                isChecked={user.settings.notifications.mobile} 
                onChange={(value) => updateSetting('notifications', 'mobile', value)}
              />
            </SettingsSection>
            
            <SettingsSection title="Privacy">
              <ToggleSwitch 
                label="Share Transcripts with Team" 
                isChecked={user.settings.privacy.shareTranscripts} 
                onChange={(value) => updateSetting('privacy', 'shareTranscripts', value)}
              />
              <ToggleSwitch 
                label="Share Meeting Notes with Team" 
                isChecked={user.settings.privacy.shareNotes} 
                onChange={(value) => updateSetting('privacy', 'shareNotes', value)}
              />
              <ToggleSwitch 
                label="Allow AI Analysis of Meetings" 
                isChecked={user.settings.privacy.allowAIAnalysis} 
                onChange={(value) => updateSetting('privacy', 'allowAIAnalysis', value)}
              />
            </SettingsSection>
            
            <SettingsSection title="Meeting Preferences">
              <ToggleSwitch 
                label="Automatically Record Meetings" 
                isChecked={user.settings.meetings.autoRecord} 
                onChange={(value) => updateSetting('meetings', 'autoRecord', value)}
              />
              <ToggleSwitch 
                label="Automatically Transcribe Recordings" 
                isChecked={user.settings.meetings.autoTranscribe} 
                onChange={(value) => updateSetting('meetings', 'autoTranscribe', value)}
              />
              <ToggleSwitch 
                label="Automatically Generate Summaries" 
                isChecked={user.settings.meetings.autoSummarize} 
                onChange={(value) => updateSetting('meetings', 'autoSummarize', value)}
              />
              <Select 
                label="Default Meeting Template" 
                value={user.settings.meetings.defaultTemplate}
                options={[
                  { value: 'general', label: 'General Meeting' },
                  { value: 'oneonone', label: 'One-on-One' },
                  { value: 'standup', label: 'Daily Standup' },
                  { value: 'planning', label: 'Sprint Planning' },
                  { value: 'retrospective', label: 'Retrospective' }
                ]}
                onChange={(value) => updateSetting('meetings', 'defaultTemplate', value)}
              />
            </SettingsSection>
            
            <SettingsSection title="Appearance">
              <Select 
                label="Theme" 
                value={user.settings.appearance.theme}
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                  { value: 'system', label: 'System Default' }
                ]}
                onChange={(value) => updateSetting('appearance', 'theme', value)}
              />
              <Select 
                label="Font Size" 
                value={user.settings.appearance.fontSize}
                options={[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ]}
                onChange={(value) => updateSetting('appearance', 'fontSize', value)}
              />
              <ToggleSwitch 
                label="Compact View" 
                isChecked={user.settings.appearance.compactView} 
                onChange={(value) => updateSetting('appearance', 'compactView', value)}
              />
            </SettingsSection>
            
            <SettingsSection title="Integrations">
              <ToggleSwitch 
                label="Zoom" 
                isChecked={user.settings.integrations.zoom} 
                onChange={(value) => updateSetting('integrations', 'zoom', value)}
              />
              <ToggleSwitch 
                label="Microsoft Teams" 
                isChecked={user.settings.integrations.teams} 
                onChange={(value) => updateSetting('integrations', 'teams', value)}
              />
              <ToggleSwitch 
                label="Google Meet" 
                isChecked={user.settings.integrations.googleMeet} 
                onChange={(value) => updateSetting('integrations', 'googleMeet', value)}
              />
              <ToggleSwitch 
                label="Slack" 
                isChecked={user.settings.integrations.slack} 
                onChange={(value) => updateSetting('integrations', 'slack', value)}
              />
              <div className="mt-4">
                <button className="glass-button">
                  Configure Integrations
                </button>
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}
