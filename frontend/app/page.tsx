import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-500">
            Transform Your Meetings with AI
          </h1>
          <p className="text-xl md:text-2xl text-neutral-300 mb-8">
            Record, transcribe, and summarize your meetings automatically.
            Build a searchable knowledge base from your conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/record" 
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-lg flex items-center justify-center transition-all"
            >
              🎤 Record Meeting
            </Link>
            <Link 
              href="/meetings" 
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg flex items-center justify-center transition-all"
            >
              📤 Upload Recording
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Key Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-6 transition-all hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary-400 text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Recording</h3>
              <p className="text-neutral-300">
                Record meetings from your browser or upload recordings from Zoom, Google Meet, and Microsoft Teams.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-panel p-6 transition-all hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-secondary-400 text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Transcription</h3>
              <p className="text-neutral-300">
                Get accurate transcripts with speaker identification and timestamps for easy reference.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-panel p-6 transition-all hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary-400 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
              <p className="text-neutral-300">
                Automatically generate meeting summaries, key takeaways, and action items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-panel p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your meetings?</h2>
            <p className="text-lg text-neutral-300 mb-6">
              Start recording your first meeting and see the power of AI-assisted note-taking.
            </p>
            <Link 
              href="/record" 
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-lg inline-flex items-center transition-all"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
