import { OpenAI } from 'openai';
import { KnowledgeEntry, KnowledgeConnection } from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate knowledge base entries from meeting notes and transcripts
 */
export const generateKnowledgeEntries = async (
  meetingId: string,
  transcriptContent: string,
  meetingNoteContent: string,
  existingKnowledgeBase: KnowledgeEntry[] = []
): Promise<KnowledgeEntry[]> => {
  try {
    // Prepare system prompt for knowledge extraction
    const systemPrompt = `You are an AI assistant that extracts key knowledge points from meeting transcripts and notes.
    Analyze the provided meeting transcript and notes to identify:
    1. Key concepts and definitions
    2. Important decisions
    3. Technical details
    4. Project milestones
    5. Relationships between people and projects
    
    For each knowledge point, provide:
    - A clear title
    - The type of knowledge (concept, decision, technical, milestone, relationship)
    - A concise description
    - Relevant tags
    - Source reference (meeting ID and timestamp if available)
    - Relevance score (1-100)
    
    Focus on extracting factual, reusable knowledge that would be valuable for future reference.`;

    // Generate knowledge entries using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Meeting ID: ${meetingId}\n\nTranscript:\n${transcriptContent}\n\nMeeting Notes:\n${meetingNoteContent}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';
    
    // Parse knowledge entries from AI response
    const knowledgeEntries = parseKnowledgeEntries(aiContent, meetingId);
    
    // Merge with existing knowledge base and remove duplicates
    return mergeKnowledgeEntries(knowledgeEntries, existingKnowledgeBase);
  } catch (error) {
    console.error('Error generating knowledge entries:', error);
    throw error;
  }
};

/**
 * Parse knowledge entries from AI-generated content
 */
const parseKnowledgeEntries = (content: string, meetingId: string): KnowledgeEntry[] => {
  const entries: Array<{
    title: string;
    type: string;
    description: string;
    tags: string[];
    source: string;
    relevance: number;
    meetingId: string;
    createdAt: string;
  }> = [];
  
  const entryRegex = /##\s+(.*?)\s*\n([\s\S]*?)(?=##|$)/g;
  
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const [_, title, details] = match;
    
    // Extract type
    const typeMatch = details.match(/Type:\s*(.*?)(?:\n|$)/i);
    const type = typeMatch ? typeMatch[1].trim().toLowerCase() : 'concept';
    
    // Extract description
    const descriptionMatch = details.match(/Description:\s*([\s\S]*?)(?=Tags:|Relevance:|Source:|$)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    // Extract tags
    const tagsMatch = details.match(/Tags:\s*(.*?)(?:\n|$)/i);
    const tagsString = tagsMatch ? tagsMatch[1].trim() : '';
    const tags = tagsString.split(/,\s*/).filter(tag => tag.length > 0);
    
    // Extract relevance
    const relevanceMatch = details.match(/Relevance:\s*(\d+)/i);
    const relevance = relevanceMatch ? parseInt(relevanceMatch[1], 10) : 75;
    
    // Extract source
    const sourceMatch = details.match(/Source:\s*(.*?)(?:\n|$)/i);
    const source = sourceMatch ? sourceMatch[1].trim() : `Meeting: ${meetingId}`;
    
    entries.push({
      title: title.trim(),
      type,
      description,
      tags,
      source,
      relevance,
      meetingId,
      createdAt: new Date().toISOString()
    });
  }
  
  return entries;
};

/**
 * Merge new knowledge entries with existing ones, removing duplicates
 */
const mergeKnowledgeEntries = (newEntries: KnowledgeEntry[], existingEntries: KnowledgeEntry[]): KnowledgeEntry[] => {
  // Create a map of existing entries by title for quick lookup
  const existingTitleMap = new Map();
  existingEntries.forEach(entry => {
    existingTitleMap.set(entry.title.toLowerCase(), entry);
  });
  
  // Filter out duplicates and merge with existing entries
  const uniqueNewEntries = newEntries.filter(newEntry => {
    const existingEntry = existingTitleMap.get(newEntry.title.toLowerCase());
    
    if (!existingEntry) {
      return true; // Keep new entry if no duplicate exists
    }
    
    // If duplicate exists, keep the one with higher relevance
    return newEntry.relevance > existingEntry.relevance;
  });
  
  // Combine unique new entries with existing entries
  return [...uniqueNewEntries, ...existingEntries];
};

