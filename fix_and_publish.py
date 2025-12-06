#!/usr/bin/env python3
"""
Script to fix character encoding issues in drafts and publish them as blog posts.
This script fixes corrupted apostrophes (?) and publishes drafts without using Code.gs
"""

import os
import re
import json
import base64
from pathlib import Path
from datetime import datetime
import html

# Configuration
DRAFTS_DIR = Path("drafts")
POSTS_DIR = Path(".")
TEMPLATE_FILE = None  # Will use a simple template

# Common character corruption mappings
CHAR_FIXES = {
    "?": "'",  # Most common: apostrophe corruption
    "\u2019": "'",  # Right single quote (Unicode)
    "\u2018": "'",  # Left single quote (Unicode)
    "\u201C": '"',  # Left double quote (Unicode)
    "\u201D": '"',  # Right double quote (Unicode)
    "\u2014": "—",  # Em dash (Unicode)
    "\u2013": "–",  # En dash (Unicode)
}

def fix_encoding_issues(text):
    """Fix common character encoding issues"""
    for corrupted, correct in CHAR_FIXES.items():
        text = text.replace(corrupted, correct)
    
    # Fix standalone ? that should be apostrophes (context-dependent)
    # Pattern: word?word or word?s or word?t or word?m or word?re or word?ve or word?ll or word?d
    text = re.sub(r"(\w)\?([stm]|re|ve|ll|d)\b", r"\1'\2", text)
    # Fix ? between words (likely apostrophes)
    text = re.sub(r"(\w)\?(\w)", r"\1'\2", text)
    # Fix ? at end of words (possessives)
    text = re.sub(r"(\w)\?(s|t|m|re|ve|ll|d)\b", r"\1'\2", text)
    # Fix ? in contractions like don?t, can?t, won?t
    text = re.sub(r"(\w+)\?t\b", r"\1't", text)
    
    return text

