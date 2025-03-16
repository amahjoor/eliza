# Eliza.ai

Eliza.ai is an AI-powered meeting assistant designed to enhance meeting productivity and knowledge retention. The platform automatically records, transcribes, and summarizes meetings, creating a searchable knowledge base for teams and organizations.

## Features

- Record meetings directly in the browser or capture meetings from platforms like Zoom, Google Meet, and Microsoft Teams
- Access accurate transcripts with speaker identification and timestamps
- Get AI-generated summaries, key takeaways, and action items from meetings
- Build a searchable knowledge base across all meeting content
- Track people's contributions and build insights based on meeting participation

## Project Structure

This project is organized as a monorepo with separate frontend and backend directories:

```
/
├── frontend/           # Next.js frontend application
├── backend/            # Node.js/Express backend application
```

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Sequelize ORM
- PostgreSQL
- OpenAI API integration
- AWS S3 for storage

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
# Configure .env file based on .env.example
npm run dev
```

## Technical Decision

We chose JavaScript/TypeScript for both frontend and backend to maintain a consistent development experience across the stack. This allows for:

1. Shared types between frontend and backend
2. Consistent tooling and development workflow
3. Easier knowledge sharing among team members
4. Better code reuse between frontend and backend

## License

MIT
