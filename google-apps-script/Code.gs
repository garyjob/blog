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
             '\n\nCRITICAL FORMATTING REQUIREMENT:\n' +
             '- **ALWAYS start your response with the title at the very top, formatted as: # Title Here**\n' +
             '- The title must be the first line of your response, before any other content.\n' +
             '- Example format:\n' +
             '  # Building an AI-Powered Blog Editor\n' +
             '  \n' +
             '  It hit me this morning, hunched over my laptop...\n' +
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
             '\n\nIMPORTANT RESTRICTIONS:\n' +
             '- **NEVER start responses with "Hey there it is Gary" or similar greetings. Start with the title (# Title), then the content itself.**\n' +
             '- **When mentioning beverages, use "cup of cacao" instead of "coffee". Gary prefers cacao, not coffee.**\n' +
             '\n\nPROCESS:\n' +
             '- The user gives raw ideas—help turn them into structured blog content with catchy title, intro, sections, wrap-up.\n' +
             '- **Always format the title as the first line: # Title Here**\n' +
             '- Ask questions to dig deeper and understand their perspective.\n' +
             '- **IMPORTANT: When suggesting categories, format them as a markdown list at the end of your response:**\n' +
             '  - Cat 1\n' +
             '  - Cat 2\n' +
             '  - Cat 3\n' +
             '  Example: If the post is about AI and startups, use:\n' +
             '  - Technology\n' +
             '  - Startups\n' +
             '  - AI\n' +
             '  Always use this exact format: lines starting with "- " (dash followed by space)\n' +
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
  
  // Convert images ![alt](url) or ![alt](url "title")
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g, function(match, alt, url, title) {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    const altAttr = alt ? ` alt="${escapeHtml(alt)}"` : '';
    return `<img src="${escapeHtml(url)}"${altAttr}${titleAttr} style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block;">`;
  });
  
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
  
  // Auto-link TrueSight DAO and Agroverse (but not inside links, code, or HTML tags)
  // This must happen after code blocks are restored but before paragraph conversion
  // We process text nodes only, avoiding HTML tags and existing links
  
  // Helper function to check if a position is inside an HTML tag
  function isInsideHTMLTag(text, pos) {
    const before = text.substring(0, pos);
    const lastOpen = before.lastIndexOf('<');
    const lastClose = before.lastIndexOf('>');
    // If last < is after last >, we're inside a tag
    return lastOpen > lastClose;
  }
  
  // Auto-link TrueSight DAO (case-sensitive for "TrueSight DAO" specifically)
  let processed = '';
  let searchIndex = 0;
  const trueSightRegex = /TrueSight DAO/gi;
  let trueSightMatch;
  
  while ((trueSightMatch = trueSightRegex.exec(html)) !== null) {
    // Add everything before the match
    processed += html.substring(searchIndex, trueSightMatch.index);
    
    // Check if we're inside an HTML tag
    if (!isInsideHTMLTag(html, trueSightMatch.index)) {
      // Check if already inside a link by looking for <a> before and </a> after
      const beforeText = html.substring(0, trueSightMatch.index);
      const afterText = html.substring(trueSightMatch.index + trueSightMatch[0].length);
      const lastAOpen = beforeText.lastIndexOf('<a ');
      const lastAClose = beforeText.lastIndexOf('</a>');
      const nextAClose = afterText.indexOf('</a>');
      
      // If we're inside an <a> tag, don't link
      if (lastAOpen > lastAClose && nextAClose !== -1) {
        processed += trueSightMatch[0];
      } else {
        // Safe to link
        processed += '<a href="https://truesight.me" target="_blank" rel="noopener noreferrer">TrueSight DAO</a>';
      }
    } else {
      // Inside HTML tag, keep as is
      processed += trueSightMatch[0];
    }
    
    searchIndex = trueSightRegex.lastIndex;
  }
  
  // Add remaining text
  processed += html.substring(searchIndex);
  html = processed;
  
  // Auto-link Agroverse (case-insensitive, word boundary)
  processed = '';
  searchIndex = 0;
  const agroverseRegex = /\bAgroverse\b/gi;
  let agroverseMatch;
  
  while ((agroverseMatch = agroverseRegex.exec(html)) !== null) {
    // Add everything before the match
    processed += html.substring(searchIndex, agroverseMatch.index);
    
    // Check if we're inside an HTML tag
    if (!isInsideHTMLTag(html, agroverseMatch.index)) {
      // Check if already inside a link
      const beforeText = html.substring(0, agroverseMatch.index);
      const afterText = html.substring(agroverseMatch.index + agroverseMatch[0].length);
      const lastAOpen = beforeText.lastIndexOf('<a ');
      const lastAClose = beforeText.lastIndexOf('</a>');
      const nextAClose = afterText.indexOf('</a>');
      
      // If we're inside an <a> tag, don't link
      if (lastAOpen > lastAClose && nextAClose !== -1) {
        processed += agroverseMatch[0];
      } else {
        // Safe to link - preserve original case
        const originalText = agroverseMatch[0];
        processed += '<a href="https://agroverse.shop" target="_blank" rel="noopener noreferrer">' + originalText + '</a>';
      }
    } else {
      // Inside HTML tag, keep as is
      processed += agroverseMatch[0];
    }
    
    searchIndex = agroverseRegex.lastIndex;
  }
  
  // Add remaining text
  processed += html.substring(searchIndex);
  html = processed;
  
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
      // Explicitly use UTF-8 encoding to prevent character corruption (e.g., ' becoming ?)
      return Utilities.newBlob(Utilities.base64Decode(data.content)).getDataAsString('UTF-8');
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
    // Ensure proper UTF-8 encoding by converting string to UTF-8 bytes first
    // Create a blob with explicit UTF-8 encoding, then get bytes
    const blob = Utilities.newBlob(file.content, 'text/plain', 'UTF-8');
    const contentBytes = blob.getBytes();
    const encodedContent = Utilities.base64Encode(contentBytes);
    
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
// IMAGE UPLOAD
// ============================================================================

/**
 * Uploads an image file to GitHub in the uploads folder
 * @param {string} base64Data - The image file as base64 string
 * @param {string} filename - Original filename
 * @param {string} mimeType - MIME type of the image
 * @return {Object} Result with image URL or error
 */
