'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import IntegrationSettings from '../../components/IntegrationSettings';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        <h1 className="text-3xl font-bold mb-8">Integrations</h1>
        
        <div className="glass-panel p-8 rounded-xl">
          <IntegrationSettings />
        </div>
      </div>
    </div>
  );
}
