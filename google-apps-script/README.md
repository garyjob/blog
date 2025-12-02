# Google Apps Script - AI Blog Drafter for Garyteh.com

A mobile-first web app for drafting blog posts with voice input, Grok AI conversation, and automatic publishing to GitHub Pages.

## Features

- 🎤 **Voice Input** - Use Web Speech API for hands-free drafting
- 🤖 **Grok AI Integration** - Conversational editing with AI assistance
- 📱 **Mobile-First Design** - Optimized for phone use
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🚀 **Auto-Publish** - Automatically commits to GitHub Pages
- 🔒 **Secure** - API keys stored server-side only

## Setup Instructions

### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **"New Project"**
3. Delete the default `Code.gs` content
4. Copy the contents of `Code.gs` from this folder into the editor
5. Click **"+"** next to "Files" → **"HTML"** → Name it `Index`
6. Copy the contents of `Index.html` from this folder into the editor

### 2. Configure Script Properties

Run the setup function to configure your credentials:

1. In the Apps Script editor, select the `setupProperties` function from the dropdown
2. Click **Run** (▶️)
3. Authorize the script when prompted
4. Open the function and update these values:
   - `ALLOWED_EMAIL` - Your email address (for access control)
   - `GROK_KEY` - Your x.ai API key (get from https://x.ai/api)
   - `GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `GITHUB_OWNER` - `garyjob` (already set)
   - `GITHUB_REPO` - `blog` (already set)
   - `GITHUB_BRANCH` - `main` (already set)

**To get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: "Blog Drafter"
4. Select scope: **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. Copy the token and paste it in `setupProperties()`

**To get Grok API Key:**
1. Go to https://x.ai/api
2. Sign in and create an API key
3. Copy the key and paste it in `setupProperties()`

### 3. Deploy as Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure:
   - **Description**: "AI Blog Drafter"
   - **Execute as**: **Me**
   - **Who has access**: **Only myself** (or "Anyone with Google account" if you want to use email check)
5. Click **"Deploy"**
6. Copy the **Web app URL** - this is your app link!

### 4. Test the App

1. Open the Web app URL in your browser
2. You should see the "AI Blog Drafter" interface
3. Try typing or using voice input
4. Start a conversation with Grok!

## Usage

### Starting a Post

1. Open the web app on your phone or computer
2. Type or speak: "What's today's post?"
3. Share your raw ideas
4. Grok will help structure them into a blog post

### Voice Input

- Click the 🎤 button to start voice recording
- Speak your message
- Click again to stop (or it stops automatically)
- The transcribed text appears in the input field

### Publishing

1. Have a conversation with Grok to refine your post
2. When Grok says "Looks done—want to publish?", the Publish button enables
3. Click **"Publish Post"**
4. Confirm the publish
5. The post is automatically:
   - Generated as HTML using your blog template
   - Added to `index.html`
   - Committed to GitHub
   - Available at `garyteh.com` within minutes

## How It Works

### Client-Side (Index.html)
- Voice input via Web Speech API
- Chat UI with message history
- Conversation state in `localStorage`
- Calls server functions via `google.script.run`

### Server-Side (Code.gs)
- **doGet()** - Serves HTML page with security check
- **callGrok()** - Calls Grok API (API key stays on server)
- **generatePostHTML()** - Creates post HTML from template
- **updateIndexHTML()** - Inserts post into index.html
- **commitToGitHub()** - Commits files to GitHub

### Security
- API keys stored in Script Properties (server-side only)
- Email-based access control
- All external API calls happen server-side

## Template Management

The app caches your blog post template from the latest post on GitHub. To refresh the template:

1. In Apps Script editor, run the `refreshTemplate()` function
2. Or the template will auto-refresh if it's not cached

## Troubleshooting

### "GROK_KEY not configured"
- Run `setupProperties()` function and update the API key

### "GITHUB_TOKEN not configured"
- Run `setupProperties()` function and update the token
- Make sure token has `repo` scope

### "Access Denied"
- Check that `ALLOWED_EMAIL` in Script Properties matches your Google account email
- Or change deployment to "Only myself"

### Voice input not working
- Make sure you're using Chrome or Edge (Web Speech API support)
- Check browser permissions for microphone access
- Try typing instead

### Template issues
- Run `refreshTemplate()` to fetch latest template from GitHub
- Check that latest post exists and is accessible

## File Structure

```
google-apps-script/
├── Code.gs          # Server-side functions
├── Index.html       # Client-side UI
└── README.md        # This file
```

## Notes

- Conversation history is stored in browser `localStorage`
- Dark mode preference is saved in `localStorage`
- The app works best on mobile browsers (Chrome, Safari)
- GitHub Pages rebuilds automatically after commit (usually 1-2 minutes)

## Support

If you encounter issues:
1. Check the Apps Script execution log (View → Execution log)
2. Check browser console for client-side errors
3. Verify all Script Properties are set correctly
4. Test API keys independently (Grok API, GitHub API)

---

**Happy blogging! 🚀**