function uploadImageFromBase64(base64Data, filename, mimeType) {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
    const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
    const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
    
    if (!token || token === 'your-github-token-here') {
      throw new Error('GITHUB_TOKEN not configured. Run setupProperties() first.');
    }
    
    // Generate unique filename with timestamp
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const fileExt = filename.split('.').pop().toLowerCase();
    const sanitizedBase = filename.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const uniqueFilename = timestamp + '-' + sanitizedBase + '.' + fileExt;
    
    // Path in uploads folder
    const uploadPath = 'images/uploads/' + year + '/' + month + '/' + uniqueFilename;
    
    // base64Data is already base64 encoded
    const base64Content = base64Data;
    
    // Upload to GitHub
    const url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + encodeURIComponent(uploadPath);
    const payload = {
      message: 'Upload image: ' + filename,
      content: base64Content,
      branch: branch
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'put',
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
    
    if (responseCode !== 200 && responseCode !== 201) {
      Logger.log('Error uploading image: ' + responseText);
      const error = JSON.parse(responseText);
      throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
    }
    
    const result = JSON.parse(responseText);
    
    // Return the relative path that can be used in markdown
    const imageUrl = uploadPath;
    
    Logger.log('Image uploaded successfully: ' + imageUrl);
    
    return {
      success: true,
      url: imageUrl,
      fullUrl: 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + branch + '/' + uploadPath,
      message: 'Image uploaded successfully'
    };
    
  } catch (e) {
    Logger.log('Image upload error: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Test function to verify image upload function is accessible
 * @return {string} Success message
 */
function testImageUpload() {
  return 'Image upload function is accessible';
}

/**
 * Moves images from uploads folder to final location when publishing
 * @param {string} content - Markdown content with image references
 * @param {string} dateStr - Post date (YYYY-MM-DD)
 * @return {Object} Updated content and list of moved images
 */
function moveImagesOnPublish(content, dateStr) {
  try {
    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    const owner = PropertiesService.getScriptProperties().getProperty('GITHUB_OWNER') || 'garyjob';
    const repo = PropertiesService.getScriptProperties().getProperty('GITHUB_REPO') || 'blog';
    const branch = PropertiesService.getScriptProperties().getProperty('GITHUB_BRANCH') || 'main';
    
    if (!token || token === 'your-github-token-here') {
      throw new Error('GITHUB_TOKEN not configured.');
    }
    
    // Extract date parts
    const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      Logger.log('Invalid date format, skipping image move');
      return { content: content, movedImages: [] };
    }
    
    const year = dateMatch[1];
    const month = dateMatch[2];
    
    // Find all image references in uploads folder
    const imagePattern = /!\[([^\]]*)\]\((images\/uploads\/[^)]+)\)/g;
    const imagesToMove = [];
    let match;
    
    while ((match = imagePattern.exec(content)) !== null) {
      const uploadPath = match[2];
      const filename = uploadPath.split('/').pop();
      const finalPath = `images/${year}/${month}/${filename}`;
      imagesToMove.push({ uploadPath, finalPath, alt: match[1] });
    }
    
    if (imagesToMove.length === 0) {
      return { content: content, movedImages: [] };
    }
    
    Logger.log(`Moving ${imagesToMove.length} images to final location`);
    
    // Move each image
    const filesToCommit = [];
    for (let i = 0; i < imagesToMove.length; i++) {
      const img = imagesToMove[i];
      
      // Fetch the image from uploads
      const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(img.uploadPath)}?ref=${branch}`;
      const uploadResponse = UrlFetchApp.fetch(uploadUrl, {
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json'
        },
        muteHttpExceptions: true
      });
      
      if (uploadResponse.getResponseCode() === 200) {
        const uploadData = JSON.parse(uploadResponse.getContentText());
        const base64Content = uploadData.content.replace(/\s/g, ''); // Remove whitespace
        
        // Check if final location already exists
        const finalSHA = getGitHubFileSHA(img.finalPath);
        
        filesToCommit.push({
          path: img.finalPath,
          content: base64Content,
          sha: finalSHA // null for new, SHA for update
        });
        
        // Update content to use final path
        content = content.replace(
          new RegExp('!\\[([^\\]]*)\\]\\(' + escapeRegex(img.uploadPath) + '\\)', 'g'),
          '![$1](' + img.finalPath + ')'
        );
      }
    }
    
    // Commit all moved images
    if (filesToCommit.length > 0) {
      const commitMessage = `Move ${filesToCommit.length} image(s) to final location for published post`;
      commitToGitHub(filesToCommit, commitMessage);
      Logger.log(`Moved ${filesToCommit.length} images successfully`);
    }
    
    return {
      content: content,
      movedImages: imagesToMove.map(img => img.finalPath)
    };
    
  } catch (e) {
    Logger.log('Error moving images: ' + e.toString());
    // Return content as-is if move fails
    return { content: content, movedImages: [], error: e.message };
  }
}

/**
 * Helper function to escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      // Filter for .md files that look like blog posts (or .html for backward compatibility)
      const drafts = data
        .filter(file => file.type === 'file' && file.name.match(/^\d{4}-\d{2}-\d{2}-.+\.(md|html)$/i))
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
            // Check if it's markdown (has frontmatter) or HTML
            if (draftContent.startsWith('---')) {
              // Markdown with frontmatter
              const titleMatch = draftContent.match(/^---\s*\ntitle:\s*"([^"]+)"|^---\s*\ntitle:\s*([^\n]+)/m);
              if (titleMatch) {
                draft.title = (titleMatch[1] || titleMatch[2]).trim();
              } else {
                draft.title = draft.filename.replace(/\.(md|html)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
              }
            } else {
              // HTML format (backward compatibility)
              const titleMatch = draftContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              if (titleMatch) {
                draft.title = titleMatch[1].trim();
              } else {
                const titleTagMatch = draftContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleTagMatch) {
                  draft.title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
                } else {
                  draft.title = draft.filename.replace(/\.(md|html)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
                }
              }
            }
          } else {
            draft.title = draft.filename.replace(/\.(md|html)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
          }
        } catch (e) {
          Logger.log('Error fetching title for ' + draft.filename + ': ' + e.toString());
          draft.title = draft.filename.replace(/\.(md|html)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
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
 * Checks if a draft has been published by looking for the corresponding HTML file
 * @param {string} draftFilename - Draft filename (e.g., "2025-12-02-title.md")
 * @return {string|null} Published URL if exists, null otherwise
 */
function getPublishedUrlForDraft(draftFilename) {
  try {
    // Extract date and slug from draft filename
    // Format: YYYY-MM-DD-slug.md
    const match = draftFilename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!match) {
      return null;
    }
    
    const dateStr = match[1];
    const slug = match[2];
    const htmlFilename = `${dateStr}-${slug}.html`;
    
    // Check if the HTML file exists
    const htmlContent = fetchGitHubFile(htmlFilename);
    if (htmlContent) {
      return `https://garyteh.com/${htmlFilename}`;
    }
    
    return null;
  } catch (e) {
    Logger.log('Error checking published URL: ' + e.toString());
    return null;
  }
}

