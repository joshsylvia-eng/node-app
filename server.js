// Load path module first to ensure availability
var path            = require('path');

// modules =================================================
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var compression     = require('compression');
var http            = require('http');
var rateLimit       = require('express-rate-limit');
require('dotenv').config();

// Enhanced logging for deployment debugging
console.log('=== SERVER STARTUP DEBUGGING ===');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Path module loaded:', typeof path !== 'undefined');
console.log('Path.extname function:', typeof path.extname === 'function');
console.log('Working directory:', __dirname);
console.log('=== END DEBUGGING ===');

// configuration ===========================================

// PostgreSQL Database Configuration
// Database connection is handled in config/database.js
var port = process.env.PORT || 8080; // set our port



// Enable gzip compression
app.use(compression());

// Redirect all traffic to Cloudflare Pages (must be before static files)
const CLOUDFLARE_URL = 'https://cloudflare-jsylvia.pages.dev';
app.use((req, res, next) => {
    // Redirect all traffic to Cloudflare Pages
    return res.redirect(301, CLOUDFLARE_URL + req.url);
});

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Parse request bodies
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Override HTTP methods
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

// Serve static files with optimized caching headers
app.use(express.static(__dirname + '/public', {
    maxAge: '7d', // Cache for 7 days
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      console.log('=== STATIC FILE DEBUGGING ===');
      console.log('File path:', filePath);
      console.log('Path module available:', typeof path !== 'undefined');
      console.log('Path.extname available:', typeof path.extname === 'function');
      console.log('=== END STATIC DEBUG ===');
      
      if (path.extname(filePath) === '.js') {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (path.extname(filePath) === '.css') {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      } else if (path.extname(filePath) === '.html') {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
      return res;
    }
}));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// SSL certificate management
const fs = require('fs');
const sslDir = path.join(__dirname, 'ssl');

// Ensure SSL directory exists
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('Created SSL directory');
}

