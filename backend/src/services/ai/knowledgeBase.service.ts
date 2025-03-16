import { OpenAI } from 'openai';
import { KnowledgeEntry, KnowledgeConnection } from '../../types/ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Extracts knowledge entries from a meeting transcript
 * @param meetingId ID of the meeting
 * @param transcriptContent Meeting transcript content
 * @returns Array of extracted knowledge entries
 */
export async function extractKnowledgeFromTranscript(
  meetingId: string,
  transcriptContent: string
): Promise<KnowledgeEntry[]> {
  try {
    // Generate system prompt for knowledge extraction
    const systemPrompt = `You are an expert at extracting valuable knowledge from meeting transcripts. 
Your task is to identify key concepts, facts, processes, and decisions from the transcript I will provide.

For each knowledge entry, provide:
1. A clear title
2. The type of entry (concept, fact, process, decision)
3. Detailed content
4. Relevant tags
5. A relevance score (0-100)

Format your response as a JSON array of knowledge entries. Focus on extracting the most valuable and reusable knowledge.`;
    
    // Generate user prompt with transcript content
    const userPrompt = `Please extract knowledge entries from the following meeting transcript:

${transcriptContent.length > 4000 ? transcriptContent.substring(0, 4000) + '...' : transcriptContent}`;
    
    // Call OpenAI API to extract knowledge
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
    
    // Extract knowledge entries from the generated content
    const knowledgeEntries = parseKnowledgeEntries(content, meetingId);
    
    return knowledgeEntries;
  } catch (error) {
    console.error('Error extracting knowledge from transcript:', error);
    throw new Error('Failed to extract knowledge from transcript');
  }
}

/**
 * Generates connections between knowledge entries
 * @param knowledgeEntries Array of knowledge entries
 * @returns Array of knowledge connections
 */
