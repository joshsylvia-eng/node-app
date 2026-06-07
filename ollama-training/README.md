# Ollama Fine-Tuning Setup for Josh Sylvia AI Assistant

## Overview
This setup creates a hybrid AI system that uses:
- **Ollama**: Fine-tuned Llama model with your resume data (for resume-related queries)
- **Groq**: General LLM for questions outside your expertise

## Prerequisites
- Ollama installed: https://ollama.ai/download
- Base Llama model: `ollama pull llama3.1:8b`
- Node.js server running

## Setup Instructions

### 1. Install Ollama
```bash
# Download and install from https://ollama.ai/download
# Verify installation
ollama --version
```

### 2. Pull Base Model
```bash
ollama pull llama3.1:8b
```

### 3. Create Fine-Tuned Model
```bash
# Navigate to training directory
cd ollama-training

# Create the custom model
ollama create josh-sylvia -f Modelfile

# Verify model creation
ollama list
```

### 4. Start Ollama Server
```bash
# Start Ollama server (usually runs automatically)
# If not running:
ollama serve

# Verify server is running
curl http://localhost:11434/api/tags
```

### 5. Test Fine-Tuned Model
```bash
# Test the model
ollama run josh-sylvia "What is your background?"

# Test via API
curl http://localhost:11434/api/generate -d '{
  "model": "josh-sylvia",
  "prompt": "What is your background?",
  "stream": false
}'
```

### 6. Restart Node.js Server
```bash
# Stop current server (Ctrl+C)
# Restart server
node server.js
```

## Training Data

The `training-data.jsonl` file contains Q&A pairs based on your resume:
- Background and experience
- Technical skills
- Work history (NSA, NASA, Barracuda)
- Cybersecurity expertise
- Cloud architecture
- DevOps automation
- AI development

## Hybrid Architecture

The agent automatically:
1. **Resume-related queries** → Uses Ollama fine-tuned model
2. **General queries** → Uses Groq LLM
3. **Fallback** → If Ollama unavailable, uses Groq

## Link Inclusion

The agent includes relevant links to:
- `https://joshsylvia.linkpc.net/about` (for skills, experience, background)
- `https://joshsylvia.linkpc.net/ai` (for AI, machine learning, chatbot)
- `https://joshsylvia.linkpc.net/apis` (for API, REST, endpoints)
- `https://joshsylvia.linkpc.net/qa` (for QA, testing)
- `https://joshsylvia.linkpc.net/contact` (for contact, email)

Links are included:
- On first request
- When query category changes

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Model not found
```bash
# Recreate model
ollama create josh-sylvia -f Modelfile

# Check available models
ollama list
```

### Fine-tuning not working
- Ensure training-data.jsonl is properly formatted
- Check Modfile syntax
- Verify base model is pulled

## Next Steps

1. Test the hybrid system with various queries
2. Add more training data if responses need improvement
3. Adjust system prompts for better responses
4. Monitor which model (Ollama vs Groq) is being used via console logs

## Files

- `training-data.jsonl` - Training data in JSONL format
- `Modelfile` - Ollama model configuration
- `README.md` - This file
