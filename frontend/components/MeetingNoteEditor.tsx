'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToNoteUpdates, joinMeeting, leaveMeeting, unsubscribeFromMeetingEvents } from '../lib/socket';

interface ActionItem {
  id: string;
  task: string;
  assignee?: string;
  dueDate?: string;
  completed: boolean;
}

interface MeetingNote {
  id: string;
  meetingId: string;
  summary: string;
  actionItems: ActionItem[];
  content: any;
  format: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MeetingNoteEditorProps {
  meetingId: string;
  initialNote?: MeetingNote | null;
  readOnly?: boolean;
}

const MeetingNoteEditor: React.FC<MeetingNoteEditorProps> = ({
  meetingId,
  initialNote = null,
  readOnly = false
}) => {
  const [note, setNote] = useState<MeetingNote | null>(initialNote);
  const [editedSummary, setEditedSummary] = useState<string>('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  useEffect(() => {
    // Join meeting room
    joinMeeting(meetingId);

    // Subscribe to note updates
    subscribeToNoteUpdates(meetingId, (data) => {
      if (data) {
        setNote(data);
        setEditedSummary(data.summary || '');
        setActionItems(data.actionItems || []);
      }
    });

    // Clean up on unmount
    return () => {
      leaveMeeting(meetingId);
      unsubscribeFromMeetingEvents(meetingId);
    };
  }, [meetingId]);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
      setEditedSummary(initialNote.summary || '');
      setActionItems(initialNote.actionItems || []);
    }
  }, [initialNote]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Discard changes
      setEditedSummary(note?.summary || '');
      setActionItems(note?.actionItems || []);
    }
    setIsEditing(!isEditing);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await fetch(`/api/meetings/${meetingId}/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          summary: editedSummary,
          actionItems: actionItems
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save meeting note');
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionItemChange = (index: number, field: keyof ActionItem, value: any) => {
    const updatedItems = [...actionItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setActionItems(updatedItems);
  };

  const handleAddActionItem = () => {
    setActionItems([
      ...actionItems,
      {
        id: `new-${Date.now()}`,
        task: '',
        completed: false
      }
    ]);
  };

  const handleRemoveActionItem = (index: number) => {
    const updatedItems = [...actionItems];
    updatedItems.splice(index, 1);
    setActionItems(updatedItems);
  };

  if (!note && !initialNote) {
    return (
      <div className="glass-panel p-6 rounded-xl">
        <div className="text-center py-8">
          <p className="text-gray-400">No meeting notes available yet.</p>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Create Note
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Meeting Notes</h3>
        {!readOnly && (
          <button
            onClick={handleEditToggle}
            className={`${
              isEditing
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-primary hover:bg-primary/90'
            } text-white font-medium py-2 px-4 rounded-md transition-colors`}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      {saveError && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4">
          {saveError}
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">Summary</h4>
        {isEditing ? (
          <textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="w-full p-3 bg-background-light border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px]"
            placeholder="Enter meeting summary..."
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {note?.summary ? (
              <div className="whitespace-pre-wrap">{note.summary}</div>
            ) : (
              <p className="text-gray-400 italic">No summary available</p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-medium">Action Items</h4>
          {isEditing && (
            <button
              onClick={handleAddActionItem}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              + Add Item
            </button>
          )}
        </div>

        {actionItems.length > 0 ? (
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-start p-3 bg-background-light border border-white/10 rounded-md"
              >
                {isEditing ? (
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) =>
                        handleActionItemChange(index, 'task', e.target.value)
                      }
                      className="w-full p-2 bg-background border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Task description"
                    />
                    <div className="flex flex-wrap gap-3">
                      <input
                        type="text"
                        value={item.assignee || ''}
                        onChange={(e) =>
                          handleActionItemChange(index, 'assignee', e.target.value)
                        }
                        className="flex-1 p-2 bg-background border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Assignee"
                      />
                      <input
                        type="date"
                        value={item.dueDate || ''}
                        onChange={(e) =>
                          handleActionItemChange(index, 'dueDate', e.target.value)
                        }
                        className="flex-1 p-2 bg-background border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) =>
                            handleActionItemChange(
                              index,
                              'completed',
                              e.target.checked
                            )
                          }
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Completed</span>
                      </label>
                      <button
                        onClick={() => handleRemoveActionItem(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div
                        className={`mt-1 mr-3 flex-shrink-0 h-4 w-4 rounded-sm ${
                          item.completed
                            ? 'bg-green-500'
                            : 'border border-white/30'
                        }`}
                      >
                        {item.completed && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            item.completed ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {item.task}
                        </p>
                        <div className="flex flex-wrap text-sm text-gray-400 mt-1">
                          {item.assignee && (
                            <span className="mr-4">
                              Assignee: {item.assignee}
                            </span>
                          )}
                          {item.dueDate && (
                            <span>
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No action items</p>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}

      {note?.aiGenerated && !isEditing && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            This note was automatically generated by AI
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingNoteEditor;
