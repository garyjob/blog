/**
 * Google Apps Script - AI Blog Drafter for Garyteh.com
 * 
 * This script provides a web app for drafting blog posts with voice input,
 * Grok AI conversation, and automatic publishing to GitHub Pages.
 */

// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

/**
 * Setup function - Run once to configure Script Properties
 * Go to Apps Script editor → Run → setupProperties
 */
function setupProperties() {
  const props = PropertiesService.getScriptProperties();
  
  // Set your email for access control
  props.setProperty('ALLOWED_EMAIL', 'your-email@gmail.com');
  
  // Set your Grok API key (get from https://x.ai/api)
  props.setProperty('GROK_KEY', 'your-grok-api-key-here');
  
  // Set your GitHub Personal Access Token
  // Create at: https://github.com/settings/tokens
  // Needs 'repo' scope
  props.setProperty('GITHUB_TOKEN', 'your-github-token-here');
  
  // GitHub repository details
  props.setProperty('GITHUB_OWNER', 'garyjob');
  props.setProperty('GITHUB_REPO', 'blog');
  props.setProperty('GITHUB_BRANCH', 'main');
  
  Logger.log('Properties configured! Update the values above with your actual credentials.');
}

// ============================================================================
// WEB APP ENTRY POINT
// ============================================================================

/**
 * Serves the HTML interface - Entry point for web app
 */
function doGet() {
  // Security check - only allow authorized email
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const allowedEmail = PropertiesService.getScriptProperties()
      .getProperty('ALLOWED_EMAIL') || '';
    
    if (allowedEmail && userEmail.toLowerCase() !== allowedEmail.toLowerCase()) {
      return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Access Denied</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 50px;
                background: #f5f5f5;
              }
              h1 { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1>🔒 Access Denied</h1>
            <p>This application is restricted to authorized users only.</p>
            <p><small>Your email: ${userEmail}</small></p>
          </body>
        </html>
      `);
    }
  } catch (e) {
    Logger.log('Error checking user: ' + e.toString());
  }
  
  // Authorized - serve the app
  try {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('AI Blog Drafter for Garyteh.com')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (e) {
    // If HTML file not found, return helpful error message
    Logger.log('Error loading Index.html: ' + e.toString());
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Setup Required - AI Blog Drafter</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f5f5f5;
            }
            .error-box {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #e74c3c; margin-bottom: 20px; }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            ol {
              text-align: left;
              margin: 20px 0;
            }
            li {
              margin: 10px 0;
            }
            .highlight {
              background: #fff3cd;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid #ffc107;
            }
          </style>
        </head>
        <body>
          <div class="error-box">
            <h1>⚠️ HTML File Not Found</h1>
            <p>The HTML file named <code>Index</code> is missing from your Apps Script project.</p>
            <div class="highlight">
              <p><strong>To fix this:</strong></p>
              <ol>
                <li>Go to <a href="https://script.google.com" target="_blank">script.google.com</a></li>
                <li>Open your Apps Script project</li>
                <li>Click the <strong>+</strong> button next to "Files" (top left)</li>
                <li>Select <strong>HTML</strong></li>
                <li>Name it exactly: <code>Index</code> (capital I, no .html extension)</li>
                <li>Copy the contents from <code>Index.html</code> in your local repository</li>
                <li>Paste into the HTML file in Apps Script</li>
                <li>Click <strong>Save</strong></li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <p><small>Error: ${escapeHtml(e.toString().substring(0, 200))}</small></p>
          </div>
        </body>
      </html>
    `);
  }
}

// ============================================================================
// GROK AI INTEGRATION
// ============================================================================

/**
 * Test function to debug Grok API - Run this from Apps Script editor
 * View → Execution log to see detailed logs
 */
function testGrokAPI() {
  try {
    Logger.log('=== Testing Grok API ===');
    
    // Check if API key is set
    const apiKey = PropertiesService.getScriptProperties().getProperty('GROK_KEY');
    if (!apiKey || apiKey === 'your-grok-api-key-here') {
      Logger.log('ERROR: GROK_KEY not configured!');
      Logger.log('Run setupProperties() first and set your API key.');
      return;
    }
    
    Logger.log('API Key found (length: ' + apiKey.length + ')');
    Logger.log('API Key starts with: ' + apiKey.substring(0, 10) + '...');
    
    // Test with a simple message
    const testPrompt = 'Hello, this is a test message.';
    const testHistory = [];
    
    Logger.log('Calling callGrok with test message...');
    const result = callGrok(testPrompt, testHistory);
    
    Logger.log('SUCCESS! Response received:');
    Logger.log(result);
    
  } catch (e) {
    Logger.log('ERROR in test: ' + e.toString());
    Logger.log('Error message: ' + e.message);
    Logger.log('Error stack: ' + (e.stack || 'No stack trace'));
  }
}

/**
 * Calls Grok API with conversation history
 * @param {string} prompt - User's message
 * @param {Array} history - Conversation history array
 * @return {string} Grok's response
 */
