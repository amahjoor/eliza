'use client'

import React, { useState, useEffect, useRef } from 'react'

interface RecordingInterfaceProps {
  onRecordingComplete: (audioBlob: Blob) => void
}

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [hasAudio, setHasAudio] = useState(true)
  const [showNoAudioWarning, setShowNoAudioWarning] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioCheckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastAudioLevelRef = useRef<number>(0)
  
  // Audio visualizer bars
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(10).fill(5))
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  
  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioCheckTimerRef.current) clearTimeout(audioCheckTimerRef.current)
      if (audioURL) URL.revokeObjectURL(audioURL)
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [audioURL])
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
      
      // Start visualizer animation
      updateAudioVisualizer()
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setAudioBlob(audioBlob)
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop())
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
        }
      }
      
      // Start recording
      mediaRecorderRef.current.start(1000) // Save chunks every second
      setIsRecording(true)
      setRecordingTime(0)
      setAudioURL(null)
      setAudioBlob(null)
      setHasAudio(true)
      setShowNoAudioWarning(false)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Check for audio after 1 minute
      audioCheckTimerRef.current = setTimeout(() => {
        if (lastAudioLevelRef.current < 10) { // Threshold for "no audio"
          setHasAudio(false)
          setShowNoAudioWarning(true)
        }
      }, 60000) // 1 minute
      
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (audioCheckTimerRef.current) {
        clearTimeout(audioCheckTimerRef.current)
        audioCheckTimerRef.current = null
      }
    }
  }
  
  const updateAudioVisualizer = () => {
    if (!analyserRef.current || !dataArrayRef.current || !isRecording) return
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    
    // Calculate average audio level
    const average = dataArrayRef.current.reduce((acc, val) => acc + val, 0) / dataArrayRef.current.length
    lastAudioLevelRef.current = average
    
    // Update visualizer bars
    const newLevels = [...audioLevels]
    newLevels.shift()
    newLevels.push(Math.min(30, Math.max(5, average / 8)))
    setAudioLevels(newLevels)
    
    requestAnimationFrame(updateAudioVisualizer)
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleSave = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
    }
  }
  
  const handleDismissWarning = () => {
    setShowNoAudioWarning(false)
  }
  
  return (
    <div className="glass-panel p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Meeting Recorder</h2>
      
      {/* Recording Timer */}
      <div className="text-center mb-6">
        <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>
        <div className="text-sm text-neutral-400 mt-1">
          {isRecording ? 'Recording in progress...' : 'Ready to record'}
        </div>
      </div>
      
      {/* Audio Visualizer */}
      <div className="audio-visualizer mb-6 flex justify-center items-end h-12">
        {isRecording && audioLevels.map((height, i) => (
          <div
            key={i}
            className="audio-bar mx-0.5"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.1}s`,
              backgroundColor: i % 2 === 0 ? '#38bdf8' : '#8b5cf6'
            }}
          />
        ))}
      </div>
      
      {/* No Audio Warning */}
      {showNoAudioWarning && (
        <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4 mb-6 text-amber-200 text-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">⚠️ No audio detected</p>
              <p className="mt-1">Check that your microphone is working and not muted.</p>
            </div>
            <button 
              onClick={handleDismissWarning}
              className="text-amber-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all"
          >
            🎤 Start Recording
          </button>
        )}
        
        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg flex items-center transition-all"
          >
            ⏹️ Stop Recording
          </button>
        )}
        
        {audioURL && (
          <>
            <audio src={audioURL} controls className="w-full mb-4" />
            <div className="flex gap-4 mt-4">
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg flex items-center transition-all"
              >
                🔄 Record Again
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg flex items-center transition-all"
              >
                💾 Save Recording
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Backup Info */}
      {isRecording && recordingTime > 0 && recordingTime % 300 === 0 && (
        <div className="mt-4 text-center text-sm text-neutral-400">
          Auto-backup created ({formatTime(recordingTime)})
        </div>
      )}
    </div>
  )
}

export default RecordingInterface
