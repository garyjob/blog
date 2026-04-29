#!/usr/bin/env python3
"""
Convert markdown draft files to HTML blog posts.

Default behavior is incremental: drafts whose target HTML already exists
are skipped, so re-running the script does not regenerate (and silently
mutate) already-published posts. Use --force to re-convert everything.

Frontmatter is optional. When absent, the title is taken from the first
`# ` heading (or the filename), the date is parsed from the
`YYYY-MM-DD-...` filename prefix, and the category defaults to
"Technology".
"""

import argparse
import os
import re
import html
from pathlib import Path
from datetime import datetime

def slugify_category(category):
    """Convert category name to URL-friendly slug."""
    # Remove markdown formatting
    category = re.sub(r'\*\*', '', category)
    category = category.strip()
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug

def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown content."""
    if not content.startswith('---'):
        return None, content
    
    # Find the second ---
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, content
    
    frontmatter_text = parts[1].strip()
    markdown_content = parts[2].strip()
    
    # Parse frontmatter (simple YAML-like parsing)
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            # Remove quotes
            if value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            elif value.startswith("'") and value.endswith("'"):
                value = value[1:-1]
            
            # Handle arrays
            if value.startswith('[') and value.endswith(']'):
                # Parse array
                array_content = value[1:-1]
                items = [item.strip().strip('"').strip("'") for item in array_content.split(',')]
                frontmatter[key] = items
            else:
                frontmatter[key] = value
    
    return frontmatter, markdown_content


def derive_frontmatter(markdown_content, filename_stem):
    """Derive frontmatter defaults when the markdown has none.

    - title: first `# ` heading, else filename slug humanized.
    - date: YYYY-MM-DD prefix from the filename.
    - formattedDate: derived from date.
    - categories: ["Technology"] (matches every recent draft's default).
    """
    derived = {}

    title_match = re.search(r'^#\s+(.+?)\s*$', markdown_content, re.MULTILINE)
    if title_match:
        derived['title'] = title_match.group(1).strip()
    else:
        derived['title'] = filename_stem.replace('-', ' ').strip().title()

    date_match = re.match(r'^(\d{4}-\d{2}-\d{2})', filename_stem)
    if date_match:
        derived['date'] = date_match.group(1)
        try:
            d = datetime.strptime(derived['date'], '%Y-%m-%d')
            derived['formattedDate'] = d.strftime('%B %d, %Y')
        except ValueError:
            pass

    derived['categories'] = ['Technology']
    return derived


def strip_leading_title(markdown_content, title):
    """Drop a leading `# title` line so it's not duplicated in body."""
    lines = markdown_content.split('\n')
    out = []
    title_consumed = False
    for line in lines:
        if not title_consumed and line.strip() == f'# {title}':
            title_consumed = True
            continue
        out.append(line)
    return '\n'.join(out).lstrip('\n')


def markdown_to_html(markdown_text):
    """Convert markdown to HTML, extracting only the final version."""
    lines = markdown_text.split('\n')
    
    # Find the last occurrence of "**Title:" which indicates the final version
    last_title_idx = -1
    for i in range(len(lines) - 1, -1, -1):
        if '**Title:' in lines[i] or lines[i].strip().startswith('**Title:'):
            last_title_idx = i
            break
    
    if last_title_idx == -1:
        # No title found, try to find the start of actual content
        for i, line in enumerate(lines):
            if line.strip() and not line.strip().startswith('---') and not line.strip().startswith('Hey there'):
                last_title_idx = i
                break
    
    if last_title_idx == -1:
        # Fallback: use everything after frontmatter
        last_title_idx = 0
    
    # Extract content starting from the last title
    content_lines = lines[last_title_idx:]
    
    # Find where the actual content ends (before conversation markers)
    end_idx = len(content_lines)
    conversation_markers = [
        'So, what do you think',
        'How\'s this feeling',
        'How\'s this looking',
        'Got it, thanks',
        'Alright, thanks',
        'Alright, let\'s',
        'I\'ve tried to capture',
        'My Thoughts',
        'Suggested Categories for',
        'Does this capture',
        'If there\'s more to add',
        'We can keep',
        'let me know'
    ]
    
    for i, line in enumerate(content_lines):
        line_lower = line.lower()
        for marker in conversation_markers:
            if marker.lower() in line_lower:
                end_idx = i
                break
        if end_idx < len(content_lines):
            break
    
    # Extract the final content
    final_content_lines = content_lines[:end_idx]
    
    # Remove the "**Title:" line if present (we'll use the title from frontmatter)
    cleaned_lines = []
    skip_next_empty = False
    for line in final_content_lines:
        if '**Title:' in line:
            skip_next_empty = True
            continue
        if skip_next_empty and not line.strip():
            skip_next_empty = False
            continue
        skip_next_empty = False
        cleaned_lines.append(line)
    
    actual_content = '\n'.join(cleaned_lines).strip()
    
    # Remove any remaining conversation markers and meta-commentary
    actual_content = re.sub(r'^---\s*$', '', actual_content, flags=re.MULTILINE)
    actual_content = re.sub(r'^\*\*Suggested Categories:\*\*.*?$', '', actual_content, flags=re.MULTILINE | re.DOTALL)
    actual_content = re.sub(r'^- .*?$', '', actual_content, flags=re.MULTILINE)  # Remove category list items
    
    html_text = actual_content.strip()
    
    # Convert markdown to HTML
    # Headers
    html_text = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html_text, flags=re.MULTILINE)
    html_text = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html_text, flags=re.MULTILINE)
    html_text = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html_text, flags=re.MULTILINE)
    
    # Bold
    html_text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_text)
    
    # Italic
    html_text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_text)
    
    # Links [text](url)
    html_text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html_text)
    
    # Images ![alt](url)
    html_text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1">', html_text)
    
    # Code blocks (simple)
    html_text = re.sub(r'```(\w+)?\n(.*?)```', r'<pre><code>\2</code></pre>', html_text, flags=re.DOTALL)
    
    # Inline code
    html_text = re.sub(r'`([^`]+)`', r'<code>\1</code>', html_text)
    
    # Lists (unordered)
    html_text = re.sub(r'^- (.*?)$', r'<li>\1</li>', html_text, flags=re.MULTILINE)
    # Wrap consecutive <li> in <ul>
    html_text = re.sub(r'(<li>.*?</li>\n?)+', lambda m: '<ul>' + m.group(0) + '</ul>', html_text, flags=re.DOTALL)
    
    # Lists (ordered)
    html_text = re.sub(r'^\d+\. (.*?)$', r'<li>\1</li>', html_text, flags=re.MULTILINE)
    # Wrap consecutive numbered <li> in <ol> (simplified)
    
    # Paragraphs (wrap consecutive non-empty lines)
    paragraphs = []
    current_para = []
    
    for line in html_text.split('\n'):
        line = line.strip()
        if not line:
            if current_para:
                para_text = ' '.join(current_para)
                # Don't wrap if it's already a block element
                if not para_text.startswith('<') or para_text.startswith('<p'):
                    if not para_text.startswith('<h') and not para_text.startswith('<ul') and not para_text.startswith('<ol') and not para_text.startswith('<pre') and not para_text.startswith('<img'):
                        paragraphs.append('<p>' + para_text + '</p>')
                    else:
                        paragraphs.append(para_text)
                else:
                    paragraphs.append(para_text)
                current_para = []
        else:
            # Don't add block elements to paragraphs
            if line.startswith('<h') or line.startswith('<ul') or line.startswith('<ol') or line.startswith('<pre') or line.startswith('<img'):
                if current_para:
                    para_text = ' '.join(current_para)
                    if not para_text.startswith('<'):
                        paragraphs.append('<p>' + para_text + '</p>')
                    else:
                        paragraphs.append(para_text)
                    current_para = []
                paragraphs.append(line)
            else:
                current_para.append(line)
    
    if current_para:
        para_text = ' '.join(current_para)
        if not para_text.startswith('<'):
            paragraphs.append('<p>' + para_text + '</p>')
        else:
            paragraphs.append(para_text)
    
    html_text = '\n'.join(paragraphs)
    
    # Clean up empty paragraphs
    html_text = re.sub(r'<p>\s*</p>', '', html_text)
    
    return html_text