function callGrok(prompt, history) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GROK_KEY');
  
  if (!apiKey || apiKey === 'your-grok-api-key-here') {
    throw new Error('GROK_KEY not configured. Run setupProperties() first.');
  }
  
  // Build messages array
  let messages = [];
  
  // Add system prompt with Gary's writing style
  messages.push({
    role: 'system',
    content: 'You are helping draft blog posts for garyteh.com. Match Gary Teh\'s authentic writing voice and style. ' +
             '\n\nWRITING STYLE GUIDELINES:\n' +
             '- **Personal & Conversational**: Start with personal anecdotes, casual observations, or specific moments. Use "I" naturally. Example: "It hit me this morning, hunched over my laptop..."\n' +
             '- **Direct & Honest**: Use contractions naturally (I\'d, it\'s, we\'ve). Write like you\'re talking to a friend, not giving a corporate presentation. Be authentic, not polished.\n' +
             '- **Technical but Accessible**: When discussing complex topics (AI, startups, tech), explain in accessible language. No jargon without context. Make it relatable.\n' +
             '- **Stream-of-consciousness Flow**: Let thoughts flow naturally. Use em-dashes (—) for asides and parenthetical thoughts. Don\'t over-structure.\n' +
             '- **Reflective & Observational**: Connect personal experiences to broader insights. Use phrases like "Key observation:", "Reflections for the day:", or "Here\'s what that looks like in practice..."\n' +
             '- **Rhetorical Questions**: Engage the reader with questions like "Why maintain the fortress when you can whisper the siege?" or "What about you—ready to flatten your stack?"\n' +
             '- **Storytelling**: Include specific details, memories, or scenarios. Ground abstract ideas in concrete experiences.\n' +
             '- **Authentic Voice**: Avoid marketing-speak, corporate jargon, or overly enthusiastic tone. Be genuine, sometimes understated, occasionally wry.\n' +
             '- **Structure When Needed**: Use bullet points for lists, but keep paragraphs flowing. Don\'t force rigid frameworks.\n' +
             '- **End with Questions or Reflections**: Close with a question to the reader, a personal reflection, or a forward-looking thought.\n' +
             '\n\nPROCESS:\n' +
             '- The user gives raw ideas—help turn them into structured blog content with catchy title, intro, sections, wrap-up.\n' +
             '- Ask questions to dig deeper and understand their perspective.\n' +
             '- Suggest relevant categories based on content.\n' +
             '- After a few turns refining the content, say "Looks done—want to publish?"\n' +
             '\n\nTONE:\n' +
             '- Conversational, not formal\n' +
             '- Honest observations, not hype\n' +
             '- Personal insights, not generic advice\n' +
             '- Sometimes philosophical, sometimes practical\n' +
             '- Authentic voice that sounds like Gary, not an AI assistant'
  });
  
  // Add conversation history
  if (history && Array.isArray(history)) {
    history.forEach(msg => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
  }
  
  // Add current prompt
  messages.push({
    role: 'user',
    content: prompt
  });
  
  // Call Grok API
  const url = 'https://api.x.ai/v1/chat/completions';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify({
      model: 'grok-3',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    }),
    muteHttpExceptions: true
  };
  
  try {
    // Log request details (without API key)
    Logger.log('Calling Grok API...');
    Logger.log('URL: ' + url);
    Logger.log('Messages count: ' + messages.length);
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    // Log response details
    Logger.log('Response Code: ' + responseCode);
    Logger.log('Response Text (first 500 chars): ' + responseText.substring(0, 500));
    
    if (responseCode !== 200) {
      // Try to parse error, but handle if it's not JSON
      let errorMessage = 'Unknown error';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.message || JSON.stringify(errorData);
        Logger.log('Parsed error data: ' + JSON.stringify(errorData));
      } catch (parseError) {
        Logger.log('Failed to parse error response as JSON: ' + parseError.toString());
        Logger.log('Raw error response: ' + responseText);
        errorMessage = 'HTTP ' + responseCode + ': ' + responseText.substring(0, 200);
      }
      throw new Error('Grok API error: ' + errorMessage);
    }
    
    // Parse successful response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      Logger.log('Failed to parse success response as JSON: ' + parseError.toString());
      Logger.log('Raw response: ' + responseText);
      throw new Error('Invalid JSON response from Grok API');
    }
    
    // Check if response has expected structure
    if (!responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
      Logger.log('Unexpected response structure: ' + JSON.stringify(responseData));
      throw new Error('Unexpected response format from Grok API');
    }
    
    return responseData.choices[0].message.content;
    
  } catch (e) {
    Logger.log('Grok API error: ' + e.toString());
    Logger.log('Error stack: ' + (e.stack || 'No stack trace'));
    throw new Error('Failed to call Grok: ' + e.message);
  }
}

// ============================================================================
// POST HTML GENERATION
// ============================================================================

/**
 * Converts markdown/plain text to HTML
 * @param {string} text - Markdown or plain text content
 * @return {string} HTML formatted content
 */
function convertToHTML(text) {
  if (!text) return '';
  
  let html = text;
  
  // Convert code blocks first (before other processing)
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
    const id = 'CODE_BLOCK_' + codeBlocks.length;
    codeBlocks.push('<pre><code>' + escapeHtml(code.trim()) + '</code></pre>');
    return id;
  });
  
  // Convert inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  
  // Convert headers
  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>');
  
  // Convert bold (**text** or __text__) - but not inside code
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  
  // Convert italic (*text* or _text_) - but not inside code
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
  
  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Convert blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
  
  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');
  
  // Process lists - split by lines first
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check for unordered list item
    const ulMatch = trimmed.match(/^[\*\-\+] (.+)$/);
    // Check for ordered list item
    const olMatch = trimmed.match(/^\d+\. (.+)$/);
    
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        // Close previous list if any
        if (inList) {
          processedLines.push('</' + listType + '>');
        }
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      processedLines.push('<li>' + ulMatch[1] + '</li>');
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        // Close previous list if any
        if (inList) {
          processedLines.push('</' + listType + '>');
        }
        processedLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processedLines.push('<li>' + olMatch[1] + '</li>');
    } else {
      // Not a list item
      if (inList) {
        processedLines.push('</' + listType + '>');
        inList = false;
        listType = null;
      }
      processedLines.push(line);
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push('</' + listType + '>');
  }
  
  html = processedLines.join('\n');
  
  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace('CODE_BLOCK_' + index, block);
  });
  
  // Convert paragraphs - split by double newlines
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    
    // If it's already a block element, don't wrap
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|p)/.test(para)) {
      return para;
    }
    
    // Convert single newlines to <br> within paragraphs
    para = para.replace(/\n/g, '<br>');
    
    // Wrap in <p> tag
    return '<p>' + para + '</p>';
  }).join('\n\n');
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p><\/p>/g, '');
  
  // If no HTML tags were created, wrap everything in paragraphs
  if (!/<(p|h[1-6]|ul|ol|pre|blockquote|hr)/.test(html)) {
    const lines = html.split('\n').filter(l => l.trim());
    html = lines.map(line => '<p>' + line.trim() + '</p>').join('\n');
  }
  
  return html;
}

/**
 * Generates HTML for a blog post using cached template
 * @param {string} title - Post title
 * @param {string} content - Post content (markdown or plain text, will be converted to HTML)
 * @param {string} date - Post date (YYYY-MM-DD)
 * @param {Array} categories - Array of category strings
 * @return {string} Complete HTML for the post
 */
function generatePostHTML(title, content, date, categories) {
  // Get cached template or fetch from GitHub
  let template = PropertiesService.getScriptProperties().getProperty('POST_TEMPLATE');
  
  if (!template) {
    // Fetch template from latest post
    template = fetchPostTemplate();
    if (template) {
      PropertiesService.getScriptProperties().setProperty('POST_TEMPLATE', template);
    } else {
      // Fallback template if fetch fails
      template = getDefaultTemplate();
    }
  }
  
  // Format date
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Generate category tags HTML
  let categoryTags = '';
  if (categories && categories.length > 0) {
    categoryTags = categories.map(cat => 
      `<span class="category-tag">${escapeHtml(cat.trim())}</span>`
    ).join('\n                ');
  }
  
  // Convert content to HTML if it's not already
  // Check if content already contains HTML tags
  const hasHTMLTags = /<[a-z][\s\S]*>/i.test(content);
  const htmlContent = hasHTMLTags ? content : convertToHTML(content);
  
  // Replace placeholders in template
  let html = template
    .replace(/{{TITLE}}/g, escapeHtml(title))
    .replace(/{{DESCRIPTION}}/g, escapeHtml(title))
    .replace(/{{DATE}}/g, formattedDate)
    .replace(/{{DATE_ISO}}/g, date)
    .replace(/{{CATEGORIES}}/g, categoryTags)
    .replace(/{{CONTENT}}/g, htmlContent);
  
  return html;
}

/**
 * Fetches template from latest post on GitHub
 * @return {string} Template HTML or null
 */
