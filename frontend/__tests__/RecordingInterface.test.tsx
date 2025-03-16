import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecordingInterface from '../components/RecordingInterface';

// Mock the audio processing service
jest.mock('../services/audioService', () => ({
  startRecording: jest.fn(),
  stopRecording: jest.fn().mockResolvedValue(new Blob()),
  pauseRecording: jest.fn(),
  resumeRecording: jest.fn()
}));

describe('RecordingInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getUserMedia
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({});
    
    // Mock fetch for API calls
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '123', status: 'processing' })
      })
    );
  });

  it('renders the recording interface correctly', () => {
    render(<RecordingInterface />);
    
    // Check for main elements
    expect(screen.getByText(/start recording/i)).toBeInTheDocument();
    expect(screen.getByText(/meeting title/i)).toBeInTheDocument();
  });

  it('changes state when start recording button is clicked', async () => {
    render(<RecordingInterface />);
    
    // Start recording
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Wait for state change
    await waitFor(() => {
      expect(screen.getByText(/stop recording/i)).toBeInTheDocument();
    });
    
    // Check for timer display
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('shows pause/resume buttons when recording', async () => {
    render(<RecordingInterface />);
    
    // Start recording
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Wait for state change
    await waitFor(() => {
      expect(screen.getByText(/pause/i)).toBeInTheDocument();
    });
    
    // Pause recording
    fireEvent.click(screen.getByText(/pause/i));
    
    // Check for resume button
    await waitFor(() => {
      expect(screen.getByText(/resume/i)).toBeInTheDocument();
    });
  });

  it('shows processing state after stopping recording', async () => {
    render(<RecordingInterface />);
    
    // Fill in meeting title
    fireEvent.change(screen.getByLabelText(/meeting title/i), {
      target: { value: 'Test Meeting' }
    });
    
    // Start recording
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Wait for state change
    await waitFor(() => {
      expect(screen.getByText(/stop recording/i)).toBeInTheDocument();
    });
    
    // Stop recording
    fireEvent.click(screen.getByText(/stop recording/i));
    
    // Check for processing state
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  it('validates meeting title before submitting', async () => {
    render(<RecordingInterface />);
    
    // Start recording without title
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText(/meeting title is required/i)).toBeInTheDocument();
    });
    
    // Fill in meeting title
    fireEvent.change(screen.getByLabelText(/meeting title/i), {
      target: { value: 'Test Meeting' }
    });
    
    // Try again
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Check that recording started
    await waitFor(() => {
      expect(screen.getByText(/stop recording/i)).toBeInTheDocument();
    });
  });

  it('handles errors during recording', async () => {
    // Mock getUserMedia to reject
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(
      new Error('Permission denied')
    );
    
    render(<RecordingInterface />);
    
    // Fill in meeting title
    fireEvent.change(screen.getByLabelText(/meeting title/i), {
      target: { value: 'Test Meeting' }
    });
    
    // Try to start recording
    fireEvent.click(screen.getByText(/start recording/i));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/could not access microphone/i)).toBeInTheDocument();
    });
  });
});
