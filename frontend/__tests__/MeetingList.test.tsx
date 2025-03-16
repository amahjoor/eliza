import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeetingList from '../components/MeetingList';

// Mock data
const mockMeetings = [
  {
    id: '1',
    title: 'Weekly Team Sync',
    description: 'Regular team sync meeting',
    startTime: new Date('2025-03-15T10:00:00').toISOString(),
    endTime: new Date('2025-03-15T11:00:00').toISOString(),
    status: 'completed',
    createdAt: new Date('2025-03-14').toISOString()
  },
  {
    id: '2',
    title: 'Product Planning',
    description: 'Discuss Q2 roadmap',
    startTime: new Date('2025-03-16T14:00:00').toISOString(),
    endTime: new Date('2025-03-16T15:30:00').toISOString(),
    status: 'scheduled',
    createdAt: new Date('2025-03-15').toISOString()
  }
];

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockMeetings)
  })
);

describe('MeetingList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the meeting list correctly', async () => {
    render(<MeetingList />);
    
    // Check for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    });
    
    // Check for both meetings
    expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    expect(screen.getByText('Product Planning')).toBeInTheDocument();
  });

  it('displays meeting details correctly', async () => {
    render(<MeetingList />);
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    });
    
    // Check for meeting details
    expect(screen.getByText('Regular team sync meeting')).toBeInTheDocument();
    expect(screen.getByText(/march 15/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('filters meetings by status', async () => {
    render(<MeetingList />);
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    });
    
    // Select completed filter
    fireEvent.click(screen.getByText(/filter/i));
    fireEvent.click(screen.getByText(/completed/i));
    
    // Check that only completed meeting is shown
    expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    expect(screen.queryByText('Product Planning')).not.toBeInTheDocument();
  });

  it('sorts meetings by date', async () => {
    render(<MeetingList />);
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    });
    
    // Select sort by newest
    fireEvent.click(screen.getByText(/sort/i));
    fireEvent.click(screen.getByText(/newest/i));
    
    // Check order of meetings (Product Planning should be first)
    const meetingElements = screen.getAllByTestId('meeting-item');
    expect(meetingElements[0]).toHaveTextContent('Product Planning');
    expect(meetingElements[1]).toHaveTextContent('Weekly Team Sync');
  });

  it('handles search functionality', async () => {
    render(<MeetingList />);
    
    // Wait for meetings to load
    await waitFor(() => {
      expect(screen.getByText('Weekly Team Sync')).toBeInTheDocument();
    });
    
    // Search for "Product"
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Product' }
    });
    
    // Check that only Product Planning is shown
    expect(screen.queryByText('Weekly Team Sync')).not.toBeInTheDocument();
    expect(screen.getByText('Product Planning')).toBeInTheDocument();
  });

  it('handles empty meeting list', async () => {
    // Mock empty response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
    
    render(<MeetingList />);
    
    // Wait for no meetings message
    await waitFor(() => {
      expect(screen.getByText(/no meetings found/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Mock error response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch meetings' })
      })
    );
    
    render(<MeetingList />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error loading meetings/i)).toBeInTheDocument();
    });
  });
});
