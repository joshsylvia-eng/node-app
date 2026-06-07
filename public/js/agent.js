// Agentic AI Architecture for Josh Sylvia's AI Assistant
// Uses Groq LLM with tool-calling capabilities

class AgenticAI {
    constructor() {
        this.tools = {
            search: this.searchTool.bind(this),
            getSkills: this.getSkillsTool.bind(this),
            getExperience: this.getExperienceTool.bind(this),
            getContact: this.getContactTool.bind(this)
        };
        this.toolDescriptions = {
            search: "Search the knowledge base for information about technologies, projects, and expertise",
            getSkills: "Get detailed information about Josh Sylvia's technical skills and expertise",
            getExperience: "Get information about Josh Sylvia's professional experience and work history",
            getContact: "Get contact information for Josh Sylvia"
        };
        this.currentCategory = null;
        this.baseUrl = 'https://joshsylvia.linkpc.net';
        this.categoryLinks = {
            'about': '/about',
            'skills': '/about',
            'experience': '/about',
            'background': '/about',
            'ai': '/ai',
            'artificial intelligence': '/ai',
            'machine learning': '/ai',
            'chatbot': '/ai',
            'api': '/apis',
            'rest': '/apis',
            'endpoint': '/apis',
            'cybersecurity': '/about',
            'security': '/about',
            'cloud': '/about',
            'devops': '/about',
            'tutorials': '/tutorials',
            'qa': '/qa',
            'contact': '/contact'
        };
        
        // API call queue and rate limiting
        this.apiQueue = [];
        this.isProcessingQueue = false;
        this.lastApiCallTime = 0;
        this.minApiCallInterval = 500; // 500ms between API calls
    }

    // Delay function for rate limiting
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Rate limiter for API calls
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastApiCallTime;
        
        if (timeSinceLastCall < this.minApiCallInterval) {
            const waitTime = this.minApiCallInterval - timeSinceLastCall;
            await this.delay(waitTime);
        }
        