def generate_html_post(frontmatter, content_html, filename_base):
    """Generate HTML blog post from frontmatter and content."""
    
    title = frontmatter.get('title', 'Untitled')
    # Clean up title (remove markdown formatting)
    title = re.sub(r'\*\*', '', title).strip()
    
    date_str = frontmatter.get('date', '')
    formatted_date = frontmatter.get('formattedDate', '')
    
    # Parse date for ISO format
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        iso_date = date_obj.strftime('%Y-%m-%dT00:00:00+00:00')
        # Format date nicely if not provided
        if not formatted_date:
            formatted_date = date_obj.strftime('%B %d, %Y')
    except:
        iso_date = date_str + 'T00:00:00+00:00'
        formatted_date = formatted_date or date_str
    
    categories = frontmatter.get('categories', [])
    if isinstance(categories, str):
        categories = [c.strip() for c in categories.split(',')]
    
    # Generate description (first 150 chars of content)
    description_text = re.sub(r'<[^>]+>', '', content_html)
    description = description_text[:150].strip() + '...' if len(description_text) > 150 else description_text
    
    # Generate category tags HTML
    category_tags = []
    for cat in categories:
        cat_clean = re.sub(r'\*\*', '', cat).strip()
        if cat_clean:
            slug = slugify_category(cat_clean)
            category_tags.append(f'<a href="categories/{slug}.html" class="category-tag">{html.escape(cat_clean)}</a>')
    
    category_tags_html = '\n                '.join(category_tags)
    
    # Generate article tags for meta
    article_tags_list = []
    for cat in categories:
        if cat.strip():
            cat_clean = re.sub(r'\*\*', '', cat).strip()
            article_tags_list.append(f'<meta property="article:tag" content="{html.escape(cat_clean)}">')
    article_tags = '\n    '.join(article_tags_list)
    
    html_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{html.escape(title)} - {html.escape(description)}">
    <title>{html.escape(title)} - Gary Teh's Blog</title>
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://garyteh.com/{filename_base}.html">
    <meta property="og:title" content="{html.escape(title)}">
    <meta property="og:description" content="{html.escape(description)}">
    <meta property="og:site_name" content="Gary Teh's Blog">
    <meta property="article:published_time" content="{iso_date}">
    <meta property="article:author" content="Gary Teh">
    {article_tags}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:url" content="https://garyteh.com/{filename_base}.html">
    <meta name="twitter:title" content="{html.escape(title)}">
    <meta name="twitter:description" content="{html.escape(description)}">
    
    <!-- Additional meta for better sharing -->
    <meta name="author" content="Gary Teh">
    <link rel="canonical" href="https://garyteh.com/{filename_base}.html">
    
    <!-- Favicons -->
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }}
        .back-link {{
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }}
        .back-link:hover {{
            color: #2980b9;
        }}
        .header {{
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        h1 {{
            color: #2c3e50;
            font-size: 2.2em;
            margin-bottom: 15px;
            line-height: 1.3;
        }}
        .post-meta {{
            color: #7f8c8d;
            font-size: 0.95em;
            margin-bottom: 10px;
        }}
        .post-date {{
            font-weight: 600;
        }}
        .category-tag, .tag, a.category-tag {{
            background: #ecf0f1;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.9em;
            display: inline-block;
            margin-top: 5px;
            color: #2c3e50;
            text-decoration: none;
        }}
        a.category-tag:hover {{
            background: #3498db;
            color: white;
        }}
        .content {{
            font-size: 1.1em;
            line-height: 1.8;
        }}
        .content h1, .content h2 {{
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .content h3 {{
            color: #34495e;
            margin-top: 25px;
            margin-bottom: 12px;
        }}
        .content p {{
            margin-bottom: 15px;
        }}
        .content ul, .content ol {{
            margin-left: 30px;
            margin-bottom: 15px;
        }}
        .content li {{
            margin-bottom: 8px;
        }}
        .content code {{
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }}
        .content pre {{
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 15px;
        }}
        .content pre code {{
            background: none;
            padding: 0;
        }}
        .content blockquote {{
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #555;
            font-style: italic;
        }}
        .content a {{
            color: #3498db;
            text-decoration: none;
        }}
        .content a:hover {{
            text-decoration: underline;
        }}
        .content img {{
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
        }}
        @media (max-width: 600px) {{
            .container {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to all posts</a>
        
        <div class="header">
            <h1>{html.escape(title)}</h1>
            <div class="post-meta">
                <span class="post-date">{html.escape(formatted_date)}</span>
                {category_tags_html}
            </div>
        </div>

        <div class="content">
{content_html}
        </div>

        <footer>
            <p><a href="index.html">← Back to all posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
    <script id="mcjs">!function(c,h,i,m,p){{m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/f4002ef7c62ee64494321ba14/9c56fa20706b0138cf6fea672.js");</script>
</body>
</html>'''
    
    return html_template

def main():
    """Main conversion function."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        '--force', action='store_true',
        help='Re-convert drafts even when target HTML already exists.',
    )
    parser.add_argument(
        '--only', metavar='STEM',
        help='Convert only the draft with this filename stem (e.g. '
             '2026-04-28-circles-cacao-and-stumbling-distance).',
    )
    args = parser.parse_args()

    drafts_dir = Path(__file__).parent / 'drafts'
    output_dir = Path(__file__).parent

    if not drafts_dir.exists():
        print(f"Drafts directory not found: {drafts_dir}")
        return

    md_files = sorted(drafts_dir.glob('*.md'))
    if args.only:
        md_files = [f for f in md_files if f.stem == args.only]
        if not md_files:
            print(f"No draft matching --only {args.only}")
            return

    if not md_files:
        print("No markdown files found in drafts folder")
        return

    print(f"Found {len(md_files)} markdown files to consider\n")

    converted = 0
    skipped_existing = 0
    errors = 0

    for md_file in md_files:
        filename_base = md_file.stem
        output_file = output_dir / f"{filename_base}.html"

        if output_file.exists() and not args.force:
            skipped_existing += 1
            continue

        print(f"Processing: {md_file.name}")

        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            frontmatter, markdown_content = parse_frontmatter(content)

            if not frontmatter:
                frontmatter = derive_frontmatter(markdown_content, filename_base)
                markdown_content = strip_leading_title(
                    markdown_content, frontmatter['title']
                )
                print(
                    f"  ℹ️  No frontmatter — derived title='{frontmatter['title']}', "
                    f"date={frontmatter.get('date', 'unknown')}, "
                    f"categories={frontmatter['categories']}"
                )

            content_html = markdown_to_html(markdown_content)
            html_content = generate_html_post(frontmatter, content_html, filename_base)

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)

            converted += 1
            print(f"  ✅ Created: {output_file.name}")

        except Exception as e:
            errors += 1
            print(f"  ❌ Error processing {md_file.name}: {e}")
            import traceback
            traceback.print_exc()

    print(
        f"\n✅ Done. Converted: {converted}, "
        f"skipped (HTML already exists): {skipped_existing}, errors: {errors}."
    )
    if skipped_existing and not args.force:
        print("   Use --force to re-convert existing posts.")


if __name__ == '__main__':
    main()

