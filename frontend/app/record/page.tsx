'use client'

import React, { useState } from 'react'
import RecordingInterface from '../../components/RecordingInterface'
import { useRouter } from 'next/navigation'

export default function RecordPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsUploading(true)
      
      // Create form data
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 300)
      
      // In a real implementation, we would send this to the backend
      // const response = await fetch('/api/audio/upload', {
      //   method: 'POST',
      //   body: formData
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Simulate successful upload and redirect
      setTimeout(() => {
        // In a real implementation, we would get the meeting ID from the response
        // const { meetingId } = await response.json()
        const mockMeetingId = '123456'
        router.push(`/meetings/${mockMeetingId}`)
      }, 500)
      
    } catch (error) {
      console.error('Error uploading recording:', error)
      setIsUploading(false)
      // Show error message to user
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Record Meeting</h1>
      
      {isUploading ? (
        <div className="glass-panel p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Processing Recording</h2>
          
          <div className="mb-4">
            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-neutral-400 mt-2 text-center">
              {uploadProgress < 100 ? 'Uploading and processing...' : 'Processing complete!'}
            </div>
          </div>
          
          <div className="text-center text-sm text-neutral-300">
            <p className="mb-2">Your recording is being processed. This may take a few moments.</p>
            <p>We're transcribing your audio and generating meeting notes.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-neutral-300 mb-4">
              Record your meeting directly in your browser. The audio will be automatically transcribed and summarized.
            </p>
            <div className="bg-neutral-800/50 p-4 rounded-lg text-sm">
              <h3 className="font-medium mb-2">Tips for best results:</h3>
              <ul className="list-disc list-inside space-y-1 text-neutral-400">
                <li>Use a good quality microphone</li>
                <li>Minimize background noise</li>
                <li>Ask participants to speak clearly</li>
                <li>Recordings are automatically backed up every 5 minutes</li>
              </ul>
            </div>
          </div>
          
          <RecordingInterface onRecordingComplete={handleRecordingComplete} />
        </>
      )}
    </div>
  )
}
