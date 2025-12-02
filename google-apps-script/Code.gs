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
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('AI Blog Drafter for Garyteh.com')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
 * Generates HTML for a blog post using cached template
 * @param {string} title - Post title
 * @param {string} content - Post content (HTML)
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
  
  // Replace placeholders in template
  let html = template
    .replace(/{{TITLE}}/g, escapeHtml(title))
    .replace(/{{DESCRIPTION}}/g, escapeHtml(title))
    .replace(/{{DATE}}/g, formattedDate)
    .replace(/{{DATE_ISO}}/g, date)
    .replace(/{{CATEGORIES}}/g, categoryTags)
    .replace(/{{CONTENT}}/g, content);
  
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
 * Updates index.html with new post entry
 * @param {string} indexContent - Current index.html content
 * @param {Object} postData - Post data {title, filename, date, categories, year}
 * @return {string} Updated index.html content
 */
function updateIndexHTML(indexContent, postData) {
  const year = postData.year;
  const postHTML = generatePostEntryHTML(postData);
  
  // Check if year section exists
  const yearPattern = new RegExp(
    `<div class="year-section" data-year="${year}">`,
    'i'
  );
  
  if (yearPattern.test(indexContent)) {
    // Year exists - insert after year header
    const insertPattern = new RegExp(
      `(<div class="year-section" data-year="${year}">[\\s\\S]*?<h2 class="year-header">${year}[^<]*<span[^>]*>\\()(\\d+)( posts\\)</span>[\\s\\S]*?</h2>\\s*)`,
      'i'
    );
    
    indexContent = indexContent.replace(insertPattern, (match, p1, p2, p3) => {
      const newCount = parseInt(p2) + 1;
      return p1 + newCount + p3 + '\n            ' + postHTML;
    });
    
    // Update post count in header
    const countPattern = new RegExp(
      `(${year} <span[^>]*>\\()(\\d+)( posts\\)</span>)`,
      'i'
    );
    indexContent = indexContent.replace(countPattern, (match, p1, p2, p3) => {
      return p1 + (parseInt(p2) + 1) + p3;
    });
    
  } else {
    // Year doesn't exist - create new year section
    // Find first year section and insert before it
    const firstYearPattern = /<div class="year-section" data-year="(\d{4})">/;
    const firstYearMatch = indexContent.match(firstYearPattern);
    
    if (firstYearMatch) {
      const newYearSection = generateYearSectionHTML(postData);
      indexContent = indexContent.replace(
        firstYearPattern,
        newYearSection + '\n\n        '
      );
    } else {
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
  }
  
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
 * Commits files to GitHub
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
  
  // Get current branch SHA
  const branchUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`;
  const branchResponse = UrlFetchApp.fetch(branchUrl, {
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    muteHttpExceptions: true
  });
  
  if (branchResponse.getResponseCode() !== 200) {
    throw new Error('Failed to get branch info');
  }
  
  const branchData = JSON.parse(branchResponse.getContentText());
  const baseTreeSHA = branchData.object.sha;
  
  // Get base tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${baseTreeSHA}?recursive=1`;
  const treeResponse = UrlFetchApp.fetch(treeUrl, {
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    muteHttpExceptions: true
  });
  
  if (treeResponse.getResponseCode() !== 200) {
    throw new Error('Failed to get tree');
  }
  
  const treeData = JSON.parse(treeResponse.getContentText());
  
  // Build new tree with updated files
  const tree = files.map(file => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    sha: file.sha || null,
    content: file.content ? Utilities.base64Encode(file.content) : null
  }));
  
  // Create tree
  const createTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees`;
  const createTreeResponse = UrlFetchApp.fetch(createTreeUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    payload: JSON.stringify({
      base_tree: baseTreeSHA,
      tree: tree
    }),
    muteHttpExceptions: true
  });
  
  if (createTreeResponse.getResponseCode() !== 201) {
    const error = JSON.parse(createTreeResponse.getContentText());
    throw new Error('Failed to create tree: ' + (error.message || 'Unknown error'));
  }
  
  const newTreeSHA = JSON.parse(createTreeResponse.getContentText()).sha;
  
  // Create commit
  const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits`;
  const commitResponse = UrlFetchApp.fetch(commitUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    payload: JSON.stringify({
      message: message,
      tree: newTreeSHA,
      parents: [baseTreeSHA]
    }),
    muteHttpExceptions: true
  });
  
  if (commitResponse.getResponseCode() !== 201) {
    const error = JSON.parse(commitResponse.getContentText());
    throw new Error('Failed to create commit: ' + (error.message || 'Unknown error'));
  }
  
  const commitSHA = JSON.parse(commitResponse.getContentText()).sha;
  
  // Update branch reference
  const updateRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
  const updateRefResponse = UrlFetchApp.fetch(updateRefUrl, {
    method: 'patch',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + token,
      'Accept': 'application/vnd.github.v3+json'
    },
    payload: JSON.stringify({
      sha: commitSHA
    }),
    muteHttpExceptions: true
  });
  
  if (updateRefResponse.getResponseCode() !== 200) {
    const error = JSON.parse(updateRefResponse.getContentText());
    throw new Error('Failed to update branch: ' + (error.message || 'Unknown error'));
  }
  
  return {
    success: true,
    commitSHA: commitSHA,
    message: 'Post published successfully!'
  };
}

// ============================================================================
// PUBLISH FUNCTION
// ============================================================================

/**
 * Main publish function - generates post, updates index, commits to GitHub
 * @param {string} title - Post title
 * @param {string} content - Post content (HTML)
 * @param {Array} categories - Array of category strings
 * @return {Object} Result with success status and URL
 */
function publishPost(title, content, categories) {
  try {
    // Generate filename from title
    const date = new Date();
    const dateStr = date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const filename = `${dateStr}-${slug}.html`;
    
    // Generate post HTML
    const postHTML = generatePostHTML(title, content, dateStr, categories);
    
    // Get current index.html
    const indexContent = fetchGitHubFile('index.html');
    if (!indexContent) {
      throw new Error('Failed to fetch index.html');
    }
    
    // Update index.html
    const year = date.getFullYear();
    const updatedIndex = updateIndexHTML(indexContent, {
      title: title,
      filename: filename,
      date: dateStr,
      categories: categories || [],
      year: year,
      isFirstInYear: false // Will be determined in updateIndexHTML
    });
    
    // Get SHAs for files
    const indexSHA = getGitHubFileSHA('index.html');
    
    // Prepare files for commit
    const files = [
      {
        path: filename,
        content: postHTML,
        sha: null // New file
      },
      {
        path: 'index.html',
        content: updatedIndex,
        sha: indexSHA
      }
    ];
    
    // Commit to GitHub
    const result = commitToGitHub(files, `Auto-published: ${title} via Grok`);
    
    return {
      success: true,
      filename: filename,
      url: `https://garyteh.com/${filename}`,
      message: result.message
    };
    
  } catch (e) {
    Logger.log('Publish error: ' + e.toString());
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

