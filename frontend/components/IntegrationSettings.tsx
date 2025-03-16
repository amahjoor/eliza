'use client';

import React, { useState, useEffect } from 'react';
// Import toast from react-hot-toast once it's installed
// For now, let's create a simple toast implementation
const toast = {
  success: (message: string) => console.log(`Success: ${message}`),
  error: (message: string) => console.error(`Error: ${message}`)
};

interface IntegrationProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  platform: 'zoom' | 'teams' | 'googleMeet';
  connectedAccount?: string;
  onConnect: (platform: string) => void;
  onDisconnect: (platform: string) => void;
}

const Integration: React.FC<IntegrationProps> = ({
  name,
  icon,
  description,
  isConnected,
  platform,
  connectedAccount,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="glass-panel p-6 rounded-xl mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-gray-400 mt-1">{description}</p>
            {isConnected && connectedAccount && (
              <p className="text-green-400 text-sm mt-2">Connected as {connectedAccount}</p>
            )}
          </div>
        </div>
        <div>
          {isConnected ? (
            <button
              onClick={() => onDisconnect(platform)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => onConnect(platform)}
              className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface IntegrationSettingsProps {
  className?: string;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ className = '' }) => {
  const [integrations, setIntegrations] = useState({
    zoom: { connected: false, email: '' },
    teams: { connected: false, email: '' },
    googleMeet: { connected: false, email: '' }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchIntegrationSettings();
  }, []);
  
  const fetchIntegrationSettings = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        setIntegrations({
          zoom: { connected: false, email: '' },
          teams: { connected: false, email: '' },
          googleMeet: { connected: false, email: '' }
        });
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      toast.error('Failed to fetch integration settings');
      setIsLoading(false);
    }
  };
  
  const handleConnect = async (platform: string) => {
    try {
      // In a real app, this would get the auth URL from the API
      // and redirect the user to the OAuth flow
      
      // Mock implementation
      let authUrl = '';
      
      switch (platform) {
        case 'zoom':
          authUrl = 'https://zoom.us/oauth/authorize';
          break;
        case 'teams':
          authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
          break;
        case 'googleMeet':
          authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
          break;
      }
      
      // For demo purposes, we'll just simulate a successful connection
      toast.success(`Connecting to ${platform}...`);
      
      setTimeout(() => {
        setIntegrations(prev => ({
          ...prev,
          [platform]: {
            connected: true,
            email: 'user@example.com'
          }
        }));
        
        toast.success(`Connected to ${platform} successfully!`);
      }, 1000);
      
      // In a real app, we would open the auth URL in a popup or redirect
      // window.open(authUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      toast.error(`Failed to connect to ${platform}`);
    }
  };
  
  const handleDisconnect = async (platform: string) => {
    try {
      // In a real app, this would be an API call
      
      // Mock implementation
      toast.success(`Disconnecting from ${platform}...`);
      
      setTimeout(() => {
        setIntegrations(prev => ({
          ...prev,
          [platform]: {
            connected: false,
            email: ''
          }
        }));
        
        toast.success(`Disconnected from ${platform} successfully!`);
      }, 500);
    } catch (error) {
      console.error(`Error disconnecting from ${platform}:`, error);
      toast.error(`Failed to disconnect from ${platform}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className={`${className} flex justify-center items-center py-12`}>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Meeting Platform Integrations</h2>
      
      <Integration
        name="Zoom"
        icon={
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 16H8C7.45 16 7 15.55 7 15V9C7 8.45 7.45 8 8 8H16C16.55 8 17 8.45 17 9V15C17 15.55 16.55 16 16 16Z" fill="currentColor" />
          </svg>
        }
        description="Import recordings from Zoom meetings"
        isConnected={integrations.zoom.connected}
        platform="zoom"
        connectedAccount={integrations.zoom.email}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      <Integration
        name="Microsoft Teams"
        icon={
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8 17.5C6.62 17.5 5.5 16.38 5.5 15V9C5.5 7.62 6.62 6.5 8 6.5H16C17.38 6.5 18.5 7.62 18.5 9V12C18.5 13.38 17.38 14.5 16 14.5H10L7 17.5H8Z" fill="currentColor" />
          </svg>
        }
        description="Import recordings from Microsoft Teams meetings"
        isConnected={integrations.teams.connected}
        platform="teams"
        connectedAccount={integrations.teams.email}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      <Integration
        name="Google Meet"
        icon={
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59Z" fill="currentColor" />
          </svg>
        }
        description="Import recordings from Google Meet meetings"
        isConnected={integrations.googleMeet.connected}
        platform="googleMeet"
        connectedAccount={integrations.googleMeet.email}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      <div className="mt-8 p-4 bg-background-light rounded-md border border-white/10">
        <h3 className="text-lg font-semibold mb-2">About Integrations</h3>
        <p className="text-gray-400">
          Connect your meeting platforms to automatically import recordings for transcription and summarization.
          Eliza will securely access your meeting recordings with your permission.
        </p>
        <p className="text-gray-400 mt-2">
          Your credentials are securely stored and you can disconnect at any time.
        </p>
      </div>
    </div>
  );
};

export default IntegrationSettings;