// CDN integration for static assets
const cdnMiddleware = (req, res, next) => {
    // Serve static files from CDN in production
    if (process.env.NODE_ENV === 'production') {
        const cdnUrl = 'https://cdn.jsdelivr.net';
        res.setHeader('X-CDN-Cache-Control', 'public, max-age=31536000');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    next();
};

// Performance monitoring
const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request processed in ${duration}ms`);
    });
    next();
};

// routes ==================================================
	// Basic API routes for AI functionality
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI Chatbot Server is running',
    timestamp: new Date().toISOString()
  });
});

// Resume download endpoint
app.get('/api/resume', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const resumePath = path.join(__dirname, 'data', 'res', 'joshsylvia_resume_26.pdf');
  
  if (fs.existsSync(resumePath)) {
    res.download(resumePath, 'Josh_Sylvia_Resume.pdf');
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Resume file not found' 
    });
  }
});


// Cache for videos data
let videosCache = null;
let cacheTimeout = null;

// Videos API endpoint
app.get('/api/videos', async (req, res) => {
  try {
    // Check cache first
    if (videosCache && cacheTimeout && Date.now() - cacheTimeout < 300000) { // 5 minutes cache
      console.log('Returning cached videos data');
      return res.json(videosCache);
    }
    
    const fs = require('fs');
    const path = require('path');
    const videosDataFile = path.join(__dirname, 'data', 'videos.json');
    
    let content = [];
    let videos = [];
    
    // Read videos from JSON file
    if (fs.existsSync(videosDataFile)) {
      const videosData = fs.readFileSync(videosDataFile, 'utf8');
      videos = JSON.parse(videosData);
      content = content.concat(videos);
      console.log(`Loaded ${videos.length} videos from JSON file`);
      
      // Update cache
      videosCache = {
        data: content,
        timestamp: Date.now()
      };
      cacheTimeout = Date.now();
    }
    
    // Add GitHub repositories
    const githubRepos = [
      {
        title: 'Metasploit Framework',
        description: 'The world\'s most used penetration testing framework. Advanced exploitation framework for security professionals and ethical hackers.',
        youtube_id: '',
        location: 'Cybersecurity Tools',
        tags: ['cybersecurity', 'penetration testing', 'security', 'metasploit'],
        is_featured: false,
        type: 'github',
        category: 'cybersecurity',
        file_path: 'https://github.com/rapid7/metasploit-framework',
        file_size: 0,
        duration: 0,
        created_at: '2024-01-15T00:00:00Z'
      },
      {
        title: 'OSQuery',
        description: 'SQL powered operating system instrumentation and monitoring. Query your devices like a database for security monitoring and compliance.',
        youtube_id: '',
        location: 'Security Monitoring',
        tags: ['security', 'monitoring', 'siem', 'osquery'],
        is_featured: false,
        type: 'github',
        category: 'cybersecurity',
        file_path: 'https://github.com/osquery/osquery',
        file_size: 0,
        duration: 0,
        created_at: '2024-01-20T00:00:00Z'
      },
      {
        title: 'Security Tools for Developers',
        description: 'Comprehensive collection of security tools and resources for developers. Essential security utilities for modern software development.',
        youtube_id: '',
        location: 'Developer Security',
        tags: ['security', 'development', 'tools', 'devsecops'],
        is_featured: false,
        type: 'github',
        category: 'cybersecurity',
        file_path: 'https://github.com/erev0s/Security-Tools-for-Developers',
        file_size: 0,
        duration: 0,
        created_at: '2024-01-25T00:00:00Z'
      },
      {
        title: 'Terraform Provider AWS',
        description: 'Official Terraform AWS provider for infrastructure as code. Manage AWS resources with declarative configuration files.',
        youtube_id: '',
        location: 'Cloud Infrastructure',
        tags: ['aws', 'terraform', 'infrastructure', 'devops'],
        is_featured: false,
        type: 'github',
        category: 'cloud-devops',
        file_path: 'https://github.com/hashicorp/terraform-provider-aws',
        file_size: 0,
        duration: 0,
        created_at: '2024-02-01T00:00:00Z'
      },
      {
        title: 'Kubernetes',
        description: 'Production-grade container orchestration platform. Automate deployment, scaling, and management of containerized applications.',
        youtube_id: '',
        location: 'Container Orchestration',
        tags: ['kubernetes', 'containers', 'orchestration', 'devops'],
        is_featured: false,
        type: 'github',
        category: 'cloud-devops',
        file_path: 'https://github.com/kubernetes/kubernetes',
        file_size: 0,
        duration: 0,
        created_at: '2024-02-05T00:00:00Z'
      },
      {
        title: 'Next.js',
        description: 'The React framework for production. Full-stack React framework with server-side rendering, routing, and more.',
        youtube_id: '',
        location: 'Frontend Framework',
        tags: ['react', 'nextjs', 'frontend', 'javascript'],
        is_featured: false,
        type: 'github',
        category: 'fullstack',
        file_path: 'https://github.com/vercel/next.js',
        file_size: 0,
        duration: 0,
        created_at: '2024-02-10T00:00:00Z'
      },
      {
        title: 'Express.js',
        description: 'Fast, unopinionated web framework for Node.js. Minimal and flexible Node.js web application framework.',
        youtube_id: '',
        location: 'Backend Framework',
        tags: ['nodejs', 'express', 'backend', 'api'],
        is_featured: false,
        type: 'github',
        category: 'fullstack',
        file_path: 'https://github.com/expressjs/express',
        file_size: 0,
        duration: 0,
        created_at: '2024-02-15T00:00:00Z'
      },
      {
        title: 'LangChain',
        description: 'Building applications with LLMs through composability. Framework for developing applications powered by large language models.',
        youtube_id: '',
        location: 'AI & LLM Framework',
        tags: ['ai', 'llm', 'langchain', 'machine learning'],
        is_featured: false,
        type: 'github',
        category: 'ai-rag',
        file_path: 'https://github.com/langchain-ai/langchain',
        file_size: 0,
        duration: 0,
        created_at: '2024-02-20T00:00:00Z'
      }
    ];
    
    content = content.concat(githubRepos);
    console.log(`Serving ${content.length} total items (${videos.length} videos + ${githubRepos.length} GitHub repos)`);
    
    // Update cache before sending response
    videosCache = {
      data: content,
      timestamp: Date.now()
    };
    cacheTimeout = Date.now();
    
    res.json(content);
    
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch content' 
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, Email, Subject, and Message are required' 
      });
    }

    // Get email from environment variables
    const recipientEmail = process.env.CONTACT_EMAIL || 'joshsylvia@yahoo.com';
    
    console.log('Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('To:', recipientEmail);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    
    // Import Resend for email sending
    const { Resend } = require('resend');
    
    // Check for Resend credentials
    const API_KEY = process.env.RESEND_API_KEY;
    
    let resend;
    
    if (!API_KEY || API_KEY === 'your-resend-api-key') {
      console.log('Resend API key not configured in .env file');
      console.log('Email sending disabled - using development mode');
      resend = null;
    } else {
      try {
        resend = new Resend(API_KEY);
        console.log('Resend client configured successfully');
      } catch (error) {
        console.error('Failed to create Resend client:', error);
        resend = null;
        console.log('Email sending disabled - using development mode');
      }
    }
    
    // Send email using Resend
    if (resend) {
      try {
        console.log('Attempting to send email via Resend...');
        
        const response = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: recipientEmail,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333; margin-bottom: 10px;">New Contact Form Submission</h2>
                <p style="color: #666; line-height: 1.5;"><strong>Name:</strong> ${name}</p>
                <p style="color: #666; line-height: 1.5;"><strong>Email:</strong> ${email}</p>
                <p style="color: #666; line-height: 1.5;"><strong>Subject:</strong> ${subject}</p>
                <p style="color: #666; line-height: 1.5;"><strong>Message:</strong></p>
                <div style="background: #fff; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${message}
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Sent from: ${req.ip || 'Unknown IP'}</p>
                <p style="color: #999; font-size: 12px;">Date: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        });
        
        console.log('Resend response:', response);
        
        res.json({ 
          success: true, 
          message: 'Message received successfully. Email sent to ' + recipientEmail 
        });
        
      } catch (error) {
        console.error('Resend error:', error);
        console.log('Email sending failed, but logging submission for reference');
        
        // Log the submission even if email fails
        console.log('Contact Form Submission (email failed):');
        console.log('To:', recipientEmail);
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('Timestamp:', new Date().toISOString());
        
        // Return success anyway - form submission is logged
        res.json({ 
          success: true, 
          message: 'Message received successfully' 
        });
      }
    } else {
      // Development mode - just log and return success
      console.log('Development mode - logging email submission only');
      console.log('Contact Form Submission:');
      console.log('To:', recipientEmail);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      
      res.json({ 
        success: true, 
        message: 'Message received successfully' 
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process contact form' 
    });
  }
});

// Agent API endpoints for Agentic AI
app.get('/api/groq-key', (req, res) => {
  const apiKey = process.env.GROQ_API_KEY || 'your_groq_api_key_here';
  res.json({ apiKey: apiKey });
});

// Ollama status check endpoint
app.get('/api/ollama-status', (req, res) => {
  res.json({ 
    status: 'configured',
    message: 'Ollama should be running on localhost:11434',
    model: 'josh-sylvia'
  });
});

app.post('/api/agent-search', (req, res) => {
  try {
    const { query } = req.body;
    
    // Server-side search index (duplicate of browser search index)
    const searchIndex = [
        // Pages
        { id: 1, title: 'Home', category: 'page', url: 'index.html', description: 'Josh Sylvia - Principal Software Engineer & Technology Innovator homepage with CISSP certification', keywords: ['josh', 'sylvia', 'principal', 'software', 'engineer', 'technology', 'innovator', 'cissp', 'certified', 'cybersecurity', 'home', 'portfolio'] },
        { id: 2, title: 'AI Chatbot', category: 'page', url: 'ai.html', description: 'AI-powered chatbot with OpenAI and Groq integration', keywords: ['ai', 'artificial', 'intelligence', 'chatbot', 'openai', 'groq', 'machine', 'learning', 'automation'] },
        { id: 3, title: 'APIs', category: 'page', url: 'apis.html', description: 'REST API documentation and integration guides', keywords: ['api', 'rest', 'endpoint', 'service', 'web', 'integration', 'documentation'] },
        { id: 4, title: 'QA', category: 'page', url: 'qa.html', description: 'Quality assurance and testing resources', keywords: ['qa', 'quality', 'assurance', 'testing', 'questions', 'answers', 'debugging'] },
        { id: 5, title: 'Tutorials', category: 'page', url: 'tutorials.html', description: 'Video tutorials and learning resources', keywords: ['tutorial', 'guide', 'how', 'to', 'learn', 'video', 'github', 'education'] },
        { id: 6, title: 'About', category: 'page', url: 'about.html', description: 'Professional background and experience', keywords: ['about', 'bio', 'background', 'experience', 'skills', 'career', 'resume'] },
        { id: 7, title: 'Contact', category: 'page', url: 'contact.html', description: 'Contact information and message form', keywords: ['contact', 'email', 'message', 'reach', 'out', 'communication'] },
        
        // Technologies and Skills
        { id: 8, title: 'CISSP Certification', category: 'certification', url: 'index.html', description: 'Certified Information Systems Security Professional (CISSP) - Certificate Number: 2273572', keywords: ['cissp', 'certified', 'information', 'systems', 'security', 'professional', 'certificate', '2273572', 'cybersecurity'] },
        { id: 9, title: 'Node.js Development', category: 'technology', url: 'apis.html', description: 'Server-side JavaScript development with Express.js', keywords: ['nodejs', 'javascript', 'express', 'server', 'backend', 'development'] },
        { id: 10, title: 'React Frontend', category: 'technology', url: 'tutorials.html', description: 'Modern React applications with hooks and components', keywords: ['react', 'frontend', 'javascript', 'components', 'hooks', 'ui'] },
        { id: 11, title: 'Cloud Architecture', category: 'technology', url: 'index.html', description: 'AWS, Azure, and Google Cloud platform expertise', keywords: ['cloud', 'aws', 'azure', 'gcp', 'architecture', 'infrastructure', 'devops', 'devsecops'] },
        { id: 12, title: 'Database Design', category: 'technology', url: 'apis.html', description: 'PostgreSQL, MongoDB, and database optimization', keywords: ['database', 'postgresql', 'mongodb', 'sql', 'nosql', 'optimization'] },
        
        // Programming Languages & Frameworks
        { id: 24, title: 'Programming Languages', category: 'skill', url: 'about.html', description: 'Angular, React, C, C++, C#, Java, Kotlin, Objective-C, Perl, Python, Go, HTML, CSS, Shell, JavaScript, Swift', keywords: ['angular', 'react', 'c', 'c++', 'c#', 'java', 'kotlin', 'objective-c', 'perl', 'python', 'go', 'html', 'css', 'shell', 'javascript', 'swift', 'programming', 'languages', 'frameworks'] },
        
        // Operating Systems
        { id: 25, title: 'Operating Systems', category: 'skill', url: 'about.html', description: 'Linux (RedHat/Debian), Unix, Mac, Android, iOS, Windows Server', keywords: ['linux', 'redhat', 'debian', 'unix', 'mac', 'android', 'ios', 'windows', 'server', 'operating', 'systems', 'os'] },
        
        // Databases
        { id: 26, title: 'Databases', category: 'skill', url: 'about.html', description: 'SQL, MySQL, PostgreSQL, MongoDB, Elasticsearch', keywords: ['sql', 'mysql', 'postgresql', 'mongodb', 'elasticsearch', 'database', 'nosql', 'data', 'storage'] },
        
        // Cloud & DevOps
        { id: 27, title: 'Cloud & DevOps', category: 'skill', url: 'about.html', description: 'AWS, Azure, Google Cloud, EC2, S3, NiFi, Kafka, Terraform, VPNs, Docker, Kubernetes, Microservices, Git, CI/CD, DevSecOps', keywords: ['aws', 'azure', 'google', 'cloud', 'ec2', 's3', 'nifi', 'kafka', 'terraform', 'vpn', 'docker', 'kubernetes', 'microservices', 'git', 'cicd', 'devsecops', 'devops', 'infrastructure', 'automation'] },
        
        // Computer Networking
        { id: 28, title: 'Computer Networking', category: 'skill', url: 'about.html', description: 'OSI Model, Network Security Communication, OSPF, IGRP, EIGRP, BGP, VLAN, VRRP, InterVLAN Routing, STP, IPsec Tunneling, Load Balancers, Wireshark', keywords: ['osi', 'model', 'network', 'security', 'communication', 'ospf', 'igrp', 'eigrp', 'bgp', 'vlan', 'vrrp', 'intervlan', 'routing', 'stp', 'ipsec', 'tunneling', 'load', 'balancers', 'wireshark', 'networking', 'protocols'] },
        
        // Testing
        { id: 29, title: 'Testing', category: 'skill', url: 'about.html', description: 'UI Testing, API Testing, White Box Testing, Black Box Testing, Unit Testing, Test Automation, SAST, DAST, User Acceptance Testing (UAT), Integration Testing, Regression Testing, Ansible', keywords: ['ui', 'testing', 'api', 'testing', 'white', 'box', 'black', 'box', 'unit', 'testing', 'test', 'automation', 'sast', 'dast', 'uat', 'user', 'acceptance', 'testing', 'integration', 'testing', 'regression', 'testing', 'ansible', 'qa', 'quality', 'assurance'] },
        
        // Software Development Lifecycle
        { id: 30, title: 'Software Development Lifecycle', category: 'skill', url: 'about.html', description: 'SDLC, Scrum, Agile, JIRA, Confluence', keywords: ['sdlc', 'scrum', 'agile', 'jira', 'confluence', 'development', 'lifecycle', 'project', 'management', 'methodology'] },
        
        // Development Tools
        { id: 31, title: 'Development Tools', category: 'skill', url: 'about.html', description: 'IntelliJ, PyCharm, StarUML, AutoCAD, PSpice, Xcode, Android Studio, Eclipse, NetBeans, Splunk, SwiftUI, Visio, Jupyter Notebook, MS Office', keywords: ['intellij', 'pycharm', 'staruml', 'autocad', 'pspice', 'xcode', 'android', 'studio', 'eclipse', 'netbeans', 'splunk', 'swiftui', 'visio', 'jupyter', 'notebook', 'ms', 'office', 'development', 'tools', 'ide'] },
        
        // Cloud Architecture
        { id: 32, title: 'Cloud Architecture Models', category: 'skill', url: 'about.html', description: 'IaaS, PaaS, DaaS, SaaS, FaaS, VPC, SASE', keywords: ['iaas', 'paas', 'daas', 'saas', 'faas', 'vpc', 'sase', 'cloud', 'architecture', 'models', 'infrastructure', 'platform', 'service'] },
        
        // Security and Security Controls
        { id: 33, title: 'Security and Security Controls', category: 'skill', url: 'about.html', description: 'RBAC, DAC, Gap Analysis, CVEs, Threat Modeling, Cyber Threat Intelligence, Metrics, KPIs, KPI Metrics, KPI Analysis, Log Data Analysis, API Security, Security as Code, Cloud Security, Security Testing, SOC, SOC2, FedRAMP, Web Application Security, RMF Process, Incident Response, IAM, Risk Management, PII, PHI, EDR, DLP, MDR, Change Management, Configuration Management, HIPAA, GDPR, CCPA, SLA, Root Cause Analysis, SIEM, SOAR', keywords: ['rbac', 'dac', 'gap', 'analysis', 'cves', 'threat', 'modeling', 'cyber', 'threat', 'intelligence', 'metrics', 'kpis', 'kpi', 'metrics', 'kpi', 'analysis', 'log', 'data', 'analysis', 'api', 'security', 'security', 'as', 'code', 'cloud', 'security', 'security', 'testing', 'soc', 'soc2', 'fedramp', 'web', 'application', 'security', 'rmf', 'process', 'incident', 'response', 'iam', 'risk', 'management', 'pii', 'phi', 'edr', 'dlp', 'mdr', 'change', 'management', 'configuration', 'management', 'hipaa', 'gdpr', 'ccpa', 'sla', 'root', 'cause', 'analysis', 'siem', 'soar', 'cybersecurity', 'controls', 'compliance'] },
        
        // Generative AI
        { id: 34, title: 'Generative AI', category: 'skill', url: 'about.html', description: 'Windsurf, Claude, Copilot, ChatGPT, Gemini', keywords: ['windsurf', 'claude', 'copilot', 'chatgpt', 'gemini', 'generative', 'ai', 'artificial', 'intelligence', 'llm', 'language', 'model'] },
        
        // Projects and Tools
        { id: 13, title: 'Metasploit Framework', category: 'project', url: 'tutorials.html', description: 'Penetration testing framework for security professionals', keywords: ['metasploit', 'penetration', 'testing', 'security', 'framework', 'cybersecurity'] },
        { id: 14, title: 'OSQuery Monitoring', category: 'project', url: 'tutorials.html', description: 'SQL-powered operating system instrumentation and monitoring', keywords: ['osquery', 'monitoring', 'security', 'siem', 'instrumentation', 'sql'] },
        { id: 15, title: 'Kubernetes Orchestration', category: 'project', url: 'tutorials.html', description: 'Container orchestration and microservices management', keywords: ['kubernetes', 'containers', 'orchestration', 'microservices', 'docker'] },
        { id: 16, title: 'Terraform Infrastructure', category: 'project', url: 'tutorials.html', description: 'Infrastructure as code with Terraform and AWS provider', keywords: ['terraform', 'infrastructure', 'code', 'iac', 'aws', 'automation'] },
        
        // Security Topics
        { id: 17, title: 'DEFCON Conference', category: 'security', url: 'index.html', description: 'Regular attendee at DEFCON security conference', keywords: ['defcon', 'conference', 'security', 'hacking', 'cybersecurity', 'networking'] },
        { id: 18, title: 'Security Tools', category: 'security', url: 'tutorials.html', description: 'Collection of security tools and resources for developers', keywords: ['security', 'tools', 'devsecops', 'penetration', 'testing', 'vulnerability'] },
        { id: 19, title: 'Network Security', category: 'security', url: 'about.html', description: 'Network security implementation and best practices', keywords: ['network', 'security', 'firewall', 'vpn', 'encryption', 'protocols'] },
        
        // Development Topics
        { id: 20, title: 'Full Stack Development', category: 'development', url: 'about.html', description: 'End-to-end web application development', keywords: ['fullstack', 'full', 'stack', 'development', 'frontend', 'backend'] },
        { id: 21, title: 'API Development', category: 'development', url: 'apis.html', description: 'RESTful API design and implementation', keywords: ['api', 'development', 'rest', 'endpoint', 'microservices'] },
        { id: 22, title: 'Performance Optimization', category: 'development', url: 'tutorials.html', description: 'Application performance tuning and optimization', keywords: ['performance', 'optimization', 'tuning', 'caching', 'database'] },
        { id: 23, title: 'DevSecOps Practices', category: 'development', url: 'about.html', description: 'Security-integrated DevOps practices with automated security scanning, compliance automation, and shift-left security', keywords: ['devsecops', 'devops', 'security', 'automation', 'cicd', 'compliance', 'shift-left', 'security-as-code'] }
    ];
    
    const term = query.toLowerCase();
    const results = searchIndex.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(term);
      const descriptionMatch = item.description.toLowerCase().includes(term);
      const keywordsMatch = item.keywords.some(keyword => keyword.toLowerCase().includes(term));
      return titleMatch || descriptionMatch || keywordsMatch;
    }).slice(0, 10); // Limit to top 10 results
    
    res.json({ success: true, results: results });
  } catch (error) {
    console.error('Agent search error:', error);
    res.json({ success: true, results: [] }); // Return empty results on error
  }
});

app.get('/api/agent-skills', (req, res) => {
  try {
    // Extract skills from about.html structure
    const skills = [
      {
        category: 'Programming Languages & Frameworks',
        skills: ['Angular', 'React', 'C', 'C++', 'C#', 'Java', 'Kotlin', 'Objective-C', 'Perl', 'Python', 'Go', 'HTML', 'CSS', 'Shell', 'JavaScript', 'Swift']
      },
      {
        category: 'Operating Systems',
        skills: ['Linux (RedHat/Debian)', 'Unix', 'Mac', 'Android', 'iOS', 'Windows Server']
      },
      {
        category: 'Databases',
        skills: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Elasticsearch']
      },
      {
        category: 'Cloud & DevOps',
        skills: ['AWS', 'Azure', 'Google Cloud', 'EC2', 'S3', 'NiFi', 'Kafka', 'Terraform', 'VPNs', 'Docker', 'Kubernetes', 'Microservices', 'Git', 'CI/CD', 'DevSecOps']
      },
      {
        category: 'Computer Networking',
        skills: ['OSI Model', 'Network Security Communication', 'OSPF', 'IGRP', 'EIGRP', 'BGP', 'VLAN', 'VRRP', 'InterVLAN Routing', 'STP', 'IPsec Tunneling', 'Load Balancers', 'Wireshark']
      },
      {
        category: 'Testing',
        skills: ['UI Testing', 'API Testing', 'White Box Testing', 'Black Box Testing', 'Unit Testing', 'Test Automation', 'SAST', 'DAST', 'UAT', 'Integration Testing', 'Regression Testing', 'Ansible']
      },
      {
        category: 'Software Development Lifecycle',
        skills: ['SDLC', 'Scrum', 'Agile', 'JIRA', 'Confluence']
      },
      {
        category: 'Development Tools',
        skills: ['IntelliJ', 'PyCharm', 'StarUML', 'AutoCAD', 'PSpice', 'Xcode', 'Android Studio', 'Eclipse', 'NetBeans', 'Splunk', 'SwiftUI', 'Visio', 'Jupyter Notebook', 'MS Office']
      },
      {
        category: 'Cloud Architecture',
        skills: ['IaaS', 'PaaS', 'DaaS', 'SaaS', 'FaaS', 'VPC', 'SASE']
      },
      {
        category: 'Security and Security Controls',
        skills: ['RBAC', 'DAC', 'Gap Analysis', 'CVEs', 'Threat Modeling', 'Cyber Threat Intelligence', 'Metrics', 'KPIs', 'KPI Analysis', 'Log Data Analysis', 'API Security', 'Security as Code', 'Cloud Security', 'Security Testing', 'SOC', 'SOC2', 'FedRAMP', 'Web Application Security', 'RMF Process', 'Incident Response', 'IAM', 'Risk Management', 'PII', 'PHI', 'EDR', 'DLP', 'MDR', 'Change Management', 'Configuration Management', 'HIPAA', 'GDPR', 'CCPA', 'SLA', 'Root Cause Analysis', 'SIEM', 'SOAR']
      },
      {
        category: 'Generative AI',
        skills: ['Windsurf', 'Claude', 'Copilot', 'ChatGPT', 'Gemini']
      }
    ];
    
    res.json({ success: true, skills: skills });
  } catch (error) {
    console.error('Agent skills error:', error);
    res.json({ success: true, skills: [] });
  }
});

app.get('/api/agent-experience', (req, res) => {
  try {
    const experience = [
      {
        company: 'National Security Agency (NSA)',
        role: 'Senior Software Engineer',
        description: 'Developing classified cybersecurity solutions and intelligence systems'
      },
      {
        company: 'NASA',
        role: 'Senior Software Engineer',
        description: 'Building mission-critical systems for space exploration and scientific research'
      },
      {
        company: 'Barracuda Networks',
        role: 'Principal Engineer',
        description: 'Developing enterprise security appliances and cloud-based threat protection systems'
      }
    ];
    
    res.json({ success: true, experience: experience });
  } catch (error) {
    console.error('Agent experience error:', error);
    res.json({ success: true, experience: [] });
  }
});

app.get('/api/agent-contact', (req, res) => {
  try {
    const contact = {
      email: process.env.CONTACT_EMAIL || 'joshsylvia@yahoo.com',
      phone: null,
      linkedin: null
    };
    
    res.json({ success: true, contact: contact });
  } catch (error) {
    console.error('Agent contact error:', error);
    res.json({ success: true, contact: {} });
  }
});

app.use(function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});


/**
 * Create HTTP server.
 */

var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('AI Chatbot Server listening on ' + bind);
}

exports = module.exports = app;						// expose app