/**
 * Loads an existing draft from GitHub for editing
 * @param {string} filename - Draft filename (e.g., "2025-12-02-title.html" or "drafts/2025-12-02-title.html")
 * @return {Object} Draft data {title, content, categories, date, filename, publishedUrl}
 */
function loadExistingDraft(filename) {
  try {
    // Ensure filename has drafts/ prefix
    let draftPath = filename;
    if (!draftPath.startsWith('drafts/')) {
      draftPath = `drafts/${filename}`;
    }
    
    // Fetch the draft file from GitHub
    const draftContent = fetchGitHubFile(draftPath);
    if (!draftContent) {
      throw new Error('Draft not found: ' + draftPath);
    }
    
    // Extract just the filename without drafts/ prefix for return
    const justFilename = filename.replace(/^drafts\//, '');
    
    let title = '';
    let content = '';
    let categories = [];
    let date = '';
    
    // Check if it's markdown with frontmatter or HTML
    if (draftContent.startsWith('---')) {
      // Markdown format with frontmatter
      const frontmatterEnd = draftContent.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        const frontmatter = draftContent.substring(3, frontmatterEnd).trim();
        content = draftContent.substring(frontmatterEnd + 3).trim();
        
        // Parse frontmatter
        const titleMatch = frontmatter.match(/^title:\s*"([^"]+)"|^title:\s*([^\n]+)/m);
        if (titleMatch) {
          title = (titleMatch[1] || titleMatch[2]).trim();
        }
        
        const dateMatch = frontmatter.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
        if (dateMatch) {
          date = dateMatch[1];
        }
        
        const categoriesMatch = frontmatter.match(/^categories:\s*\[([^\]]+)\]/m);
        if (categoriesMatch) {
          // Extract quoted strings from array
          const catArray = categoriesMatch[1].match(/"([^"]+)"/g);
          if (catArray) {
            categories = catArray.map(c => c.replace(/"/g, '').trim());
          }
        }
      }
    } else {
      // HTML format (backward compatibility)
      // Extract title from <h1> or <title>
      const titleMatch = draftContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        const titleTagMatch = draftContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleTagMatch) {
          title = titleTagMatch[1].replace(/\s*-\s*Gary Teh's Blog.*$/i, '').trim();
        }
      }
      
      // Extract content from <div class="content">
      const contentMatch = draftContent.match(/<div class="content">([\s\S]*?)<\/div>\s*<footer/i);
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
      const categoryMatches = draftContent.matchAll(/<span class="category-tag">([^<]+)<\/span>/g);
      for (const match of categoryMatches) {
        categories.push(match[1].trim());
      }
      
      // Extract date from post-date span or filename
      const dateMatch = draftContent.match(/<span class="post-date">([^<]+)<\/span>/i);
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
    }
    
    // If no date found, try to extract from filename
    if (!date) {
      const filenameDateMatch = justFilename.match(/(\d{4}-\d{2}-\d{2})/);
      if (filenameDateMatch) {
        date = filenameDateMatch[1];
      }
    }
    
    // If no title found, extract from filename
    if (!title) {
      title = justFilename.replace(/\.(md|html)$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');
    }
    
    // Check if this draft has been published
    let publishedUrl = null;
    try {
      publishedUrl = getPublishedUrlForDraft(justFilename);
    } catch (e) {
      Logger.log('Error checking published URL for draft: ' + e.toString());
      publishedUrl = null;
    }
    
    return {
      success: true,
      title: title,
      content: content,
      categories: categories,
      date: date,
      filename: justFilename,
      draftPath: draftPath,
      publishedUrl: publishedUrl || null // Always include publishedUrl, even if null
    };
    
  } catch (e) {
    Logger.log('Error loading draft: ' + e.toString());
    return {
      success: false,
      error: e.message,
      publishedUrl: null // Include publishedUrl even on error
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
      // If updating, ensure it's .md extension
      filename = filename.replace(/\.html$/, '.md');
    } else {
      // Creating new draft
      const date = new Date();
      dateStr = date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      filename = `${dateStr}-${slug}.md`;
    }
    
    // Format date for frontmatter
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Build markdown content with frontmatter
    let markdownContent = `---\n`;
    markdownContent += `title: "${title.replace(/"/g, '\\"')}"\n`;
    markdownContent += `date: ${dateStr}\n`;
    markdownContent += `formattedDate: "${formattedDate}"\n`;
    if (categories && categories.length > 0) {
      markdownContent += `categories: [${categories.map(c => `"${c.replace(/"/g, '\\"')}"`).join(', ')}]\n`;
    }
    markdownContent += `---\n\n`;
    
    // Add content (already in markdown format from conversation)
    // Images in uploads folder will stay there until publish
    markdownContent += content;
    
    // Save to drafts folder
    const draftPath = `drafts/${filename}`;
    
    // Get SHA - check if file already exists (for both updates and new drafts)
    const draftSHA = getGitHubFileSHA(draftPath);
    
    // If file exists (has SHA), treat as update
    if (draftSHA && !isUpdate) {
      isUpdate = true;
      Logger.log('Draft with same filename already exists, will override: ' + draftPath);
    }
    
    // Prepare file for commit
    const files = [
      {
        path: draftPath,
        content: markdownContent,
        sha: draftSHA // null for new, SHA for update
      }
    ];
    
    Logger.log('Saving draft to: ' + draftPath + (draftSHA ? ' (updating existing)' : ' (new file)'));
    
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
      note: 'Draft saved to drafts folder as markdown. You can review and publish it later.'
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
 * Publishes a draft as a blog post
 * Reads the draft .md file, converts it to HTML, and publishes it to the blog root
 * @param {string} draftFilename - Filename of the draft to publish (e.g., "2025-12-02-title.md")
 * @return {Object} Result with success status and URL
 */
