# Josh Sylvia Tech - Hybrid AI Chatbot with RAG

A modern web application that talks about Josh Sylvia’s knowledge on technology featuring an AI-powered chatbot with Retrieval-Augmented Generation (RAG) capabilities, built with Express.js and optimized for deployment. Searching for josh sylvia tech is completed using Elastic Search. Tutorial provided by jobs are youtube videos, github, and a playground environment. 

## 🚀 Features

### Hybrid AI Chatbot
- **Dual-Model Architecture**: Groq API (Llama 3.1 8B Instant) + Local Ollama fine-tuned model
- **Intelligent Routing**: Resume queries → Ollama, General queries → Groq, Knowledge base → Elastic Search
- **Agentic AI System**: Tool-calling capabilities with search, skills, experience, and contact tools
- **RAG System**: Context-aware responses using Elastic Search retrieval
- **Secure API Key Management**: Environment-based configuration
- **Real-time Chat**: Interactive conversational interface with category-based link injection

### Performance Optimizations
- **Gzip Compression**: 70-90% response size reduction
- **Static Asset Caching**: 1-day browser cache with ETag support
- **Memory Optimized**: Under 8GB deployment limit
- **Fast Builds**: Optimized npm configuration

### Web Application
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, professional layout
- **Navigation**: Seamless page transitions
- **Contact Form**: Secure message handling

## 🛠️ Technology Stack

### Backend
- **Node.js**: 24.14.1 (Latest)
- **Express.js**: 4.22.2 (web framework)
- **PostgreSQL**: 8.20.0 (database)
- **Body Parser**: Request parsing middleware
- **Compression**: Gzip response compression
- **Method Override**: HTTP method handling
- **Dotenv**: Environment variable management
- **Resend**: 6.12.4 (email service)

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript**: ES6+ with async/await
- **OpenAI Client**: Groq API integration
- **RAG System**: Document retrieval and context injection

### AI & ML
- **Groq API**: Llama 3.1 8B Instant model (general queries)
- **Ollama**: Local fine-tuned Llama 3.1 8B model (resume-specific queries)
- **Hybrid Architecture**: Intelligent query routing between models
- **Agentic AI**: Tool-calling system with function execution
- **Retrieval-Augmented Generation**: Context-aware responses
- **Elastic Search**: Expertise documentation and semantic search
- **Custom Training**: JSONL-based fine-tuning with resume data

## 📦 Installation

### Prerequisites
- Node.js 24.14.1 or higher
- npm package manager

### Setup
```bash
# Clone repository
git clone https://github.com/joshsylvia-eng/josh_sylvia_tech.git
cd josh_sylvia_tech

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Start development server
npm start
```

### Environment Variables
```env
# Database Configuration
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=nodeapp
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=8080

# AI/LLM Configuration
GROQ_API_KEY=your_groq_api_key_here

# Elastic Search Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_elastic_password
ELASTICSEARCH_INDEX=josh-expertise

# Contact
CONTACT_EMAIL=joshsylvia@yahoo.com
NODE_ENV=development
```

## 🚀 Deployment

### Render Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node.js Version**: 24.14.1
- **Environment Variables**: Set GROQ_API_KEY in dashboard

### Performance Features
- **Compression**: Gzip enabled for all responses
- **Caching**: 1-day static asset cache
- **Optimized Dependencies**: Minimal memory footprint
- **Fast Installs**: npm ci with lockfile

## 📁 Project Structure

```
josh_sylvia_tech/
├── app/
│   ├── ApiController.js          # API controller logic
│   ├── routes.js                # Route definitions
│   └── socket/
│       └── PublicMessageSocket.js  # WebSocket handling
├── config/
│   ├── database-schema.sql      # Database schema
│   └── database.js              # Database connection
├── data/
│   ├── res/
│   │   └── joshsylvia_resume_26.pdf  # Resume file
│   └── videos.json              # Video metadata
├── models/
│   └── Video.js                 # Video model
├── ollama-training/
│   ├── Modelfile                # Ollama model configuration
│   ├── README.md                # Ollama setup instructions
│   └── training-data.jsonl      # Training data for fine-tuning
├── public/
│   ├── index.html               # Homepage
│   ├── ai.html                  # AI chatbot page
│   ├── about.html               # About page with skills
│   ├── apis.html                # APIs page
│   ├── contact.html             # Contact page
│   ├── cybersecurity.html       # Cybersecurity page
│   ├── qa.html                  # QA/testing page
│   ├── tutorials.html           # Tutorials page
│   ├── playground.html          # AI playground
│   ├── components/
│   │   └── navigation.html      # Navigation component
│   ├── css/                     # Stylesheets
│   ├── images/                  # Image assets
│   ├── js/
│   │   ├── agent.js             # Agentic AI system
│   │   ├── ai.js                # AI chat functionality
│   │   ├── about.js             # About page logic
│   │   ├── cybersecurity.js     # Cybersecurity page logic
│   │   ├── playground.js        # Playground logic
│   │   ├── search-functions.js  # Search utilities
│   │   └── tutorials.js         # Tutorials page logic
│   └── videos/                  # Video assets
├── scripts/
│   ├── create-video-thumbnail.js
│   ├── download-youtube-videos-fixed.js
│   ├── download-youtube-videos.js
│   ├── extract-frame-browser.html
│   ├── extract-frame-server.js
│   ├── extract-video-thumbnail.js
│   ├── extract-video-thumbnails.js
│   ├── populate-videos.js
│   └── seed-video.js
├── ssl/                         # SSL certificates
├── videos/                      # Video storage
├── server.js                    # Express server
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment template
├── .npmrc                       # npm configuration
├── .gitignore                   # Git ignore rules
├── .codeiumignore               # Codeium ignore rules
└── README.md                    # This file
```

## 🔧 Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm ci"
  }
}
```

## 🎯 API Endpoints

### Page Routes
- `GET /` - Homepage
- `GET /ai` - AI chatbot interface
- `GET /about` - About page with skills and experience
- `GET /apis` - APIs and endpoints page
- `GET /contact` - Contact form page
- `GET /cybersecurity` - Cybersecurity expertise page
- `GET /qa` - QA and testing page
- `GET /tutorials` - Tutorials page
- `GET /playground` - AI playground

### API Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/resume` - Resume download endpoint
- `GET /api/videos` - Videos listing with caching (5-minute cache)
- `POST /api/contact` - Contact form submission with Resend email
- `GET /api/groq-key` - Groq API key endpoint (for client-side)
- `GET /api/ollama-status` - Ollama server status check

### Agentic AI Endpoints
- `POST /api/agent-search` - Search knowledge base via Elastic Search
- `GET /api/agent-skills` - Get Josh Sylvia's technical skills
- `GET /api/agent-experience` - Get professional experience history
- `GET /api/agent-contact` - Get contact information

## 🔒 Security

- **API Key Protection**: Environment-based configuration
- **Input Validation**: Request sanitization
- **Secure Headers**: HTTP security best practices
- **No Hardcoded Secrets**: All keys externalized

## 📈 Performance

- **Response Time**: <200ms average
- **Bundle Size**: Optimized JavaScript
- **Memory Usage**: <8GB deployment limit
- **Cache Hit Rate**: High with static asset caching

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- **Email**: joshsylvia@yahoo.com
- **GitHub**: https://github.com/joshsylvia-eng
- **Website**: [Deployed URL]

---

Built with ❤️ by Josh Sylvia - AI & Cybersecurity Expert