        this.lastApiCallTime = Date.now();
    }

    // Tool: Search the knowledge base
    async searchTool(query) {
        try {
            const response = await fetch('/api/agent-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            const data = await response.json();
            return {
                success: true,
                data: data.results || [],
                query: query
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                query: query
            };
        }
    }

    // Tool: Get skills information
    async getSkillsTool() {
        try {
            const response = await fetch('/api/agent-skills');
            const data = await response.json();
            return {
                success: true,
                data: data.skills || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Tool: Get experience information
    async getExperienceTool() {
        try {
            const response = await fetch('/api/agent-experience');
            const data = await response.json();
            return {
                success: true,
                data: data.experience || []
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Tool: Get contact information
    async getContactTool() {
        try {
            const response = await fetch('/api/agent-contact');
            const data = await response.json();
            return {
                success: true,
                data: data.contact || {}
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Agent decision-making: Determine which tools to use
    async determineTools(userQuery) {
        const query = userQuery.toLowerCase();
        const toolsToUse = [];

        // Check if query is about skills
        if (query.includes('skill') || query.includes('technology') || query.includes('programming') || 
            query.includes('language') || query.includes('framework') || query.includes('database')) {
            toolsToUse.push('getSkills');
        }

        // Check if query is about experience
        if (query.includes('experience') || query.includes('work') || query.includes('job') || 
            query.includes('career') || query.includes('company') || query.includes('nsa') || 
            query.includes('nasa') || query.includes('barracuda')) {
            toolsToUse.push('getExperience');
        }

        // Check if query is about contact
        if (query.includes('contact') || query.includes('email') || query.includes('reach') || 
            query.includes('message') || query.includes('hire')) {
            toolsToUse.push('getContact');
        }

        // Always use search for general queries
        if (toolsToUse.length === 0 || query.includes('what') || query.includes('how') || 
            query.includes('tell') || query.includes('explain') || query.includes('about')) {
            toolsToUse.push('search');
        }

        return toolsToUse;
    }

    // Execute tools and gather results
    async executeTools(tools, userQuery) {
        const results = {};
        
        for (const toolName of tools) {
            if (this.tools[toolName]) {
                if (toolName === 'search') {
                    results[toolName] = await this.tools[toolName](userQuery);
                } else {
                    results[toolName] = await this.tools[toolName]();
                }
            }
        }
        
        return results;
    }

    // Generate context from tool results
    generateContext(toolResults) {
        let context = '';
        
        if (toolResults.search && toolResults.search.success && toolResults.search.data.length > 0) {
            context += '\nRELEVANT SEARCH RESULTS:\n';
            toolResults.search.data.forEach((result, index) => {
                context += `${index + 1}. ${result.title}: ${result.description}\n`;
                if (result.keywords) {
                    context += `   Keywords: ${result.keywords.join(', ')}\n`;
                }
            });
        }

        if (toolResults.getSkills && toolResults.getSkills.success && toolResults.getSkills.data.length > 0) {
            context += '\nTECHNICAL SKILLS:\n';
            toolResults.getSkills.data.forEach(skill => {
                context += `- ${skill.category}: ${skill.skills.join(', ')}\n`;
            });
        }

        if (toolResults.getExperience && toolResults.getExperience.success && toolResults.getExperience.data.length > 0) {
            context += '\nPROFESSIONAL EXPERIENCE:\n';
            toolResults.getExperience.data.forEach(exp => {
                context += `- ${exp.company}: ${exp.role}\n`;
                context += `  ${exp.description}\n`;
            });
        }

        if (toolResults.getContact && toolResults.getContact.success) {
            const contact = toolResults.getContact.data;
            context += `\nCONTACT INFO:\n`;
            context += `- Email: ${contact.email}\n`;
            if (contact.phone) context += `- Phone: ${contact.phone}\n`;
            if (contact.linkedin) context += `- LinkedIn: ${contact.linkedin}\n`;
        }

        return context;
    }

    // Determine category from query
    determineCategory(query) {
        const queryLower = query.toLowerCase();
        for (const [keyword, link] of Object.entries(this.categoryLinks)) {
            if (queryLower.includes(keyword)) {
                return keyword;
            }
        }
        return null;
    }

    // Get relevant link for category
    getRelevantLink(category) {
        if (category && this.categoryLinks[category]) {
            return this.baseUrl + this.categoryLinks[category];
        }
        return null;
    }

    // Main agent processing function
    async processQuery(userQuery) {
        try {
            // Step 1: Determine which tools to use
            const toolsToUse = await this.determineTools(userQuery);
            
            // Step 2: Execute tools
            const toolResults = await this.executeTools(toolsToUse, userQuery);
            
            // Step 3: Generate context from tool results
            const context = this.generateContext(toolResults);
            
            // Step 4: Determine category for link inclusion
            const category = this.determineCategory(userQuery);
            const categoryChanged = category !== this.currentCategory;
            const isFirstRequest = this.currentCategory === null;
            
            // Step 5: Get relevant link if category changed or first request
            let relevantLink = null;
            if (isFirstRequest || categoryChanged) {
                relevantLink = this.getRelevantLink(category);
                this.currentCategory = category;
            }
            
            // Step 6: Call LLM with context and link
            const llmResponse = await this.callLLM(userQuery, context, toolsToUse, relevantLink);
            
            return {
                success: true,
                response: llmResponse,
                toolsUsed: toolsToUse,
                toolResults: toolResults,
                relevantLink: relevantLink
            };
        } catch (error) {
            console.error('Agent processing error:', error);
            return {
                success: false,
                error: error.message,
                response: "I apologize, but I'm experiencing technical difficulties. Please try again later."
            };
        }
    }

    // Call LLM with context (Hybrid: Ollama for resume, Groq for general)
    async callLLM(userQuery, context, toolsUsed, relevantLink) {
        try {
            // Check if OpenAI library is loaded
            if (typeof OpenAI === 'undefined') {
                return "I'm experiencing technical difficulties with the AI library, but I'm here to help with your technology questions! As Josh Sylvia's AI assistant, I bring expertise in cybersecurity, cloud architecture, and AI development to solve your technical challenges.";
            }

            let linkInstruction = '';
            if (relevantLink) {
                linkInstruction = `\n\nIMPORTANT: Include this relevant link at the end of your response: ${relevantLink}`;
            }

            const systemPrompt = `You are Josh Sylvia, an expert AI assistant specializing in cybersecurity, cloud architecture, DevOps automation, and AI development. You have extensive experience in machine learning, natural language processing, and building intelligent systems that solve complex technical problems.

You are an AGENTIC AI assistant that uses tools to gather information before responding. You have access to the following tools: ${toolsUsed.join(', ')}.

${context}

IMPORTANT: Keep your responses CONCISE - maximum 4-5 sentences. Be direct and to the point. Do not provide lengthy explanations or dump all information at once. Answer the specific question asked. If you don't have specific information from the tools, provide a brief, helpful response based on your training about cybersecurity, cloud architecture, and AI development.${linkInstruction}`;

            // Try Ollama first for resume-related queries
            const isResumeQuery = this.isResumeRelated(userQuery);
            
            if (isResumeQuery) {
                try {
                    const ollamaResponse = await this.callOllama(userQuery, systemPrompt);
                    if (ollamaResponse) {
                        console.log('Using Ollama for resume-related query');
                        return ollamaResponse;
                    }
                } catch (ollamaError) {
                    console.log('Ollama not available, falling back to Groq:', ollamaError);
                }
            }

            // Fallback to Groq
            console.log('Using Groq for query');
            return await this.callGroq(userQuery, systemPrompt);

        } catch (error) {
            console.error('Error in hybrid LLM system:', error);
            return "I apologize, but I'm experiencing technical difficulties with the AI service. As Josh Sylvia's AI assistant, I can still help with general questions about cybersecurity, cloud architecture, and AI development based on my training. Please try again later for more specific assistance.";
        }
    }

    // Check if query is resume-related
    isResumeRelated(query) {
        const resumeKeywords = ['background', 'experience', 'skills', 'about', 'resume', 'career', 'work', 'job', 'nsa', 'nasa', 'barracuda', 'company'];
        const queryLower = query.toLowerCase();
        return resumeKeywords.some(keyword => queryLower.includes(keyword));
    }

    // Call Ollama API
    async callOllama(userQuery, systemPrompt) {
        try {
            // Apply rate limiting
            await this.rateLimit();
            
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'josh-sylvia',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userQuery }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('Ollama API request failed');
            }

            const data = await response.json();
            return data.message.content;
        } catch (error) {
            console.error('Ollama error:', error);
            throw error;
        }
    }

    // Call Groq API
    async callGroq(userQuery, systemPrompt) {
        try {
            // Apply rate limiting
            await this.rateLimit();
            
            // Get API key from server
            const response = await fetch('/api/groq-key');
            const { apiKey } = await response.json();
            
            if (!apiKey || apiKey === 'your_groq_api_key_here') {
                return "I'm currently in demo mode. To use the full AI capabilities, please configure your Groq API key. As Josh Sylvia's AI assistant, I bring expertise in cybersecurity, cloud architecture, and AI development to solve your technical challenges.";
            }

            const client = new OpenAI({
                apiKey: apiKey,
                baseURL: 'https://api.groq.com/openai/v1',
                dangerouslyAllowBrowser: true
            });

            const llmResponse = await client.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userQuery
                    }
                ],
                max_tokens: 400,
                temperature: 0.7
            });

            return llmResponse.choices[0].message.content;

        } catch (error) {
            console.error('Error calling Groq API:', error);
            throw error;
        }
    }
}

// Create global agent instance
const agent = new AgenticAI();