function fetchPostTemplate() {
  try {
    // Fetch index.html to find latest post
    const indexContent = fetchGitHubFile('index.html');
    if (!indexContent) return null;
    
    // Extract latest post filename (first post link in 2025 or most recent year)
    const yearMatch = indexContent.match(/<div class="year-section" data-year="(\d{4})">/);
    if (!yearMatch) return null;
    
    const postMatch = indexContent.match(new RegExp(
      `<div class="post[^"]*"[^>]*>\\s*<div class="post-title"><a href="([^"]+\\.html)"`,
      'i'
    ));
    
    if (!postMatch) return null;
    
    const latestPostFile = postMatch[1];
    const postContent = fetchGitHubFile(latestPostFile);
    
    if (!postContent) return null;
    
    // Extract template by replacing content section with placeholder
    const contentMatch = postContent.match(
      /(<div class="content">)([\s\S]*?)(<\/div>\s*<footer)/
    );
    
    if (contentMatch) {
      return postContent.replace(
        contentMatch[0],
        '$1{{CONTENT}}$3'
      )
      .replace(/Thoughts on Ditching the Database Bloat[^<]*/g, '{{TITLE}}')
      .replace(/November 04, 2025/g, '{{DATE}}')
      .replace(/2025-11-04/g, '{{DATE_ISO}}')
      .replace(/Thoughts on Ditching the Database Bloat: AI and the Return to Flat Files/g, '{{DESCRIPTION}}')
      .replace(/<span class="category-tag">[^<]*<\/span>/g, '{{CATEGORIES}}')
      .replace(/\{\{CATEGORIES\}\}\s*\n\s*\{\{CATEGORIES\}\}/g, '{{CATEGORIES}}');
    }
    
    return postContent;
  } catch (e) {
    Logger.log('Error fetching template: ' + e.toString());
    return null;
  }
}

/**
 * Returns default template if GitHub fetch fails
 * @return {string} Default HTML template
 */
function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{DESCRIPTION}}">
    <title>{{TITLE}} - Gary Teh's Blog</title>
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        .back-link:hover {
            color: #2980b9;
        }
        .header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        .post-meta {
            color: #7f8c8d;
            font-size: 0.95em;
            margin-bottom: 10px;
        }
        .post-date {
            font-weight: 600;
        }
        .category-tag, .tag {
            background: #ecf0f1;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.9em;
            display: inline-block;
            margin-top: 5px;
        }
        .content {
            font-size: 1.1em;
            line-height: 1.8;
        }
        .content h1, .content h2 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .content h3 {
            color: #34495e;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        .content p {
            margin-bottom: 15px;
        }
        .content ul, .content ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        .content li {
            margin-bottom: 8px;
        }
        .content code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .content pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }
        .content pre code {
            background: none;
            padding: 0;
        }
        .content blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }
        .content a {
            color: #3498db;
            text-decoration: none;
        }
        .content a:hover {
            text-decoration: underline;
        }
        .content img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 5px;
        }
        footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to all posts</a>
        
        <div class="header">
            <h1>{{TITLE}}</h1>
            <div class="post-meta">
                <span class="post-date">{{DATE}}</span>
                {{CATEGORIES}}
            </div>
        </div>

        <div class="content">
            {{CONTENT}}
        </div>

        <footer>
            <p><a href="index.html">← Back to all posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
    
    <!-- Mailchimp Newsletter Signup -->
    <script id="mcjs">!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/f4002ef7c62ee64494321ba14/9c56fa20706b0138cf6fea672.js");</script>