function publishDraft(draftFilename) {
  try {
    // Ensure filename has drafts/ prefix
    let draftPath = draftFilename;
    if (!draftPath.startsWith('drafts/')) {
      draftPath = `drafts/${draftFilename}`;
    }
    
    // Fetch the draft file from GitHub
    const draftContent = fetchGitHubFile(draftPath);
    if (!draftContent) {
      throw new Error('Draft not found: ' + draftPath);
    }
    
    // Parse frontmatter and content
    let title = '';
    let dateStr = '';
    let formattedDate = '';
    let categories = [];
    let markdownContent = '';
    
    if (draftContent.startsWith('---')) {
      // Markdown format with frontmatter
      const frontmatterEnd = draftContent.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        const frontmatter = draftContent.substring(3, frontmatterEnd).trim();
        markdownContent = draftContent.substring(frontmatterEnd + 3).trim();
        
        // Parse frontmatter
        const titleMatch = frontmatter.match(/^title:\s*"([^"]+)"|^title:\s*([^\n]+)/m);
        if (titleMatch) {
          title = (titleMatch[1] || titleMatch[2]).trim();
        }
        
        const dateMatch = frontmatter.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
        if (dateMatch) {
          dateStr = dateMatch[1];
        }
        
        const formattedDateMatch = frontmatter.match(/^formattedDate:\s*"([^"]+)"/m);
        if (formattedDateMatch) {
          formattedDate = formattedDateMatch[1];
        }
        
        // Parse categories - handle both single-line and multi-line arrays
        // Pattern 1: categories: ["cat1", "cat2", "cat3"]
        // Pattern 2: categories: ["cat1",\n  "cat2",\n  "cat3"]
        const categoriesMatch = frontmatter.match(/^categories:\s*\[([^\]]+)\]/ms);
        if (categoriesMatch) {
          const categoriesStr = categoriesMatch[1];
          // Match all quoted strings (handles special characters like **)
          const catArray = categoriesStr.match(/"([^"]+)"/g);
          if (catArray) {
            categories = catArray.map(c => c.replace(/"/g, '').trim());
            Logger.log('Parsed ' + categories.length + ' categories: ' + categories.join(', '));
          } else {
            Logger.log('Warning: Could not parse categories from: ' + categoriesStr);
          }
        } else {
          Logger.log('Warning: No categories found in frontmatter');
        }
      }
    } else {
      throw new Error('Draft does not have frontmatter. Please ensure it was saved correctly.');
    }
    
    // If no title in frontmatter, try to extract from content (look for # Title)
    // But keep the H1 in content if it exists - it's part of the post structure
    if (!title) {
      const titleMatch = markdownContent.match(/^#\s+(.+?)(?:\n|$)/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
        // Don't remove title from content - keep it as H1 in the post
      }
    }
    
    if (!title) {
      throw new Error('Could not find title in draft. Please ensure the draft has a title in frontmatter or as # Title in content.');
    }
    
    // Use current date if not in frontmatter
    if (!dateStr) {
      const date = new Date();
      dateStr = date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
    }
    
    // Format date if not in frontmatter
    if (!formattedDate) {
      const dateObj = new Date(dateStr);
      formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Clean markdown content: remove metadata and conversation artifacts
    // BUT FIRST: Extract "Suggested Categories" from content if present (overrides frontmatter)
    const contentLower = markdownContent.toLowerCase();
    
    // Check for both "Suggested Categories" and "Categories:" (as metadata, not in frontmatter)
    let categoriesIndex = contentLower.indexOf('suggested categories');
    let suggestedCategories = [];
    
    if (categoriesIndex !== -1) {
      // Extract suggested categories from content
      // Pattern 1: Markdown list format (preferred): lines starting with "- "
      // Pattern 2: HTML ul/li format (backward compatibility)
      // Pattern 3: **Suggested Categories**: cat1, cat2, cat3
      // Pattern 4: Suggested Categories: cat1, cat2, cat3
      const lineStart = categoriesIndex;
      const restOfContent = markdownContent.substring(lineStart);
      
      // First, try to extract from markdown list format (preferred format: lines starting with "- ")
      const markdownListPattern = /(?:^|\n)\s*-\s+([^\n]+)/g;
      const markdownMatches = [...restOfContent.matchAll(markdownListPattern)];
      
      if (markdownMatches && markdownMatches.length > 0) {
        // Extract categories from markdown list format
        for (const match of markdownMatches) {
          const category = match[1].trim();
          // Skip if it's a header or other non-category text
          if (category.length > 0 && 
              !category.toLowerCase().includes('suggested') && 
              !category.toLowerCase().includes('categories') &&
              !category.toLowerCase().includes('cat 1') &&
              !category.toLowerCase().includes('cat 2') &&
              !category.toLowerCase().includes('cat 3')) {
            suggestedCategories.push(category);
          }
        }
        Logger.log('Found ' + suggestedCategories.length + ' categories from markdown list format: ' + suggestedCategories.join(', '));
      } else {
        // Fallback to HTML ul/li format (backward compatibility)
        const ulPattern = /<ul>[\s\S]*?<\/ul>/i;
        const ulMatch = restOfContent.match(ulPattern);
        
        if (ulMatch) {
          // Extract all <li> tags from the ul
          const liMatches = ulMatch[0].matchAll(/<li>([^<]+)<\/li>/gi);
          for (const match of liMatches) {
            const category = match[1].trim();
            if (category.length > 0) {
              suggestedCategories.push(category);
            }
          }
          Logger.log('Found ' + suggestedCategories.length + ' categories from ul/li format: ' + suggestedCategories.join(', '));
        } else {
          // Fallback to comma-separated format
          let categoriesStr = '';
          // Try with ** prefix (most common format)
          const pattern1 = restOfContent.match(/\*\*\s*[Ss]uggested\s+[Cc]ategories\s*:?\s*([^\n]+)/i);
          if (pattern1) {
            categoriesStr = pattern1[1].trim();
          } else {
            // Try with single * or no prefix
            const pattern2 = restOfContent.match(/[*]?\s*[Ss]uggested\s+[Cc]ategories\s*:?\s*([^\n]+)/i);
            if (pattern2) {
              categoriesStr = pattern2[1].trim();
            } else {
              // Try without any prefix
              const pattern3 = restOfContent.match(/[Ss]uggested\s+[Cc]ategories\s*:?\s*([^\n]+)/i);
              if (pattern3) {
                categoriesStr = pattern3[1].trim();
              }
            }
          }
          
          if (categoriesStr) {
            // Remove any trailing text that might be on the same line (like "This feels like a solid")
            // Take only up to the first newline or end of string
            categoriesStr = categoriesStr.split(/\n/)[0].trim();
            // Remove any trailing punctuation or extra text
            categoriesStr = categoriesStr.replace(/\s+This feels.*$/i, '').trim();
            
            Logger.log('Extracted categories string: "' + categoriesStr + '"');
            
            // Split by comma and clean up
            suggestedCategories = categoriesStr.split(',').map(c => c.trim()).filter(c => c.length > 0);
            Logger.log('Found ' + suggestedCategories.length + ' suggested categories in content: ' + suggestedCategories.join(', '));
          } else {
            Logger.log('Warning: Found "suggested categories" text but could not parse categories from: ' + restOfContent.substring(0, 200));
            Logger.log('Full restOfContent: ' + restOfContent.substring(0, 500));
          }
        }
      }
      
      // Use suggested categories if they exist (they override frontmatter)
      if (suggestedCategories.length > 0) {
        categories = suggestedCategories;
        Logger.log('Using suggested categories from content instead of frontmatter');
      }
    } else {
      // Also check for standalone "Categories:" (not in frontmatter, which would be "categories:")
      // Look for "Categories:" at the start of a line or after a newline
      const categoriesRegex = /(?:\n|^)\s*Categories:\s*/i;
      const match = markdownContent.search(categoriesRegex);
      if (match !== -1) {
        categoriesIndex = match;
        // Extract categories from this line
        const categoriesLine = markdownContent.substring(match);
        const categoriesMatch = categoriesLine.match(/Categories:\s*([^\n]+)/i);
        if (categoriesMatch) {
          let categoriesStr = categoriesMatch[1].trim();
          categoriesStr = categoriesStr.split(/\n/)[0].trim();
          suggestedCategories = categoriesStr.split(',').map(c => c.trim()).filter(c => c.length > 0);
          if (suggestedCategories.length > 0) {
            categories = suggestedCategories;
            Logger.log('Using categories from content: ' + categories.join(', '));
          }
        }
      }
    }
    
    // Remove "Suggested Categories" section from content if found (including markdown list or ul/li HTML)
    if (categoriesIndex !== -1) {
      // Find the start of the line containing the categories metadata
      let lineStart = categoriesIndex;
      while (lineStart > 0 && markdownContent[lineStart - 1] !== '\n') {
        lineStart--;
      }
      
      // Check if there's a markdown list after "Suggested Categories" (preferred format)
      const restOfContent = markdownContent.substring(lineStart);
      const markdownListPattern = /(?:^|\n)(\s*-\s+[^\n]+(?:\n\s*-\s+[^\n]+)*)/;
      const markdownListMatch = restOfContent.match(markdownListPattern);
      
      if (markdownListMatch) {
        // Remove from lineStart to end of markdown list
        const listEndIndex = lineStart + restOfContent.indexOf(markdownListMatch[0]) + markdownListMatch[0].length;
        markdownContent = markdownContent.substring(0, lineStart).trim() + 
                         markdownContent.substring(listEndIndex).trim();
        Logger.log('Removed categories metadata including markdown list');
      } else {
        // Fallback: Check for HTML ul/li block (backward compatibility)
        const ulPattern = /<ul>[\s\S]*?<\/ul>/i;
        const ulMatch = restOfContent.match(ulPattern);
        
        if (ulMatch) {
          // Remove from lineStart to end of ul tag
          const ulEndIndex = lineStart + restOfContent.indexOf(ulMatch[0]) + ulMatch[0].length;
          markdownContent = markdownContent.substring(0, lineStart).trim() + 
                           markdownContent.substring(ulEndIndex).trim();
          Logger.log('Removed categories metadata including ul/li HTML block');
        } else {
          // Remove everything from that line onwards (comma-separated format)
          markdownContent = markdownContent.substring(0, lineStart).trim();
          Logger.log('Removed categories metadata and everything after it');
        }
      }
    }
    
    // Final check: If we found suggested categories, use them (they override frontmatter)
    if (suggestedCategories.length > 0) {
      categories = suggestedCategories;
      Logger.log('Final categories (from suggested): ' + categories.join(', '));
    } else {
      Logger.log('Final categories (from frontmatter): ' + categories.join(', '));
    }
    
    // Default categories if none found (after checking all sources)
    if (categories.length === 0) {
      categories = ['Technology'];
      Logger.log('No categories found, using default: Technology');
    }
    
    // Remove common conversation artifacts (more aggressive patterns)
    const conversationPatterns = [
      /Looks done[—\-]?want to publish\?/gi,
      /I've corrected.*?Everything else remains as is.*?Looks done/gs,
      /I've corrected.*?Everything else remains as is.*?solid piece/gs,
      /Awesome, glad you're feeling good.*?let's hit publish!/gs,
      /Awesome, glad you're feeling good.*?ready to go live/gs,
      /If there's anything last-minute.*?Otherwise, let's hit publish!/gs,
      /I've got it locked in.*?let's hit publish!/gs,
      /I've got it locked in.*?ready to go live.*?let's hit publish!/gs,
      /I'll make sure it's formatted properly.*?let's hit publish!/gs,
      /Otherwise, let's hit publish!/gi
    ];
    
    conversationPatterns.forEach(pattern => {
      const beforeLength = markdownContent.length;
      markdownContent = markdownContent.replace(pattern, '').trim();
      if (markdownContent.length < beforeLength) {
        Logger.log('Removed conversation artifact: ' + pattern.toString());
      }
    });
    
    // Remove any remaining lines that look like conversation metadata
    // Look for lines that contain phrases like "corrected", "remains as is", "ready to go live", etc.
    const metadataLines = markdownContent.split('\n').filter(line => {
      const lowerLine = line.toLowerCase().trim();
      return !(
        lowerLine.includes('corrected') && lowerLine.includes('remains as is') ||
        lowerLine.includes('awesome, glad') ||
        lowerLine.includes('ready to go live') ||
        lowerLine.includes("let's hit publish") ||
        lowerLine.includes('formatted properly') ||
        lowerLine.includes('last-minute') && lowerLine.includes('tweak')
      );
    });
    
    if (metadataLines.length < markdownContent.split('\n').length) {
      markdownContent = metadataLines.join('\n').trim();
      Logger.log('Removed metadata lines from content');
    }
    
    // Remove duplicate content blocks
    // Split by double newlines (paragraphs)
    const paragraphs = markdownContent.split(/\n\n+/);
    const uniqueParagraphs = [];
    const seenParagraphs = new Set();
    
    paragraphs.forEach(para => {
      const normalized = para.trim().toLowerCase().replace(/\s+/g, ' ');
      // Only add if we haven't seen this exact paragraph before
      // Minimum length check to avoid removing short legitimate repetitions
      if (!seenParagraphs.has(normalized) && normalized.length > 20) {
        seenParagraphs.add(normalized);
        uniqueParagraphs.push(para);
      }
    });
    
    markdownContent = uniqueParagraphs.join('\n\n').trim();
    
    // Additional check: if content appears to be duplicated (same first 200 chars appear twice)
    const first200Chars = markdownContent.substring(0, 200).trim();
    const first200Normalized = first200Chars.toLowerCase().replace(/\s+/g, ' ');
    const restOfContent = markdownContent.substring(200);
    
    // Check if the beginning pattern appears again later in the content
    const duplicateIndex = restOfContent.toLowerCase().replace(/\s+/g, ' ').indexOf(first200Normalized);
    if (duplicateIndex > 50) {
      // Likely duplicate - keep only the first occurrence
      const estimatedDuplicateStart = 200 + duplicateIndex - 50; // Some buffer
      markdownContent = markdownContent.substring(0, estimatedDuplicateStart).trim();
      Logger.log('Removed duplicate content block from markdown');
    }
    
    // Convert markdown to HTML
    const htmlContent = convertToHTML(markdownContent);
    
    // Generate URL slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const filename = `${dateStr}-${slug}.html`;
    
    // Generate description from first paragraph (for meta tags)
    let description = htmlContent.replace(/<[^>]+>/g, '').substring(0, 160).trim();
    if (description.length === 160) {
      description += '...';
    }
    
    // Generate category links HTML
    let categoryLinks = '';
    categories.forEach(cat => {
      const categorySlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      categoryLinks += `<a href="categories/${categorySlug}.html" class="category-tag">${escapeHtml(cat)}</a>\n                `;
    });
    
    // Generate category meta tags
    let categoryMetaTags = '';
    categories.forEach(cat => {
      categoryMetaTags += `    <meta property="article:tag" content="${escapeHtml(cat)}">\n`;
    });
    
    // Generate keywords for JSON-LD
    const keywords = categories.join(', ');
    
    // Generate full HTML post
    const postHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(title)} - ${escapeHtml(description)}">
    <title>${escapeHtml(title)} - Gary Teh's Blog</title>
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://garyteh.com/${filename}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:site_name" content="Gary Teh's Blog">
    <meta property="article:published_time" content="${dateStr}T00:00:00+00:00">
    <meta property="article:author" content="Gary Teh">
