// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Load agent library
document.addEventListener('DOMContentLoaded', function() {
    const agentScript = document.createElement('script');
    agentScript.src = 'js/agent.js';
    agentScript.onload = function() {
        console.log('Agent library loaded successfully');
    };
    agentScript.onerror = function() {
        console.error('Failed to load agent library');
    };
    document.head.appendChild(agentScript);
});

// Get AI response using Agentic Architecture
async function getLLMResponse(userMessage) {
    try {
        // Check if agent is available
        if (typeof agent === 'undefined') {
            return "I'm experiencing technical difficulties with the AI agent system. Please ensure the agent library is loaded properly. As Josh Sylvia's AI assistant, I bring expertise in cybersecurity, cloud architecture, and AI development to solve your technical challenges.";
        }

        // Use agent to process the query
        const result = await agent.processQuery(userMessage);
        
        if (result.success) {
            console.log('Agent tools used:', result.toolsUsed);
            console.log('Agent tool results:', result.toolResults);
            return result.response;
        } else {
            console.error('Agent processing failed:', result.error);
            return "I apologize, but I'm experiencing technical difficulties with the AI agent system. As Josh Sylvia's AI assistant, I can still help with general questions about cybersecurity, cloud architecture, and AI development based on my training. Please try again later for more specific assistance.";
        }

    } catch (error) {
        console.error('Error in agentic AI system:', error);
        return "I apologize, but I'm experiencing technical difficulties with the AI agent system. As Josh Sylvia's AI assistant, I can still help with general questions about cybersecurity, cloud architecture, and AI development based on my training. Please try again later for more specific assistance.";
    }
}

// Chat functionality
function sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    console.log('Sending message:', input.value);
    if (input.value.trim() === '') return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.style.cssText = 'margin-bottom: 15px; padding: 12px; background: #4A90E2; border-radius: 10px; color: #ffffff;';
    userMessage.innerHTML = `<strong>You:</strong> ${input.value}`;
    messages.appendChild(userMessage);
    
    // Get AI response from LLM
    setTimeout(async () => {
        // Show thinking indicator
        const aiMessage = document.createElement('div');
        aiMessage.style.cssText = 'margin-bottom: 15px; padding: 12px; background: #87CEEB; border-radius: 10px; color: #ffffff;';
        aiMessage.innerHTML = '<strong>AI Assistant:</strong> <em>(thinking...)</em>';
        messages.appendChild(aiMessage);
        messages.scrollTop = messages.scrollHeight;
        
        console.log('Waiting for LLM response...');
        const llmResponse = await getLLMResponse(input.value);
        console.log('LLM response received:', llmResponse);
        
        // Update with actual response
        setTimeout(() => {
            aiMessage.innerHTML = `<strong>AI Assistant:</strong> ${llmResponse}`;
            messages.scrollTop = messages.scrollHeight;
        }, 1500); // Show thinking for 1.5 seconds
    }, 1000);
    
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

// Load shared navigation component
async function loadNavigation() {
    try {
        const response = await fetch('components/navigation.html');
        const navigationHTML = await response.text();
        document.getElementById('navigation-container').innerHTML = navigationHTML;
        
        // Set active page based on current URL
        setActiveNavigation();
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

// Initialize OpenAI library when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('OpenAI library loading...');
    if (typeof OpenAI !== 'undefined') {
        console.log('OpenAI library loaded successfully');
    } else {
        console.error('OpenAI library not loaded - waiting for library...');
        // Retry after delay
        setTimeout(() => {
            if (typeof OpenAI !== 'undefined') {
                console.log('OpenAI library loaded after retry');
            } else {
                console.error('OpenAI library still not available');
            }
        }, 2000);
    }
});

// Set active navigation link based on current page
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    // Remove active classes
    navLinks.forEach(link => link.classList.remove('active'));
    sidebarLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to current page links
    if (currentPage === 'ai.html' || currentPage === '') {
        document.querySelector('.nav-link[href="ai.html"]')?.classList.add('active');
        document.querySelector('.sidebar-link[href="ai.html"]')?.classList.add('active');
    } else if (currentPage === 'about.html') {
        document.querySelector('.nav-link[href="about.html"]')?.classList.add('active');
        document.querySelector('.sidebar-link[href="about.html"]')?.classList.add('active');
    } else if (currentPage === 'tutorials.html') {
        document.querySelector('.nav-link[href="tutorials.html"]')?.classList.add('active');
        document.querySelector('.sidebar-link[href="tutorials.html"]')?.classList.add('active');
    } else if (currentPage === 'contact.html') {
        document.querySelector('.nav-link[href="contact.html"]')?.classList.add('active');
        document.querySelector('.sidebar-link[href="contact.html"]')?.classList.add('active');
    }
}

// Add toggleSidebar function for mobile menu
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (window.innerWidth <= 768 && 
        sidebar && 
        !sidebar.contains(event.target) && 
        !navToggle.contains(event.target) && 
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// Load navigation when page loads
document.addEventListener('DOMContentLoaded', loadNavigation);