/**
 * Generate connections between knowledge entries
 */
export const generateKnowledgeConnections = async (
  knowledgeEntries: KnowledgeEntry[]
): Promise<KnowledgeConnection[]> => {
  try {
    if (knowledgeEntries.length < 2) {
      return []; // Need at least 2 entries to create connections
    }
    
    // Prepare data for connection analysis
    const entriesData = knowledgeEntries.map(entry => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      tags: entry.tags.join(', ')
    }));
    
    // Prepare system prompt for connection generation
    const systemPrompt = `You are an AI assistant that identifies connections between knowledge entries.
    Analyze the provided knowledge entries and identify meaningful connections between them.
    For each connection, provide:
    1. Source entry ID
    2. Target entry ID
    3. Connection strength (0.1-1.0)
    4. Connection type (related, depends_on, contradicts, supports, references)
    5. Brief description of the connection
    
    Focus on identifying strong, meaningful connections that would be valuable for knowledge navigation.`;

    // Generate connections using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Knowledge Entries:\n${JSON.stringify(entriesData, null, 2)}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    const aiContent = completion.choices[0].message.content || '';
    
    // Parse connections from AI response
    return parseKnowledgeConnections(aiContent);
  } catch (error) {
    console.error('Error generating knowledge connections:', error);
    throw error;
  }
};

/**
 * Parse knowledge connections from AI-generated content
 */
const parseKnowledgeConnections = (content: string): KnowledgeConnection[] => {
  const connections: Array<{
    source: string;
    target: string;
    strength: number;
    type: string;
    description: string;
    createdAt: string;
  }> = [];
  
  const connectionRegex = /Connection (\d+):\s*\n([\s\S]*?)(?=Connection \d+:|$)/g;
  
  let match;
  while ((match = connectionRegex.exec(content)) !== null) {
    const [_, connectionNumber, details] = match;
    
    // Extract source ID
    const sourceMatch = details.match(/Source ID:\s*(\w+)/i);
    const source = sourceMatch ? sourceMatch[1].trim() : null;
    
    // Extract target ID
    const targetMatch = details.match(/Target ID:\s*(\w+)/i);
    const target = targetMatch ? targetMatch[1].trim() : null;
    
    // Extract strength
    const strengthMatch = details.match(/Strength:\s*(0\.\d+|1\.0|1)/i);
    const strength = strengthMatch ? parseFloat(strengthMatch[1]) : 0.5;
    
    // Extract type
    const typeMatch = details.match(/Type:\s*(\w+)/i);
    const type = typeMatch ? typeMatch[1].trim().toLowerCase() : 'related';
    
    // Extract description
    const descriptionMatch = details.match(/Description:\s*(.*?)(?:\n|$)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    
    if (source && target) {
      connections.push({
        source,
        target,
        strength,
        type,
        description,
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return connections;
};

/**
 * Generate a summary of a knowledge base
 */
export const generateKnowledgeBaseSummary = async (
  knowledgeEntries: KnowledgeEntry[]
): Promise<string> => {
  try {
    if (knowledgeEntries.length === 0) {
      return "No knowledge entries available.";
    }
    
    // Prepare data for summary generation
    const entriesData = knowledgeEntries.map(entry => ({
      title: entry.title,
      type: entry.type,
      description: entry.description,
      tags: entry.tags.join(', '),
      relevance: entry.relevance
    }));
    
    // Prepare system prompt for summary generation
    const systemPrompt = `You are an AI assistant that summarizes knowledge bases.
    Analyze the provided knowledge entries and generate a concise summary that:
    1. Identifies the main themes and topics
    2. Highlights the most important knowledge points
    3. Identifies any gaps or areas that need more information
    4. Suggests potential applications of this knowledge
    
    The summary should be well-structured, concise, and provide a clear overview of the knowledge base.`;

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Knowledge Entries:\n${JSON.stringify(entriesData, null, 2)}` }
      ],
      temperature: 0.7,
    });

    // Extract AI-generated content
    return completion.choices[0].message.content || 'No summary generated.';
  } catch (error) {
    console.error('Error generating knowledge base summary:', error);
    throw error;
  }
};
