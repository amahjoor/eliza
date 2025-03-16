import { OpenAI } from 'openai';
import { KnowledgeEntry, KnowledgeConnection } from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Extracts knowledge entries from a transcript
 * @param transcriptContent Transcript content
 * @param options Options for extraction
 * @returns Array of knowledge entries
 */
export async function extractKnowledgeFromTranscript(
  transcriptContent: string,
  options?: {
    minRelevance?: number;
    maxEntries?: number;
  }
): Promise<KnowledgeEntry[]> {
  try {
    const minRelevance = options?.minRelevance || 70;
    const maxEntries = options?.maxEntries || 10;
    
    // Generate system prompt
    const systemPrompt = `You are an expert at extracting knowledge from meeting transcripts. Your task is to identify key concepts, facts, processes, and decisions from the transcript I will provide. For each knowledge item, extract:
    
1. A concise title
2. The type of knowledge (concept, fact, process, decision)
3. A detailed description of the knowledge
4. Relevant tags
5. The source (transcript)
6. A relevance score (0-100) indicating how important this knowledge is

Format your response as a JSON array of knowledge items. Focus on extracting the most relevant and important knowledge, with a maximum of ${maxEntries} items and a minimum relevance score of ${minRelevance}.`;
    
    // Generate user prompt with transcript content
    const userPrompt = `Here is the meeting transcript:\n\n${transcriptContent}`;
    
    // Call OpenAI API to extract knowledge
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract knowledge entries from the generated content
    const entries = parseKnowledgeEntries(content, 'transcript', 'meeting-123');
    
    return entries.map(entry => ({
      id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: entry.title,
      content: entry.description,
      type: entry.type as 'concept' | 'fact' | 'process' | 'decision',
      tags: entry.tags,
      sourceType: 'meeting',
      sourceId: entry.meetingId,
      relevance: entry.relevance,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: entry.description
    }));
  } catch (error) {
    console.error('Error extracting knowledge from transcript:', error);
    throw new Error('Failed to extract knowledge from transcript');
  }
}

/**
 * Extracts knowledge entries from a meeting note
 * @param noteContent Note content
 * @param options Options for extraction
 * @returns Array of knowledge entries
 */
export async function extractKnowledgeFromNote(
  noteContent: string,
  options?: {
    minRelevance?: number;
    maxEntries?: number;
  }
): Promise<KnowledgeEntry[]> {
  try {
    const minRelevance = options?.minRelevance || 70;
    const maxEntries = options?.maxEntries || 10;
    
    // Generate system prompt
    const systemPrompt = `You are an expert at extracting knowledge from meeting notes. Your task is to identify key concepts, facts, processes, and decisions from the notes I will provide. For each knowledge item, extract:
    
1. A concise title
2. The type of knowledge (concept, fact, process, decision)
3. A detailed description of the knowledge
4. Relevant tags
5. The source (note)
6. A relevance score (0-100) indicating how important this knowledge is

Format your response as a JSON array of knowledge items. Focus on extracting the most relevant and important knowledge, with a maximum of ${maxEntries} items and a minimum relevance score of ${minRelevance}.`;
    
    // Generate user prompt with note content
    const userPrompt = `Here are the meeting notes:\n\n${noteContent}`;
    
    // Call OpenAI API to extract knowledge
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract knowledge entries from the generated content
    const entries = parseKnowledgeEntries(content, 'note', 'note-123');
    
    return entries.map(entry => ({
      id: `entry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: entry.title,
      content: entry.description,
      type: entry.type as 'concept' | 'fact' | 'process' | 'decision',
      tags: entry.tags,
      sourceType: 'note',
      sourceId: 'note-123',
      relevance: entry.relevance,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: entry.description
    }));
  } catch (error) {
    console.error('Error extracting knowledge from note:', error);
    throw new Error('Failed to extract knowledge from note');
  }
}

/**
 * Generates connections between knowledge entries
 * @param entries Array of knowledge entries
 * @returns Array of knowledge connections
 */
export async function generateKnowledgeConnections(
  entries: KnowledgeEntry[]
): Promise<KnowledgeConnection[]> {
  try {
    if (entries.length < 2) {
      return [];
    }
    
    // Generate system prompt
    const systemPrompt = `You are an expert at identifying connections between pieces of knowledge. Your task is to analyze the knowledge entries I will provide and identify meaningful connections between them. For each connection, specify:
    
1. The source entry ID
2. The target entry ID
3. The type of connection (e.g., "related", "depends_on", "contradicts", "supports", "elaborates")
4. The strength of the connection (0-100)
5. A brief description of the connection

Format your response as a JSON array of connections. Focus on identifying the most meaningful and strong connections.`;
    
    // Generate user prompt with knowledge entries
    const userPrompt = `Here are the knowledge entries:\n\n${JSON.stringify(entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      description: entry.description || entry.content,
      type: entry.type,
      tags: entry.tags
    })), null, 2)}`;
    
    // Call OpenAI API to generate connections
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    // Parse the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Extract connections from the generated content
    return parseKnowledgeConnections(content);
  } catch (error) {
    console.error('Error generating knowledge connections:', error);
    throw new Error('Failed to generate knowledge connections');
  }
}

/**
 * Generates a summary of the knowledge base
 * @param entries Array of knowledge entries
 * @returns Summary text
 */
export async function generateKnowledgeBaseSummary(
  entries: KnowledgeEntry[]
): Promise<string> {
  try {
    if (entries.length === 0) {
      return 'No knowledge entries available.';
    }
    
    // Generate system prompt
    const systemPrompt = `You are an expert at summarizing knowledge bases. Your task is to analyze the knowledge entries I will provide and generate a concise summary of the key themes, concepts, and insights. The summary should be informative, well-structured, and highlight the most important aspects of the knowledge base.`;
    
    // Generate user prompt with knowledge entries
    const userPrompt = `Here are the knowledge entries:\n\n${JSON.stringify(entries.map(entry => ({
      title: entry.title,
      description: entry.description || entry.content,
      type: entry.type,
      tags: entry.tags,
      relevance: entry.relevance
    })), null, 2)}`;
    
    // Call OpenAI API to generate summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    // Parse the response
    return completion.choices[0]?.message?.content || 'No summary available.';
  } catch (error) {
    console.error('Error generating knowledge base summary:', error);
    throw new Error('Failed to generate knowledge base summary');
  }
}

/**
 * Parses knowledge entries from the generated content
 * @param content Generated content from the AI
 * @param source Source of the knowledge
 * @param meetingId ID of the meeting
 * @returns Array of parsed knowledge entries
 */
function parseKnowledgeEntries(
  content: string,
  source: string,
  meetingId: string
): Array<{
  title: string;
  type: string;
  description: string;
  tags: string[];
  source: string;
  relevance: number;
  meetingId: string;
  createdAt: string;
}> {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent)) {
      return parsedContent.map(item => ({
        title: item.title,
        type: item.type.toLowerCase(),
        description: item.description,
        tags: item.tags || [],
        source,
        relevance: item.relevance,
        meetingId,
        createdAt: new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing knowledge entries:', error);
    
    // If JSON parsing fails, return an empty array
    return [];
  }
}

/**
 * Parses knowledge connections from the generated content
 * @param content Generated content from the AI
 * @returns Array of parsed knowledge connections
 */
function parseKnowledgeConnections(content: string): KnowledgeConnection[] {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent)) {
      return parsedContent.map(item => ({
        source: item.source,
        target: item.target,
        type: item.type,
        strength: item.strength,
        description: item.description
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing knowledge connections:', error);
    
    // If JSON parsing fails, return an empty array
    return [];
  }
}
