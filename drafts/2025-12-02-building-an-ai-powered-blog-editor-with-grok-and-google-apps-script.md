---
title: "Building an AI-Powered Blog Editor with Grok and Google Apps Script"
date: 2025-12-02
formattedDate: "December 2, 2025"
categories: ["Technology", "AI", "Startups", "Productivity"]
---

I've been thinking about this for a while—how do you make the act of writing less friction, more natural' Today, I finally built something that feels right: a blog editor powered by Grok AI, accessible from anywhere, that lets me draft posts through conversation.

**The Setup**

The system lives in a Google Apps Script web app, accessible at `garyteh.com/admin`. It's a simple interface—chat box, voice input, and a camera button for images. But behind that simplicity is a workflow that's changed how I think about writing.

Here's how it works: I start with a prompt like "What's today's post'" Grok responds, and we go back and forth. I can speak my thoughts (voice-to-text), type them, or even attach images. The conversation builds the post organically. When it feels done, I save it as a draft. Later, when I'm ready, I convert that draft into a published blog post.

**The Technical Stack**

The whole thing is open source and lives on GitHub: [https://github.com/garyjob/blog/](https://github.com/garyjob/blog/)

The architecture is straightforward:
- **Frontend**: HTML/CSS/JavaScript served by Google Apps Script's HTML Service
- **AI**: Grok API (x.ai) for conversation and content generation
- **Storage**: GitHub repository for drafts and published posts
- **Deployment**: GitHub Pages for the blog itself

**Key Features**

**Voice Input**: The Web Speech API transcribes my spoken words directly into the chat. No typing needed when I'm on the move.

**Image Upload**: I can attach images during the conversation. They upload to GitHub in a temporary `images/uploads/` folder, then automatically move to the final location when I publish the post. Images persist in drafts, so I can see them when I reload later.

**Draft Management**: Everything saves as markdown files in a `drafts/` folder. Frontmatter stores title, date, and categories. When I'm ready to publish, the system converts markdown to HTML, pulls a template from an existing post, and generates the final blog post.

**Category System**: Each category gets its own listing page. When I tag a post with categories, they link to those pages automatically. The system generates category pages dynamically, grouping posts by year.

**Mobile-First Design**: The interface works on mobile. Font sizes are tuned to prevent iOS auto-zoom, buttons are touch-friendly, and the layout adapts to small screens.

**The Workflow**

1. Open `garyteh.com/admin` on my phone or laptop
2. Start a conversation with Grok about what I want to write
3. Attach images if needed—they appear inline in the chat
4. Refine the content through back-and-forth with Grok
5. Save as draft (markdown file in `drafts/` folder)
6. Later, convert draft to published HTML post
7. Images automatically move from `uploads/` to final location
8. Post appears on the blog

**What Makes It Different**

Most blog editors feel like word processors. This feels like talking to an editor who gets your voice. Grok is trained on my writing style—conversational, reflective, sometimes philosophical. It suggests categories, helps structure thoughts, and knows when to ask questions versus when to say "Looks done—want to publish'"

The draft system means I can start posts, save them, and come back later. Images persist. The conversation history is stored client-side, so I can edit my inputs and reshape the conversation.

**The Code**

The main components are:
- `google-apps-script/Code.gs` - Server-side logic (Grok API, GitHub integration, HTML generation)
- `google-apps-script/Index.html` - Client-side UI (chat interface, voice input, image upload)
- Draft files in `drafts/` folder (markdown with frontmatter)
- Published posts as HTML files in the root

Everything is version-controlled on GitHub, so I can see the history of changes, and GitHub Pages automatically rebuilds when I push updates.

**Reflections**

This isn't just about making writing easier—it's about making it more natural. Voice input means I can capture thoughts while walking. Image upload means I can include visuals without switching tools. The draft system means I can start posts and finish them later without losing context.

The category system emerged organically. As I built it, I realized how useful it would be to browse posts by topic. Now every category has its own page, and posts link to them automatically.

**What's Next**

The system is working, but there's always room to improve. I'm thinking about:
- Better image optimization before upload
- Automatic image alt-text generation
- Draft preview before publishing
- Batch operations for managing multiple drafts

But for now, it works. I can draft posts from my phone, include images, and publish when ready. The friction is gone.

**Try It Yourself**

The code is open source: [https://github.com/garyjob/blog/](https://github.com/garyjob/blog/)

The `google-apps-script/` folder contains everything you need. Set up your Grok API key, GitHub token, and deploy. The system will handle the rest.

What about you—how do you handle the friction between having an idea and getting it published' What tools make writing feel natural for you'