</body>
</html>`;
}

/**
 * Refreshes the cached template from GitHub
 * @return {string} Success message
 */
function refreshTemplate() {
  const template = fetchPostTemplate();
  if (template) {
    PropertiesService.getScriptProperties().setProperty('POST_TEMPLATE', template);
    return 'Template refreshed successfully!';
  }
  return 'Failed to refresh template. Using default.';
}

// ============================================================================
// GITHUB INTEGRATION
// ============================================================================

/**
 * Fetches a file from GitHub repository
 * @param {string} path - File path in repository
 * @return {string} File content or null
 */
function fetchGitHubFile(path) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
  const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
  
  if (!token || token === 'your-github-token-here') {
    throw new Error('GITHUB_TOKEN not configured. Run setupProperties() first.');
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString();
    } else if (response.getResponseCode() === 404) {
      Logger.log('File not found: ' + path);
      return null;
    } else {
      throw new Error('GitHub API error: ' + response.getResponseCode());
    }
  } catch (e) {
    Logger.log('Error fetching GitHub file: ' + e.toString());
    throw new Error('Failed to fetch file from GitHub: ' + e.message);
  }
}

/**
 * Gets the SHA of a file (needed for updates)
 * @param {string} path - File path
 * @return {string} SHA or null
 */
function getGitHubFileSHA(path) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
  const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
  
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return data.sha;
    }
    return null;
  } catch (e) {
    Logger.log('Error getting SHA: ' + e.toString());
    return null;
  }
}

/**
 * Regenerates index.html from all blog posts
 * This is more reliable than trying to parse and modify existing HTML
 * @return {string} Complete index.html content
 */
function regenerateIndexHTML() {
  Logger.log('Regenerating index.html from all posts...');
  
  try {
    // Get all blog post filenames
    const postFilenames = listBlogPosts();
    Logger.log('Found ' + postFilenames.length + ' blog posts');
    
    // Fetch and parse all posts
    const posts = [];
    for (let i = 0; i < postFilenames.length; i++) {
      const filename = postFilenames[i];
      try {
        const postData = extractPostMetadata(filename);
        if (postData) {
          posts.push(postData);
        }
      } catch (e) {
        Logger.log('Error parsing post ' + filename + ': ' + e.toString());
        // Continue with other posts
      }
    }
    
    Logger.log('Successfully parsed ' + posts.length + ' posts');
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order
    });
    
    // Group posts by year
    const postsByYear = {};
    posts.forEach(post => {
      const year = post.year;
      if (!postsByYear[year]) {
        postsByYear[year] = [];
      }
      postsByYear[year].push(post);
    });
    
    // Get years in descending order
    const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));
    
    Logger.log('Posts grouped into ' + years.length + ' years');
    
    // Generate the index.html
    return generateIndexHTMLFromPosts(posts, postsByYear, years);
    
  } catch (e) {
    Logger.log('Error regenerating index.html: ' + e.toString());
    throw new Error('Failed to regenerate index.html: ' + e.message);
  }
}

/**
 * Extracts metadata from a blog post file
 * @param {string} filename - Post filename
 * @return {Object} Post metadata {title, date, categories, filename, year}
 */
function extractPostMetadata(filename) {
  try {
    const postHTML = fetchGitHubFile(filename);
    if (!postHTML) {
      Logger.log('Post file not found: ' + filename);
      return null;
    }
    
    // Extract title
    let title = '';
    const titleMatch = postHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const titleTagMatch = postHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch) {
        title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
      }
    }
    
    // Extract date from filename or post
    let date = '';
    const filenameDateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (filenameDateMatch) {
      date = filenameDateMatch[1];
    } else {
      const dateMatch = postHTML.match(/<span class="post-date">([^<]+)<\/span>/i);
      if (dateMatch) {
        // Convert "November 04, 2025" to "2025-11-04"
        const d = new Date(dateMatch[1]);
        date = d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' + 
               String(d.getDate()).padStart(2, '0');
      }
    }
    
    // Extract categories
    const categories = [];
    const categoryMatches = postHTML.matchAll(/<span class="category-tag">([^<]+)<\/span>/gi);
    for (const match of categoryMatches) {
      categories.push(match[1].trim());
    }
    
    // Get year from date
    const yearMatch = date.match(/^(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    
    return {
      title: title,
      date: date,
      categories: categories,
      filename: filename,
      year: year
    };
  } catch (e) {
    Logger.log('Error extracting metadata from ' + filename + ': ' + e.toString());
    return null;
  }
}

/**
 * Generates complete index.html from post data
 * @param {Array} posts - All posts
 * @param {Object} postsByYear - Posts grouped by year
 * @param {Array} years - Years in descending order
 * @return {string} Complete index.html content
 */
function generateIndexHTMLFromPosts(posts, postsByYear, years) {
  // Get the header and footer from existing index.html (or use template)
  const existingIndex = fetchGitHubFile('index.html');
  let headerHTML = '';
  let footerHTML = '';
  let stylesHTML = '';
  
  if (existingIndex) {
    // Extract styles (everything between <style> and </style>)
    const styleMatch = existingIndex.match(/(<style>[\s\S]*?<\/style>)/);
    if (styleMatch) {
      stylesHTML = styleMatch[1];
    }
    
    // Extract header (everything from <!DOCTYPE to before first year-section)
    const headerMatch = existingIndex.match(/([\s\S]*?)(<div class="year-section)/);
    if (headerMatch) {
      headerHTML = headerMatch[1];
      // Replace the styles in header with our extracted styles
      headerHTML = headerHTML.replace(/<style>[\s\S]*?<\/style>/, stylesHTML);
    }
    
    // Extract footer (everything after last year section closing div)
    // Find the closing </div> tags and script section
    const footerStart = existingIndex.lastIndexOf('    </div>');
    if (footerStart > 0) {
      footerHTML = existingIndex.substring(footerStart);
    } else {
      // Fallback: look for script tag
      const scriptMatch = existingIndex.match(/(<script>[\s\S]*?<\/script>[\s\S]*?<\/body>[\s\S]*?<\/html>)/);
      if (scriptMatch) {
        footerHTML = scriptMatch[1];
      }
    }
  }
  
  // If we couldn't extract, use defaults
  if (!headerHTML) {
    headerHTML = getDefaultIndexHeader();
  }
  if (!stylesHTML) {
    stylesHTML = getDefaultIndexStyles();
  }
  if (!footerHTML) {
    footerHTML = getDefaultIndexFooter();
  }
  
  // Update stats in header
  const oldestYear = years[years.length - 1] || new Date().getFullYear();
  const newestYear = years[0] || new Date().getFullYear();
  headerHTML = headerHTML.replace(
    /<strong>(\d+) posts<\/strong>/,
    `<strong>${posts.length} posts</strong>`
  );
  headerHTML = headerHTML.replace(
    /spanning from \d{4} to \d{4}/,
    `spanning from ${oldestYear} to ${newestYear}`
  );
  
  // Generate year sections
  let yearSectionsHTML = '';
  years.forEach(year => {
    const yearPosts = postsByYear[year];
    const postCount = yearPosts.length;
    
    yearSectionsHTML += `\n        <div class="year-section" data-year="${year}">\n`;
    yearSectionsHTML += `            <h2 class="year-header">${year} <span style="font-size: 0.6em; color: #95a5a6;">(${postCount} posts)</span></h2>\n`;
    
    yearPosts.forEach((post, index) => {
      const isFirst = index === 0;
      const featuredClass = isFirst ? ' featured-post' : '';
      const featuredBadge = isFirst ? '<span class="featured-badge">NEW</span>' : '';
      
      const titleLower = post.title.toLowerCase();
      const categoriesLower = post.categories.map(c => c.toLowerCase()).join(', ');
      const categoriesDisplay = post.categories.map(c => escapeHtml(c)).join(', ');
      
      yearSectionsHTML += `            <div class="post${featuredClass}" data-title="${escapeHtml(titleLower)}" data-categories="${escapeHtml(categoriesLower)}">\n`;
      yearSectionsHTML += `                <div class="post-title"><a href="${escapeHtml(post.filename)}">${escapeHtml(post.title)}</a>${featuredBadge}</div>\n`;
      yearSectionsHTML += `                <div class="post-meta">\n`;
      yearSectionsHTML += `                    <span class="post-date">${post.date}</span>\n`;
      yearSectionsHTML += `                    <span class="categories">• ${categoriesDisplay}</span>\n`;
      yearSectionsHTML += `                </div>\n`;
      yearSectionsHTML += `            </div>\n`;
    });
    
    yearSectionsHTML += `        </div>\n`;
  });
  
  // Combine everything
  const fullHTML = headerHTML + yearSectionsHTML + footerHTML;
  
  Logger.log('Generated index.html with ' + posts.length + ' posts in ' + years.length + ' years');
  return fullHTML;
}

/**
 * Gets default index header HTML
 */
function getDefaultIndexHeader() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gary Teh's Blog Archive</title>
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    ${getDefaultIndexStyles()}
</head>
<body>
    <div class="container">
        <a href="admin/" class="admin-link" title="Admin Panel - Blog Publisher">✏️ Admin</a>
        <header>
            <img src="header.jpg" alt="Gary Teh Header" class="header-banner">
            <div class="profile-section">
                <img src="profile.jpg" alt="Gary Teh" class="profile-image">
                <div class="profile-info">
                    <h2>Gary Teh</h2>
                    <p>Nobody doing nothing in the middle of nowhere</p>
                </div>
            </div>
            <h1>📝 Blog Archive</h1>
            <p class="subtitle">Personal writings on startups, investing, technology, and life reflections</p>
        </header>

        <div class="stats">
            <strong>0 posts</strong> spanning from 2009 to 2025 • 
            Topics: AI, Startups, Machine Learning, Investing, Psychology, Macro Economics, and more
        </div>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="🔍 Search posts by title or category..." onkeyup="filterPosts()">
        </div>

`;
}

/**
 * Gets default index styles (simplified - should match existing)
 */
function getDefaultIndexStyles() {
  return `<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        /* Add other styles as needed - this is a simplified version */
    </style>`;
}

/**
 * Gets default index footer HTML
 */
function getDefaultIndexFooter() {
  return `    </div>
    <script>
        function filterPosts() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const posts = document.querySelectorAll('.post');
            
            posts.forEach(post => {
                const title = post.getAttribute('data-title') || '';
                const categories = post.getAttribute('data-categories') || '';
                const matches = title.includes(filter) || categories.includes(filter);
                post.style.display = matches ? '' : 'none';
            });
        }
    </script>
</body>
</html>`;
}

/**
 * Updates index.html with new post entry (DEPRECATED - use regenerateIndexHTML instead)
 * @param {string} indexContent - Current index.html content
 * @param {Object} postData - Post data {title, filename, date, categories, year}
 * @return {string} Updated index.html content
 */