export async function generateKnowledgeConnections(
  knowledgeEntries: KnowledgeEntry[]
): Promise<KnowledgeConnection[]> {
  try {
    if (knowledgeEntries.length <= 1) {
      return [];
    }
    
    // Generate system prompt for connection generation
    const systemPrompt = `You are an expert at identifying relationships between pieces of knowledge. 
Your task is to identify meaningful connections between the knowledge entries I will provide.

For each connection, provide:
1. The source entry ID
2. The target entry ID
3. The type of connection (e.g., 'related', 'depends_on', 'contradicts', 'supports', 'elaborates')
4. A strength score (0-100)
5. A brief description of the relationship

Format your response as a JSON array of connections. Focus on identifying the most meaningful and insightful connections.`;
    
    // Generate user prompt with knowledge entries
    const userPrompt = `Please identify connections between the following knowledge entries:

${knowledgeEntries.map((entry, index) => `
Entry ${index + 1}:
ID: ${entry.id}
Title: ${entry.title}
Type: ${entry.type}
Content: ${entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
Tags: ${entry.tags.join(', ')}
`).join('\n')}`;
    
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
    const connections = parseKnowledgeConnections(content);
    
    return connections;
  } catch (error) {
    console.error('Error generating knowledge connections:', error);
    throw new Error('Failed to generate knowledge connections');
  }
}

/**
 * Searches the knowledge base for relevant entries
 * @param query Search query
 * @param options Search options
 * @returns Array of relevant knowledge entries
 */
export async function searchKnowledgeBase(
  query: string,
  options: {
    limit?: number;
    minRelevance?: number;
    types?: string[];
    tags?: string[];
  } = {}
): Promise<KnowledgeEntry[]> {
  try {
    // Set default options
    const defaultOptions = {
      limit: 10,
      minRelevance: 50,
      types: ['concept', 'fact', 'process', 'decision'],
      tags: []
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // In a real implementation, we would search the database
    // For now, we'll use mock data
    const mockKnowledgeEntries: KnowledgeEntry[] = [
      {
        id: 'knowledge-1',
        title: 'Project Timeline',
        content: 'The project timeline includes three phases: planning (2 weeks), development (8 weeks), and testing (4 weeks).',
        type: 'process',
        tags: ['project', 'timeline', 'planning'],
        sourceType: 'meeting',
        sourceId: 'meeting-1',
        relevance: 85,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      {
        id: 'knowledge-2',
        title: 'Frontend Technology Stack',
        content: 'The frontend will be built using Next.js, TypeScript, and Tailwind CSS.',
        type: 'decision',
        tags: ['frontend', 'technology', 'stack'],
        sourceType: 'meeting',
        sourceId: 'meeting-2',
        relevance: 90,
        createdAt: new Date('2023-01-20'),
        updatedAt: new Date('2023-01-20')
      },
      {
        id: 'knowledge-3',
        title: 'User Authentication Flow',
        content: 'Users will authenticate using JWT tokens with a 24-hour expiration. Refresh tokens will be used for seamless re-authentication.',
        type: 'process',
        tags: ['authentication', 'security', 'user'],
        sourceType: 'meeting',
        sourceId: 'meeting-3',
        relevance: 80,
        createdAt: new Date('2023-01-25'),
        updatedAt: new Date('2023-01-25')
      }
    ];
    
    // Filter entries based on search query and options
    const filteredEntries = mockKnowledgeEntries
      .filter(entry => {
        // Check if entry matches the search query
        const matchesQuery = entry.title.toLowerCase().includes(query.toLowerCase()) ||
                            entry.content.toLowerCase().includes(query.toLowerCase()) ||
                            entry.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        // Check if entry meets the minimum relevance score
        const meetsRelevance = entry.relevance >= mergedOptions.minRelevance;
        
        // Check if entry has the right type
        const hasRightType = mergedOptions.types.includes(entry.type);
        
        // Check if entry has the required tags
        const hasRequiredTags = mergedOptions.tags.length === 0 ||
                               mergedOptions.tags.some(tag => entry.tags.includes(tag));
        
        return matchesQuery && meetsRelevance && hasRightType && hasRequiredTags;
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, mergedOptions.limit);
    
    return filteredEntries;
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw new Error('Failed to search knowledge base');
  }
}

/**
 * Parses knowledge entries from the generated content
 * @param content Generated content from the AI
 * @param meetingId ID of the meeting
 * @returns Array of parsed knowledge entries
 */
function parseKnowledgeEntries(content: string, meetingId: string): KnowledgeEntry[] {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);
    
    if (Array.isArray(parsedContent)) {
      return parsedContent.map((item, index) => ({
        id: `knowledge-${Date.now()}-${index}`,
        title: item.title,
        content: item.content,
        type: item.type as 'concept' | 'fact' | 'process' | 'decision',
        tags: Array.isArray(item.tags) ? item.tags : [],
        sourceType: 'meeting',
        sourceId: meetingId,
        relevance: item.relevance || 70,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: item.description
      }));
    }
    
    // If the content is not an array, try to extract knowledge entries from the text
    return extractKnowledgeEntriesFromText(content, meetingId);
  } catch (error) {
    console.error('Error parsing knowledge entries:', error);
    
    // If JSON parsing fails, try to extract knowledge entries from the text
    return extractKnowledgeEntriesFromText(content, meetingId);
  }
}

/**
 * Extracts knowledge entries from text when JSON parsing fails
 * @param content Text content
 * @param meetingId ID of the meeting
 * @returns Array of extracted knowledge entries
 */
function extractKnowledgeEntriesFromText(content: string, meetingId: string): KnowledgeEntry[] {
  const knowledgeEntries: KnowledgeEntry[] = [];
  
  // Try to extract knowledge entries using regex patterns
  const entryBlocks = content.split(/(?=##\s+|#\s+|\d+\.\s+)/);
  
  for (const [index, block] of entryBlocks.entries()) {
    if (!block.trim()) continue;
    
    // Extract title
    const titleMatch = block.match(/(?:##\s+|#\s+|\d+\.\s+)?(.+?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : `Knowledge Entry ${index + 1}`;
    
    // Extract type
    const typeMatch = block.match(/Type:?\s+(\w+)/i);
    const type = typeMatch ? 
      typeMatch[1].toLowerCase() as 'concept' | 'fact' | 'process' | 'decision' : 
      'concept';
    
    // Extract content
    const contentMatch = block.match(/Content:?\s+(.+?)(?=\n\s*(?:Tags|Relevance|$))/is);
    const content = contentMatch ? contentMatch[1].trim() : block;
    
    // Extract tags
    const tagsMatch = block.match(/Tags:?\s+(.+?)(?=\n|$)/i);
    const tags = tagsMatch ? 
      tagsMatch[1].split(/,\s*/).map(tag => tag.trim()) : 
      [];
    
    // Extract relevance
    const relevanceMatch = block.match(/Relevance:?\s+(\d+)/i);
    const relevance = relevanceMatch ? parseInt(relevanceMatch[1]) : 70;
    
    knowledgeEntries.push({
      id: `knowledge-${Date.now()}-${index}`,
      title,
      content,
      type,
      tags,
      sourceType: 'meeting',
      sourceId: meetingId,
      relevance,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // If no entries were extracted, create a default one
  if (knowledgeEntries.length === 0) {
    knowledgeEntries.push({
      id: `knowledge-${Date.now()}-0`,
      title: 'Meeting Knowledge',
      content: 'Knowledge extracted from meeting transcript.',
      type: 'concept',
      tags: ['meeting', 'general'],
      sourceType: 'meeting',
      sourceId: meetingId,
      relevance: 70,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return knowledgeEntries;
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
        type: item.type || 'related',
        strength: item.strength || 50,
        description: item.description || 'Related knowledge'
      }));
    }
    
    // If the content is not an array, return an empty array
    return [];
  } catch (error) {
    console.error('Error parsing knowledge connections:', error);
    
    // If JSON parsing fails, return an empty array
    return [];
  }
}