def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown file"""
    if not content.startswith("---"):
        return None, content
    
    parts = content.split("---", 2)
    if len(parts) < 3:
        return None, content
    
    frontmatter_text = parts[1].strip()
    body = parts[2].strip()
    
    # Simple YAML parsing
    frontmatter = {}
    for line in frontmatter_text.split("\n"):
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            frontmatter[key] = value
    
    return frontmatter, body

def markdown_to_html(markdown_text):
    """Convert markdown to HTML (simple implementation)"""
    html_text = markdown_text
    
    # Headers
    html_text = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html_text, flags=re.MULTILINE)
    html_text = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html_text, flags=re.MULTILINE)
    html_text = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html_text, flags=re.MULTILINE)
    
    # Bold
    html_text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_text)
    
    # Italic
    html_text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_text)
    
    # Links
    html_text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', html_text)
    
    # Images
    html_text = re.sub(r'!\[([^\]]*)\]\(([^\)]+)\)', r'<img src="\2" alt="\1" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 5px;">', html_text)
    
    # Code blocks
    html_text = re.sub(r'```([\s\S]*?)```', r'<pre><code>\1</code></pre>', html_text)
    html_text = re.sub(r'`([^`]+)`', r'<code>\1</code>', html_text)
    
    # Lists
    lines = html_text.split('\n')
    in_list = False
    result = []
    for line in lines:
        if re.match(r'^[-*]\s+', line):
            if not in_list:
                result.append('<ul>')
                in_list = True
            content = re.sub(r'^[-*]\s+', '', line)
            result.append(f'<li>{content}</li>')
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            if line.strip():
                result.append(f'<p>{line}</p>')
            else:
                result.append('')
    
    if in_list:
        result.append('</ul>')
    
    html_text = '\n'.join(result)
    
    # Paragraphs (simple)
    html_text = re.sub(r'\n\n+', '</p><p>', html_text)
    html_text = f'<p>{html_text}</p>'
    
    return html_text

def get_post_template():
    """Get the HTML template for blog posts"""
    # Use the fallback template to avoid picking up wrong content from existing posts
    return """<!DOCTYPE html>
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
        .back-link:hover { color: #2980b9; }
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
        .category-tag {
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
        .content h1, .content h2 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; }
        .content h3 { color: #34495e; margin-top: 25px; margin-bottom: 12px; }
        .content p { margin-bottom: 15px; }
        .content ul, .content ol { margin-left: 30px; margin-bottom: 15px; }
        .content li { margin-bottom: 8px; }
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
        .content pre code { background: none; padding: 0; }
        .content blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }
        .content a { color: #3498db; text-decoration: none; }
        .content a:hover { text-decoration: underline; }
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
</html>"""

def format_date(date_str):
    """Format date from YYYY-MM-DD to readable format"""
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return date_obj.strftime("%B %d, %Y")
    except:
        return date_str

def fix_draft_file(draft_path):
    """Fix encoding issues in a draft file"""
    print(f"Fixing encoding in: {draft_path}")
    with open(draft_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content = fix_encoding_issues(content)
    
    if fixed_content != content:
        with open(draft_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"  ✓ Fixed encoding issues")
        return True
    else:
        print(f"  - No issues found")
        return False

def publish_draft(draft_path):
    """Publish a draft as a blog post"""
    print(f"\nPublishing: {draft_path}")
    
    # Read and fix the draft
    with open(draft_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix encoding
    content = fix_encoding_issues(content)
    
    # Parse frontmatter
    frontmatter, body = parse_frontmatter(content)
    
    if not frontmatter:
        print(f"  ✗ Error: Could not parse frontmatter")
        return False
    
    title = frontmatter.get('title', 'Untitled')
    date_str = frontmatter.get('date', datetime.now().strftime("%Y-%m-%d"))
    categories = frontmatter.get('categories', '[]')
    
    # Parse categories
    if isinstance(categories, str):
        try:
            categories = json.loads(categories)
        except:
            categories = [c.strip().strip('"').strip("'") for c in categories.strip('[]').split(',')]
    
    if not isinstance(categories, list):
        categories = [categories] if categories else []
    
    # Clean up title (remove markdown formatting)
    title = re.sub(r'\*\*', '', title)
    title = title.strip()
    
    # Convert markdown to HTML
    html_content = markdown_to_html(body)
    
    # Get template
    template = get_post_template()
    
    # Format date
    formatted_date = format_date(date_str)
    
    # Generate category tags
    category_tags = ''.join([f'<span class="category-tag">{html.escape(cat)}</span>' for cat in categories])
    
    # Replace template placeholders
    html_output = template.replace('{{TITLE}}', html.escape(title))
    html_output = html_output.replace('{{DESCRIPTION}}', html.escape(title))
    html_output = html_output.replace('{{DATE}}', formatted_date)
    html_output = html_output.replace('{{DATE_ISO}}', date_str)
    html_output = html_output.replace('{{CATEGORIES}}', category_tags)
    html_output = html_output.replace('{{CONTENT}}', html_content)
    
    # Generate filename
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    filename = f"{date_str}-{slug}.html"
    output_path = POSTS_DIR / filename
    
    # Write the post
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_output)
    
    print(f"  ✓ Published as: {filename}")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Fix Encoding Issues and Publish Drafts")
    print("=" * 60)
    
    # Fix all drafts
    print("\n1. Fixing encoding issues in all drafts...")
    draft_files = list(DRAFTS_DIR.glob("*.md"))
    fixed_count = 0
    for draft_file in draft_files:
        if fix_draft_file(draft_file):
            fixed_count += 1
    
    print(f"\n✓ Fixed {fixed_count} draft(s)")
    
    # Publish the two most recent drafts
    print("\n2. Publishing two most recent drafts...")
    draft_files = sorted(DRAFTS_DIR.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)
    
    drafts_to_publish = [
        "2025-12-05-oracle-whispers-and-collective-strength-decoding-truesight-dao-s-path.md",
        "2025-12-04-this-was-the-section-of-the-conversation-i-shared-before-the.md"
    ]
    
    published_count = 0
    for draft_name in drafts_to_publish:
        draft_path = DRAFTS_DIR / draft_name
        if draft_path.exists():
            if publish_draft(draft_path):
                published_count += 1
        else:
            print(f"  ✗ Draft not found: {draft_name}")
    
    print(f"\n✓ Published {published_count} post(s)")
    print("\nDone!")

if __name__ == "__main__":
    main()