function updateIndexHTML(indexContent, postData) {
  const year = postData.year;
  const postHTML = generatePostEntryHTML(postData);
  
  Logger.log('Updating index.html for year: ' + year);
  Logger.log('Post HTML length: ' + postHTML.length);
  
  // Check if year section exists
  const yearPattern = new RegExp(
    `<div class="year-section" data-year="${year}">`,
    'i'
  );
  
  if (yearPattern.test(indexContent)) {
    Logger.log('Year section exists for ' + year);
    
    // Find the year section start position
    const yearSectionStart = indexContent.indexOf(`<div class="year-section" data-year="${year}">`);
    if (yearSectionStart === -1) {
      throw new Error('Year section found by pattern but not by indexOf for year ' + year);
    }
    
    // Find the closing </h2> tag after the year header
    // Escape parentheses properly - they're literal characters in the HTML
    // Pattern: <h2 class="year-header">2025 <span ...>(1 posts)</span></h2>
    // Use simpler pattern that matches the structure
    const simpleHeaderMatch = indexContent.substring(yearSectionStart).match(
      new RegExp(`<h2[^>]*>${year}[^<]*\\(\\s*(\\d+)\\s*posts\\)[^<]*</h2>`, 'i')
    );
    
    if (!simpleHeaderMatch) {
      Logger.log('Could not find year header pattern');
      // Try even simpler pattern without span
      const verySimpleMatch = indexContent.substring(yearSectionStart).match(
        new RegExp(`<h2[^>]*>${year}[^<]*\\(\\s*(\\d+)\\s*posts\\)`, 'i')
      );
      if (!verySimpleMatch) {
        Logger.log('ERROR: Could not find year header for ' + year);
        Logger.log('Year section start: ' + yearSectionStart);
        Logger.log('Substring preview: ' + indexContent.substring(yearSectionStart, yearSectionStart + 200));
        throw new Error('Could not find year header for ' + year);
      }
      const currentCount = parseInt(verySimpleMatch[1]);
      const newCount = currentCount + 1;
      Logger.log('Found year header, current count: ' + currentCount + ', new count: ' + newCount);
    } else {
      const currentCount = parseInt(simpleHeaderMatch[1]);
      const newCount = currentCount + 1;
      Logger.log('Found year header, current count: ' + currentCount + ', new count: ' + newCount);
      
      // Find position after </h2>
      const headerEnd = indexContent.indexOf('</h2>', yearSectionStart) + 5;
      // Insert post after header, before first post div
      const insertPosition = indexContent.indexOf('<div class="post', headerEnd);
      if (insertPosition === -1) {
        // No existing posts, insert before closing year-section div
        const yearSectionEnd = indexContent.indexOf('</div>', headerEnd);
        indexContent = indexContent.slice(0, headerEnd) + 
                     '\n            ' + postHTML + '\n        ' +
                     indexContent.slice(headerEnd);
      } else {
        indexContent = indexContent.slice(0, insertPosition) + 
                     '\n            ' + postHTML + '\n            ' +
                     indexContent.slice(insertPosition);
      }
      
      // Update count in header
      indexContent = indexContent.replace(
        new RegExp(`(${year}[^<]*\\(\\s*)(\\d+)(\\s*posts\\)[^<]*</h2>)`, 'i'),
        (m, p1, p2, p3) => p1 + newCount + p3
      );
    }
    
    // Find position after </h2> (common for both paths)
    const headerEnd = indexContent.indexOf('</h2>', yearSectionStart) + 5;
    if (headerEnd === 4) { // indexOf returns -1, so -1 + 5 = 4
      throw new Error('Could not find </h2> tag after year header');
    }
    
    // Insert post after header, before first post div
    const insertPosition = indexContent.indexOf('<div class="post', headerEnd);
    if (insertPosition === -1) {
      // No existing posts, insert before closing year-section div
      Logger.log('No existing posts in year section, inserting at end');
      const yearSectionEnd = indexContent.indexOf('</div>', headerEnd);
      if (yearSectionEnd === -1) {
        throw new Error('Could not find closing </div> for year section');
      }
      indexContent = indexContent.slice(0, headerEnd) + 
                   '\n            ' + postHTML + '\n        ' +
                   indexContent.slice(headerEnd);
    } else {
      Logger.log('Found existing posts, inserting before first post');
      indexContent = indexContent.slice(0, insertPosition) + 
                   '\n            ' + postHTML + '\n            ' +
                   indexContent.slice(insertPosition);
    }
    
    // Update count in header - try multiple patterns to be safe
    // Pattern 1: with span tag
    let countUpdated = indexContent.replace(
      new RegExp(`(${year}[^<]*<span[^>]*>\\(\\s*)(\\d+)(\\s*posts\\)</span>)`, 'i'),
      (m, p1, p2, p3) => {
        Logger.log('Updated count using span pattern');
        return p1 + newCount + p3;
      }
    );
    
    // If pattern 1 didn't match, try pattern 2: without span
    if (countUpdated === indexContent) {
      countUpdated = indexContent.replace(
        new RegExp(`(${year}[^<]*\\(\\s*)(\\d+)(\\s*posts\\)[^<]*</h2>)`, 'i'),
        (m, p1, p2, p3) => {
          Logger.log('Updated count using simple pattern');
          return p1 + newCount + p3;
        }
      );
    }
    
    indexContent = countUpdated;
    
    Logger.log('Successfully inserted post into year section');
    
  } else {
    Logger.log('Year section does NOT exist for ' + year + ', creating new section');
    
    // Year doesn't exist - create new year section
    // Find first year section and insert before it
    const firstYearPattern = /<div class="year-section" data-year="(\d{4})">/;
    const firstYearMatch = indexContent.match(firstYearPattern);
    
    if (firstYearMatch) {
      Logger.log('Found first year section: ' + firstYearMatch[1]);
      const newYearSection = generateYearSectionHTML(postData);
      indexContent = indexContent.replace(
        firstYearPattern,
        newYearSection + '\n\n        '
      );
    } else {
      Logger.log('No year sections found, appending to end');
      // No years exist - append before closing container
      const containerEnd = indexContent.lastIndexOf('    </div>');
      if (containerEnd > 0) {
        const newYearSection = generateYearSectionHTML(postData);
        indexContent = indexContent.slice(0, containerEnd) + 
                     '\n\n        ' + newYearSection + 
                     indexContent.slice(containerEnd);
      }
    }
  }
  
  // Update stats at top if present
  const statsPattern = /<strong>(\d+) posts<\/strong>/;
  const statsMatch = indexContent.match(statsPattern);
  if (statsMatch) {
    const newCount = parseInt(statsMatch[1]) + 1;
    indexContent = indexContent.replace(statsPattern, `<strong>${newCount} posts</strong>`);
    Logger.log('Updated stats count to: ' + newCount);
  }
  
  // Verify the post was inserted
  if (indexContent.indexOf(postData.filename) === -1) {
    Logger.log('WARNING: Post filename not found in updated index.html!');
    throw new Error('Failed to insert post into index.html');
  }
  
  Logger.log('Successfully updated index.html');
  return indexContent;
}

/**
 * Generates HTML for a post entry in index.html
 * @param {Object} postData - Post data
 * @return {string} HTML for post entry
 */
function generatePostEntryHTML(postData) {
  const titleLower = postData.title.toLowerCase();
  const categoriesLower = postData.categories.map(c => c.toLowerCase()).join(', ');
  const categoriesDisplay = postData.categories.map(c => escapeHtml(c)).join(', ');
  
  // Check if this should be featured (first post of year)
  const featuredClass = postData.isFirstInYear ? ' featured-post' : '';
  const featuredBadge = postData.isFirstInYear ? '<span class="featured-badge">NEW</span>' : '';
  
  return `<div class="post${featuredClass}" data-title="${escapeHtml(titleLower)}" data-categories="${escapeHtml(categoriesLower)}">
                <div class="post-title"><a href="${escapeHtml(postData.filename)}">${escapeHtml(postData.title)}</a>${featuredBadge}</div>
                <div class="post-meta">
                    <span class="post-date">${postData.date}</span>
                    <span class="categories">• ${categoriesDisplay}</span>
                </div>
            </div>`;
}