${categoryMetaTags}    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:url" content="https://garyteh.com/${filename}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    
    <!-- Additional meta for better sharing -->
    <meta name="author" content="Gary Teh">
    <link rel="canonical" href="https://garyteh.com/${filename}">
    
    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${escapeHtml(title)}",
  "description": "${escapeHtml(description)}",
  "author": {
    "@type": "Person",
    "name": "Gary Teh"
  },
  "datePublished": "${dateStr}T00:00:00+00:00",
  "dateModified": "${dateStr}T00:00:00+00:00",
  "publisher": {
    "@type": "Organization",
    "name": "Gary Teh's Blog",
    "url": "https://garyteh.com"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://garyteh.com/${filename}"
  },
  "keywords": "${escapeHtml(keywords)}"
}
    </script>
    
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
        .category-tag, .tag, a.category-tag {
            background: #ecf0f1;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.9em;
            display: inline-block;
            margin-top: 5px;
            color: #2c3e50;
            text-decoration: none;
        }
        a.category-tag:hover {
            background: #3498db;
            color: white;
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .audio-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .listen-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .listen-btn:hover:not(:disabled) {
            background: #2980b9;
            transform: translateY(-1px);
        }
        .listen-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .listen-btn.playing {
            background: #e74c3c;
        }
        .listen-btn.playing:hover {
            background: #c0392b;
        }
        .speech-speed-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: #555;
        }
        .speech-speed-controls label {
            font-weight: 500;
        }
        .speech-speed-controls select {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            font-size: 0.9rem;
            cursor: pointer;
        }
        .speech-speed-controls select:focus {
            outline: none;
            border-color: #3498db;
        }
        footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to all posts</a>
        
        <div class="header">
            <h1>${escapeHtml(title)}</h1>
            <div class="post-meta">
                <span class="post-date">${escapeHtml(formattedDate)}</span>
                ${categoryLinks}
            </div>
        </div>

        <div class="audio-controls">
            <button id="listenBtn" class="listen-btn">
                <span id="listenIcon">🔊</span>
                <span id="listenText">Listen</span>
            </button>
            <div class="speech-speed-controls">
                <label for="speedSelect">Speed:</label>
                <select id="speedSelect">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="1.75">1.75x</option>
                    <option value="2">2x</option>
                </select>
            </div>
        </div>

        <div class="content" id="postContent">