/**
 * Generates HTML for a new year section
 * @param {Object} postData - Post data
 * @return {string} HTML for year section
 */
function generateYearSectionHTML(postData) {
  const postHTML = generatePostEntryHTML({...postData, isFirstInYear: true});
  
  return `<div class="year-section" data-year="${postData.year}">
            <h2 class="year-header">${postData.year} <span style="font-size: 0.6em; color: #95a5a6;">(1 posts)</span></h2>
            ${postHTML}
        </div>`;
}

/**
 * Commits files to GitHub using Contents API (simpler and more reliable)
 * @param {Array} files - Array of {path, content, sha} objects
 * @param {string} message - Commit message
 * @return {Object} Commit result
 */
function commitToGitHub(files, message) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
  const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
  
  if (!token || token === 'your-github-token-here') {
    throw new Error('GITHUB_TOKEN not configured. Run setupProperties() first.');
  }
  
  // Use Contents API to create/update files
  // This API handles base64 encoding automatically and is simpler
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(file.path)}`;
    
    // Base64 encode the content (Contents API requires this)
    const encodedContent = Utilities.base64Encode(file.content);
    
    const payload = {
      message: message,
      content: encodedContent,
      branch: branch
    };
    
    // If file exists (has SHA), include it for update
    if (file.sha) {
      payload.sha = file.sha;
    }
    
    const response = UrlFetchApp.fetch(url, {
      method: file.sha ? 'put' : 'put', // PUT works for both create and update
      contentType: 'application/json',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`Committing file: ${file.path}, SHA: ${file.sha || 'new'}, Response code: ${responseCode}`);
    
    if (responseCode !== 200 && responseCode !== 201) {
      Logger.log('Error response: ' + responseText);
      // 200 = updated, 201 = created
      const error = JSON.parse(responseText);
      throw new Error(`Failed to ${file.sha ? 'update' : 'create'} file ${file.path}: ${error.message || 'Unknown error'}`);
    }
    
    const result = JSON.parse(responseText);
    results.push({
      path: file.path,
      sha: result.content.sha,
      commit: result.commit
    });
    
    Logger.log(`Successfully ${file.sha ? 'updated' : 'created'} ${file.path}`);
  }
  
  return {
    success: true,
    commitSHA: results[0].commit.sha,
    message: 'Post published successfully!',
    files: results
  };
}

// ============================================================================
// LIST BLOG POSTS
// ============================================================================

/**
 * Fetches a list of all blog post filenames from the GitHub repository.
 * @return {Array<string>} An array of filenames (e.g., ["2025-12-02-title.html", ...])
 */
function listBlogPosts() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
  const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
  
  if (!token || token === 'your-github-token-here') {
    throw new Error('GITHUB_TOKEN not configured. Run setupProperties() first.');
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      // Filter for .html files that look like blog posts (YYYY-MM-DD-title.html)
      const blogPosts = data
        .filter(file => file.type === 'file' && file.name.match(/^\d{4}-\d{2}-\d{2}-.+\.html$/i))
        .map(file => file.name);
      
      Logger.log('Found ' + blogPosts.length + ' blog post files in repository');
      return blogPosts;
    } else {
      throw new Error('GitHub API error: ' + response.getResponseCode());
    }
  } catch (e) {
    Logger.log('Error listing blog posts: ' + e.toString());
    throw new Error('Failed to list blog posts from GitHub: ' + e.message);
  }
}

// ============================================================================
// LOAD EXISTING POST
// ============================================================================

/**
 * Lists all drafts from the drafts folder
 * @return {Array} Array of {filename, title, date} objects
 */
function listDrafts() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
  const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
  const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
  
  if (!token || token === 'your-github-token-here') {
    throw new Error('GITHUB_TOKEN not configured. Run setupProperties() first.');
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/drafts?ref=${branch}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      // Filter for .html files that look like blog posts
      const drafts = data
        .filter(file => file.type === 'file' && file.name.match(/^\d{4}-\d{2}-\d{2}-.+\.html$/i))
        .map(file => {
          // Extract date from filename
          const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
          return {
            filename: file.name,
            draftPath: `drafts/${file.name}`,
            date: dateMatch ? dateMatch[1] : 'Unknown'
          };
        });
      
      // Fetch titles for each draft
      const draftsWithTitles = drafts.map(draft => {
        try {
          const draftContent = fetchGitHubFile(draft.draftPath);
          if (draftContent) {
            const titleMatch = draftContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (titleMatch) {
              draft.title = titleMatch[1].trim();
            } else {
              const titleTagMatch = draftContent.match(/<title[^>]*>([^<]+)<\/title>/i);
              if (titleTagMatch) {
                draft.title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
              } else {
                draft.title = draft.filename.replace(/\.html$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
              }
            }
          } else {
            draft.title = draft.filename.replace(/\.html$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
          }
        } catch (e) {
          Logger.log('Error fetching title for ' + draft.filename + ': ' + e.toString());
          draft.title = draft.filename.replace(/\.html$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        }
        return draft;
      });
      
      // Sort by date (newest first)
      draftsWithTitles.sort((a, b) => b.date.localeCompare(a.date));
      
      Logger.log('Found ' + draftsWithTitles.length + ' drafts');
      return draftsWithTitles;
      
    } else if (response.getResponseCode() === 404) {
      // Drafts folder doesn't exist yet - return empty array
      Logger.log('Drafts folder does not exist yet');
      return [];
    } else {
      throw new Error('GitHub API error: ' + response.getResponseCode());
    }
  } catch (e) {
    Logger.log('Error listing drafts: ' + e.toString());
    throw new Error('Failed to list drafts from GitHub: ' + e.message);
  }
}

/**
 * Gets list of all published blog posts from index.html
 * @return {Array} Array of {filename, title, date} objects
 */
function getPublishedPosts() {
  try {
    const indexContent = fetchGitHubFile('index.html');
    if (!indexContent) {
      return [];
    }
    
    const posts = [];
    
    // Extract all post links from index.html
    // Pattern: <div class="post-title"><a href="filename.html">Title</a> followed by date
    // More flexible pattern to handle variations
    const postPattern = /<div class="post[^"]*"[^>]*>[\s\S]*?<div class="post-title"><a href="([^"]+\.html)">([^<]+)<\/a>[\s\S]*?<span class="post-date">([^<]+)<\/span>/gi;
    
    let match;
    while ((match = postPattern.exec(indexContent)) !== null) {
      const filename = match[1];
      let title = match[2].trim();
      const date = match[3].trim();
      
      // Remove "NEW" badge if present
      title = title.replace(/<span[^>]*>NEW<\/span>/gi, '').trim();
      
      posts.push({
        filename: filename,
        title: title,
        date: date
      });
    }
    
    // If pattern didn't work, try simpler pattern
    if (posts.length === 0) {
      const simplePattern = /<a href="([^"]+\.html)">([^<]+)<\/a>/gi;
      let simpleMatch;
      while ((simpleMatch = simplePattern.exec(indexContent)) !== null) {
        const filename = simpleMatch[1];
        // Skip if it's index.html or admin/index.html
        if (filename === 'index.html' || filename.includes('admin/')) {
          continue;
        }
        // Try to extract date from filename
        const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
        posts.push({
          filename: filename,
          title: simpleMatch[2].trim().replace(/<span[^>]*>.*?<\/span>/gi, '').trim(),
          date: dateMatch ? dateMatch[1] : 'Unknown'
        });
      }
    }
    
    // Sort by date (newest first) - dates are in YYYY-MM-DD format
    posts.sort((a, b) => {
      // Extract date from filename or use date field
      const dateA = a.filename.match(/(\d{4}-\d{2}-\d{2})/);
      const dateB = b.filename.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateA && dateB) {
        return dateB[1].localeCompare(dateA[1]); // Descending (newest first)
      }
      return 0;
    });
    
    Logger.log('Found ' + posts.length + ' published posts');
    return posts;
    
  } catch (e) {
    Logger.log('Error getting published posts: ' + e.toString());
    return [];
  }
}

/**
 * Loads an existing draft from GitHub for editing
 * @param {string} filename - Draft filename (e.g., "2025-12-02-title.html" or "drafts/2025-12-02-title.html")
 * @return {Object} Draft data {title, content, categories, date, filename}
 */
function loadExistingDraft(filename) {
  try {
    // Ensure filename has drafts/ prefix
    let draftPath = filename;
    if (!draftPath.startsWith('drafts/')) {
      draftPath = `drafts/${filename}`;
    }
    
    // Fetch the draft file from GitHub
    const postHTML = fetchGitHubFile(draftPath);
    if (!postHTML) {
      throw new Error('Draft not found: ' + draftPath);
    }
    
    // Extract just the filename without drafts/ prefix for return
    const justFilename = filename.replace(/^drafts\//, '');
    
    // Extract title from <h1> or <title>
    let title = '';
    const titleMatch = postHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const titleTagMatch = postHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch) {
        title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
      }
    }
    
    // Extract content from <div class="content">
    let content = '';
    const contentMatch = postHTML.match(/<div class="content">([\s\S]*?)<\/div>\s*<footer/i);
    if (contentMatch) {
      content = contentMatch[1].trim();
      // Convert HTML back to markdown-like text for editing
      // Remove HTML tags but keep structure
      content = content
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
        .replace(/<ul>[\s\S]*?<\/ul>/g, function(match) {
          return match.replace(/<li>(.*?)<\/li>/g, '- $1\n');
        })
        .replace(/<ol>[\s\S]*?<\/ol>/g, function(match) {
          let counter = 1;
          return match.replace(/<li>(.*?)<\/li>/g, function() {
            return counter++ + '. $1\n';
          });
        })
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```')
        .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)')
        .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
        .replace(/\n{3,}/g, '\n\n') // Clean up multiple newlines
        .trim();
    }
    
    // Extract categories from category-tag spans
    const categories = [];
    const categoryMatches = postHTML.matchAll(/<span class="category-tag">([^<]+)<\/span>/g);
    for (const match of categoryMatches) {
      categories.push(match[1].trim());
    }
    
    // Extract date from post-date span or filename
    let date = '';
    const dateMatch = postHTML.match(/<span class="post-date">([^<]+)<\/span>/i);
    if (dateMatch) {
      // Try to parse the date and convert to YYYY-MM-DD
      const dateStr = dateMatch[1].trim();
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        date = dateObj.getFullYear() + '-' + 
               String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
               String(dateObj.getDate()).padStart(2, '0');
      }
    }
    
    // If no date found, try to extract from filename
    if (!date) {
      const filenameDateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      if (filenameDateMatch) {
        date = filenameDateMatch[1];
      }
    }
    
    return {
      success: true,
      title: title,
      content: content,
      categories: categories,
      date: date,
      filename: justFilename,
      draftPath: draftPath
    };
    
  } catch (e) {
    Logger.log('Error loading draft: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Loads an existing blog post from GitHub for editing
 * @deprecated Use loadExistingDraft() instead - we now work with drafts
 * @param {string} filename - Post filename (e.g., "2025-12-02-title.html")
 * @return {Object} Post data {title, content, categories, date, filename}
 */
function loadExistingPost(filename) {
  // Try to load as draft first
  const draftResult = loadExistingDraft(filename);
  if (draftResult.success) {
    return draftResult;
  }
  
  // Fallback to loading from root (for backward compatibility)
  try {
    const postHTML = fetchGitHubFile(filename);
    if (!postHTML) {
      throw new Error('Post not found: ' + filename);
    }
    
    // Extract title from <h1> or <title>
    let title = '';
    const titleMatch = postHTML.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const titleTagMatch = postHTML.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch) {
        title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
      }
    }
    
    // Extract content from <div class="content">
    let content = '';
    const contentMatch = postHTML.match(/<div class="content">([\s\S]*?)<\/div>\s*<footer/i);
    if (contentMatch) {
      content = contentMatch[1].trim();
      // Convert HTML back to markdown-like text for editing
      content = content
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
        .replace(/<ul>[\s\S]*?<\/ul>/g, function(match) {
          return match.replace(/<li>(.*?)<\/li>/g, '- $1\n');
        })
        .replace(/<ol>[\s\S]*?<\/ol>/g, function(match) {
          let counter = 1;
          return match.replace(/<li>(.*?)<\/li>/g, function() {
            return counter++ + '. $1\n';
          });
        })
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```')
        .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)')
        .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
        .replace(/\n{3,}/g, '\n\n') // Clean up multiple newlines
        .trim();
    }
    
    // Extract categories from category-tag spans
    const categories = [];
    const categoryMatches = postHTML.matchAll(/<span class="category-tag">([^<]+)<\/span>/g);
    for (const match of categoryMatches) {
      categories.push(match[1].trim());
    }
    
    // Extract date from post-date span or filename
    let date = '';
    const dateMatch = postHTML.match(/<span class="post-date">([^<]+)<\/span>/i);
    if (dateMatch) {
      // Try to parse the date and convert to YYYY-MM-DD
      const dateStr = dateMatch[1].trim();
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        date = dateObj.getFullYear() + '-' + 
               String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
               String(dateObj.getDate()).padStart(2, '0');
      }
    }
    
    // If no date found, try to extract from filename
    if (!date) {
      const filenameDateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      if (filenameDateMatch) {
        date = filenameDateMatch[1];
      }
    }
    
    return {
      success: true,
      title: title,
      content: content,
      categories: categories,
      date: date,
      filename: filename
    };
    
  } catch (e) {
    Logger.log('Error loading post: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

// ============================================================================
// PUBLISH FUNCTION
// ============================================================================

/**
 * Saves a draft to the drafts folder
 * @param {string} title - Post title
 * @param {string} content - Post content (HTML)
 * @param {Array} categories - Array of category strings
 * @param {string} existingFilename - Optional: filename of existing draft to update
 * @return {Object} Result with success status
 */
function saveDraft(title, content, categories, existingFilename) {
  try {
    let filename;
    let dateStr;
    let isUpdate = false;
    
    if (existingFilename) {
      // Updating existing draft
      // Remove 'drafts/' prefix if present
      filename = existingFilename.replace(/^drafts\//, '');
      isUpdate = true;
      // Extract date from filename
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      dateStr = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    } else {
      // Creating new draft
      const date = new Date();
      dateStr = date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      filename = `${dateStr}-${slug}.html`;
    }
    
    // Generate post HTML
    const postHTML = generatePostHTML(title, content, dateStr, categories);
    
    // Save to drafts folder
    const draftPath = `drafts/${filename}`;
    
    // Get SHA if updating existing draft
    const draftSHA = getGitHubFileSHA(draftPath);
    
    // Prepare file for commit
    const files = [
      {
        path: draftPath,
        content: postHTML,
        sha: draftSHA // null for new, SHA for update
      }
    ];
    
    Logger.log('Saving draft to: ' + draftPath);
    
    // Commit to GitHub
    const commitMessage = isUpdate 
      ? `Draft updated: ${title} via Grok`
      : `Draft saved: ${title} via Grok`;
    
    const result = commitToGitHub(files, commitMessage);
    
    Logger.log('Draft saved: ' + JSON.stringify(result));
    
    return {
      success: true,
      filename: filename,
      draftPath: draftPath,
      message: isUpdate ? 'Draft updated successfully!' : 'Draft saved successfully!',
      isUpdate: isUpdate,
      note: 'Draft saved to drafts folder. You can review and publish it later.'
    };
    
  } catch (e) {
    Logger.log('Save draft error: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Main publish function - generates post, updates index, commits to GitHub
 * @deprecated Use saveDraft() instead - drafts are saved for review before publishing
 * @param {string} title - Post title
 * @param {string} content - Post content (HTML)
 * @param {Array} categories - Array of category strings
 * @param {string} existingFilename - Optional: filename of existing post to update
 * @return {Object} Result with success status and URL
 */
function publishPost(title, content, categories, existingFilename) {
  // Redirect to saveDraft for now
  return saveDraft(title, content, categories, existingFilename);
}

/**
 * Regenerates index.html from all blog posts
 * This can be called separately (e.g., via cron job) to update the index
 * @return {Object} Result with success status
 */
function regenerateIndex() {
  try {
    Logger.log('Starting index.html regeneration...');
    
    // Regenerate the entire index.html from all posts
    const regeneratedIndex = regenerateIndexHTML();
    
    // Get SHA for index.html
    const indexSHA = getGitHubFileSHA('index.html');
    
    // Commit the regenerated index.html
    const files = [{
      path: 'index.html',
      content: regeneratedIndex,
      sha: indexSHA
    }];
    
    const result = commitToGitHub(files, 'Auto-regenerated index.html from all posts');
    
    Logger.log('Index regeneration complete: ' + JSON.stringify(result));
    
    return {
      success: true,
      message: 'Index.html regenerated successfully!',
      commitSHA: result.commitSHA
    };
    
  } catch (e) {
    Logger.log('Index regeneration error: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @return {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test function to preview blog post HTML without publishing
 * Run this from Apps Script editor to see what the generated HTML looks like
 * View → Execution log to see the output
 */
function testPublishBlogPost() {
  try {
    Logger.log('=== Testing Blog Post Generation ===\n');
    
    // Test data
    const testTitle = 'Test Post: AI and the Future of Blogging';
    const testContent = `It hit me this morning, hunched over my laptop. No coffee for me—never have been one for it—but the dawn light filtering through the windows did the trick.

**Key observation:** This is a test of the blog publishing system.

Here's what that looks like in practice:

- **Feature one**: Testing markdown conversion
- **Feature two**: Ensuring HTML is properly formatted
- **Feature three**: Verifying template injection

Then AI shows up, and prompts become the new UI. "Summarize my notes by theme." Done. No forms, no logins, just intent translated on the fly.

\`\`\`javascript
// This is a code block
function test() {
  return "Hello World";
}
\`\`\`

**Reflections for the day:** This is just a test. The actual publishing will work the same way.

What about you—ready to test the system?`;
    
    const testCategories = ['Technology', 'AI', 'Testing'];
    const testDate = new Date();
    const dateStr = testDate.getFullYear() + '-' + 
                   String(testDate.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(testDate.getDate()).padStart(2, '0');
    
    Logger.log('Test Title: ' + testTitle);
    Logger.log('Test Date: ' + dateStr);
    Logger.log('Test Categories: ' + testCategories.join(', '));
    Logger.log('\n--- Generating HTML ---\n');
    
    // Generate HTML
    const postHTML = generatePostHTML(testTitle, testContent, dateStr, testCategories);
    
    // Log the HTML (first 2000 chars, then full)
    Logger.log('Generated HTML (first 2000 chars):');
    Logger.log(postHTML.substring(0, 2000));
    Logger.log('\n... (truncated) ...\n');
    Logger.log('Full HTML length: ' + postHTML.length + ' characters');
    
    // Test filename generation
    const slug = testTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${dateStr}-${slug}.html`;
    Logger.log('\nGenerated filename: ' + filename);
    
    // Test index.html update (simulation)
    Logger.log('\n--- Testing Index.html Update ---\n');
    const sampleIndex = `<div class="year-section" data-year="2025">
            <h2 class="year-header">2025 <span style="font-size: 0.6em; color: #95a5a6;">(1 posts)</span></h2>
            <div class="post" data-title="existing post" data-categories="tech">
                <div class="post-title"><a href="existing-post.html">Existing Post</a></div>
                <div class="post-meta">
                    <span class="post-date">2025-01-01</span>
                    <span class="categories">• Tech</span>
                </div>
            </div>
        </div>`;
    
    const updatedIndex = updateIndexHTML(sampleIndex, {
      title: testTitle,
      filename: filename,
      date: dateStr,
      categories: testCategories,
      year: testDate.getFullYear(),
      isFirstInYear: false
    });
    
    Logger.log('Updated index.html (first 500 chars):');
    Logger.log(updatedIndex.substring(0, 500));
    
    Logger.log('\n=== Test Complete ===');
    Logger.log('✓ HTML generation: SUCCESS');
    Logger.log('✓ Filename generation: SUCCESS');
    Logger.log('✓ Index.html update: SUCCESS');
    Logger.log('\nNote: This test does NOT commit to GitHub.');
    Logger.log('To actually publish, use the web app interface.');
    
    return {
      success: true,
      filename: filename,
      htmlLength: postHTML.length,
      message: 'Test completed successfully. Check execution log for details.'
    };
    
  } catch (e) {
    Logger.log('ERROR in test: ' + e.toString());
    Logger.log('Error stack: ' + (e.stack || 'No stack trace'));
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Test function to preview markdown to HTML conversion
 * Run this to see how markdown is converted to HTML
 */
function testMarkdownConversion() {
  Logger.log('=== Testing Markdown to HTML Conversion ===\n');
  
  const testMarkdown = `# Heading 1

## Heading 2

This is a paragraph with **bold text** and *italic text*.

Here's a list:
- Item one
- Item two
- Item three

And an ordered list:
1. First item
2. Second item
3. Third item

\`inline code\` and a code block:

\`\`\`javascript
function test() {
  return "code";
}
\`\`\`

A [link](https://example.com) and a > blockquote.

**Key observation:** This tests the conversion.`;

  Logger.log('Input Markdown:');
  Logger.log(testMarkdown);
  Logger.log('\n--- Converted HTML ---\n');
  
  const html = convertToHTML(testMarkdown);
  Logger.log(html);
  
  Logger.log('\n=== Conversion Test Complete ===');
  
  return html;
}