${htmlContent}
        </div>

        <footer>
            <p><a href="index.html">← Back to all posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
    <script id="mcjs">!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/f4002ef7c62ee64494321ba14/9c56fa20706b0138cf6fea672.js");</script>
    <script>
        (function() {
            if (!('speechSynthesis' in window)) {
                document.getElementById('listenBtn').disabled = true;
                document.getElementById('listenBtn').title = 'Text-to-speech not supported in this browser';
                return;
            }
            
            let currentUtterance = null;
            let isPlaying = false;
            const listenBtn = document.getElementById('listenBtn');
            const listenIcon = document.getElementById('listenIcon');
            const listenText = document.getElementById('listenText');
            const speedSelect = document.getElementById('speedSelect');
            const postContent = document.getElementById('postContent');
            
            // Load saved speed preference (defaults to 1x if not set)
            const savedSpeed = localStorage.getItem('blogSpeechSpeed') || '1';
            
            // Set the selected option based on saved preference
            speedSelect.value = savedSpeed;
            
            // Ensure the visual selection matches (in case the value wasn't in the list)
            if (!speedSelect.options[speedSelect.selectedIndex] || 
                speedSelect.options[speedSelect.selectedIndex].value !== savedSpeed) {
                // Find the matching option
                for (let i = 0; i < speedSelect.options.length; i++) {
                    if (speedSelect.options[i].value === savedSpeed) {
                        speedSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Save speed preference when changed (persists across all blog posts)
            speedSelect.addEventListener('change', function() {
                const newSpeed = speedSelect.value;
                localStorage.setItem('blogSpeechSpeed', newSpeed);
                // Update current utterance if playing
                if (currentUtterance) {
                    currentUtterance.rate = parseFloat(newSpeed);
                }
            });
            
            function getTextContent() {
                // Get all text from post content, excluding code blocks and script tags
                const content = postContent.cloneNode(true);
                // Remove script and style tags
                content.querySelectorAll('script, style, pre, code').forEach(el => el.remove());
                // Get text content
                return content.textContent || content.innerText || '';
            }
            
            function toggleSpeech() {
                if (isPlaying && currentUtterance) {
                    // Stop speaking
                    window.speechSynthesis.cancel();
                    currentUtterance = null;
                    isPlaying = false;
                    listenBtn.classList.remove('playing');
                    listenIcon.textContent = '🔊';
                    listenText.textContent = 'Listen';
                } else {
                    // Start speaking
                    const text = getTextContent();
                    if (!text.trim()) {
                        alert('No content to read');
                        return;
                    }
                    
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = parseFloat(speedSelect.value);
                    utterance.pitch = 1;
                    utterance.volume = 1;
                    
                    utterance.onstart = function() {
                        isPlaying = true;
                        listenBtn.classList.add('playing');
                        listenIcon.textContent = '⏸️';
                        listenText.textContent = 'Pause';
                    };
                    
                    utterance.onend = function() {
                        isPlaying = false;
                        currentUtterance = null;
                        listenBtn.classList.remove('playing');
                        listenIcon.textContent = '🔊';
                        listenText.textContent = 'Listen';
                    };
                    
                    utterance.onerror = function(event) {
                        console.error('Speech synthesis error:', event);
                        isPlaying = false;
                        currentUtterance = null;
                        listenBtn.classList.remove('playing');
                        listenIcon.textContent = '🔊';
                        listenText.textContent = 'Listen';
                        alert('Error reading text. Please try again.');
                    };
                    
                    currentUtterance = utterance;
                    window.speechSynthesis.speak(utterance);
                }
            }
            
            listenBtn.addEventListener('click', toggleSpeech);
            
            // Stop speech when page is unloaded
            window.addEventListener('beforeunload', function() {
                if (isPlaying) {
                    window.speechSynthesis.cancel();
                }
            });
        })();
    </script>
</body>
</html>`;
    
    // Get SHA if post already exists (for update)
    const postSHA = getGitHubFileSHA(filename);
    
    // Prepare file for commit
    const files = [{
      path: filename,
      content: postHTML,
      sha: postSHA // null for new, SHA for update
    }];
    
    Logger.log('Publishing post: ' + filename + (postSHA ? ' (updating existing)' : ' (new post)'));
    
    // Commit to GitHub
    const commitMessage = postSHA 
      ? `Post updated: ${title}`
      : `Post published: ${title}`;
    
    const result = commitToGitHub(files, commitMessage);
    
    Logger.log('Post published: ' + JSON.stringify(result));
    
    // Update category pages (non-blocking - don't wait for completion)
    try {
      updateCategoryPages(categories, title, filename, dateStr, formattedDate);
    } catch (e) {
      Logger.log('Warning: Could not update category pages: ' + e.message);
      // Don't fail the publish if category pages fail
    }
    
    // Regenerate index.html to include the new post
    // Note: This may take some time, but it's important for posts to appear on the landing page
    try {
      Logger.log('Regenerating index.html to include new post...');
      const regeneratedIndex = regenerateIndexHTML();
      
      // Get SHA for index.html
      const indexSHA = getGitHubFileSHA('index.html');
      
      // Commit the regenerated index.html
      const indexFiles = [{
        path: 'index.html',
        content: regeneratedIndex,
        sha: indexSHA
      }];
      
      commitToGitHub(indexFiles, 'Auto-updated index.html: Added ' + filename);
      Logger.log('Index.html regenerated and committed successfully');
    } catch (indexError) {
      Logger.log('Warning: Could not regenerate index.html: ' + indexError.toString());
      Logger.log('You may need to manually call regenerateIndex() to update the landing page');
      // Don't fail the publish if index regeneration fails
    }
    
    return {
      success: true,
      filename: filename,
      url: `https://garyteh.com/${filename}`,
      message: postSHA ? 'Post updated successfully!' : 'Post published successfully! Index regenerated.'
    };
    
  } catch (e) {
    Logger.log('Publish draft error: ' + e.toString());
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Updates category pages for a published blog post
 * Creates category pages if they don't exist, or adds the post link to existing pages
 * @param {Array<string>} categories - Array of category names
 * @param {string} postTitle - Title of the blog post
 * @param {string} postFilename - Filename of the blog post (e.g., "2025-12-02-title.html")
 * @param {string} postDate - Date in YYYY-MM-DD format
 * @param {string} formattedDate - Formatted date string
 */
function updateCategoryPages(categories, postTitle, postFilename, postDate, formattedDate) {
  try {
    categories.forEach(category => {
      try {
        const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const categoryPath = `categories/${categorySlug}.html`;
        
        // Check if category page exists
        let categoryContent = fetchGitHubFile(categoryPath);
        let isNewCategory = !categoryContent;
        
        if (isNewCategory) {
          // Create new category page
          categoryContent = generateCategoryPageHTML(category, []);
        }
        
        // Parse existing posts from category page
        const existingPosts = parsePostsFromCategoryPage(categoryContent);
        
        // Check if post already exists in category page
        const postExists = existingPosts.some(p => p.filename === postFilename);
        
        if (!postExists) {
          // Add new post to the list
          existingPosts.push({
            title: postTitle,
            filename: postFilename,
            date: postDate,
            formattedDate: formattedDate
          });
          
          // Sort posts by date (newest first)
          existingPosts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          
          // Regenerate category page HTML
          categoryContent = generateCategoryPageHTML(category, existingPosts);
          
          // Get SHA if category page exists
          const categorySHA = getGitHubFileSHA(categoryPath);
          
          // Commit updated category page
          const files = [{
            path: categoryPath,
            content: categoryContent,
            sha: categorySHA
          }];
          
          const commitMessage = isNewCategory 
            ? `Create category page: ${category}`
            : `Add post to category: ${category} - ${postTitle}`;
          
          commitToGitHub(files, commitMessage);
          Logger.log(`Category page ${categoryPath} updated successfully`);
        } else {
          Logger.log(`Post ${postFilename} already exists in category ${category}`);
        }
      } catch (e) {
        Logger.log(`Error updating category page for ${category}: ${e.toString()}`);
        // Continue with other categories
      }
    });
  } catch (e) {
    Logger.log('Error in updateCategoryPages: ' + e.toString());
    throw e;
  }
}

/**
 * Generates HTML for a category page
 * @param {string} categoryName - Name of the category
 * @param {Array<Object>} posts - Array of post objects with title, filename, date, formattedDate
 * @return {string} Complete HTML for the category page
 */
function generateCategoryPageHTML(categoryName, posts) {
  // Group posts by year
  const postsByYear = {};
  posts.forEach(post => {
    const year = post.date.substring(0, 4);
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });
  
  // Get years in descending order
  const years = Object.keys(postsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  
  // Generate posts HTML by year
  let postsHTML = '';
  years.forEach(year => {
    const yearPosts = postsByYear[year];
    postsHTML += `        <div class="year-section" data-year="${year}">
            <h2 class="year-header">${year} <span style="font-size: 0.6em; color: #95a5a6;">(${yearPosts.length} ${yearPosts.length === 1 ? 'post' : 'posts'})</span></h2>
`;
    yearPosts.forEach(post => {
      postsHTML += `            <div class="post">
                <div class="post-title"><a href="../${escapeHtml(post.filename)}">${escapeHtml(post.title)}</a></div>
                <div class="post-meta">
                    <span class="post-date">${escapeHtml(post.date)}</span>
                </div>
            </div>
`;
    });
    postsHTML += `        </div>
`;
  });
  
  const totalPosts = posts.length;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-F4W32NLZDE"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'G-F4W32NLZDE');
    </script>
    <title>${escapeHtml(categoryName)} - Gary Teh's Blog</title>
    <meta name="description" content="All posts in the ${escapeHtml(categoryName)} category on Gary Teh's Blog">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <style>
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
        header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
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
        .stats {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            color: #555;
        }
        .year-section {
            margin-bottom: 40px;
        }
        .year-header {
            color: #3498db;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }
        .post {
            margin-bottom: 15px;
            padding: 15px;
            background: #fafafa;
            border-left: 4px solid #3498db;
            transition: all 0.3s ease;
        }
        .post:hover {
            background: #f0f8ff;
            border-left-color: #2980b9;
            transform: translateX(5px);
        }
        .post-title {
            font-size: 1.2em;
            margin-bottom: 5px;
        }
        .post-title a {
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
        }
        .post-title a:hover {
            color: #3498db;
        }
        .post-meta {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .post-date {
            font-weight: 600;
        }
        footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
        }
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-link">← Back to all posts</a>
        
        <header>
            <h1>${escapeHtml(categoryName)}</h1>
            <div class="stats">
                <strong>${totalPosts} ${totalPosts === 1 ? 'post' : 'posts'}</strong> in this category
            </div>
        </header>
${postsHTML}
        <footer>
            <p><a href="../index.html">← Back to all posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
    <script id="mcjs">!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/f4002ef7c62ee64494321ba14/9c56fa20706b0138cf6fea672.js");</script>
</body>
</html>`;
}

/**
 * Parses posts from an existing category page HTML
 * @param {string} categoryHTML - HTML content of the category page
 * @return {Array<Object>} Array of post objects with title, filename, date, formattedDate
 */
function parsePostsFromCategoryPage(categoryHTML) {
  const posts = [];
  
  // Match post entries in the HTML
  const postPattern = /<div class="post">\s*<div class="post-title"><a href="\.\.\/([^"]+)">([^<]+)<\/a><\/div>\s*<div class="post-meta">\s*<span class="post-date">([^<]+)<\/span>/g;
  let match;
  
  while ((match = postPattern.exec(categoryHTML)) !== null) {
    posts.push({
      filename: match[1],
      title: match[2],
      date: match[3],
      formattedDate: match[3] // Use date as formatted date for now
    });
  }
  
  return posts;
}

/**
 * Helper function to escape HTML entities
 * @param {string} text - Text to escape
 * @return {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Main publish function - generates post, updates index, commits to GitHub
 * @deprecated Use publishDraft() instead - publishes from saved drafts
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

