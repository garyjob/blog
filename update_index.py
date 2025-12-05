#!/usr/bin/env python3
"""
Update index.html with new blog posts.
"""

import re
from pathlib import Path
from html import escape

def slugify_category(category):
    """Convert category name to URL-friendly slug."""
    category = re.sub(r'\*\*', '', category).strip()
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug

def extract_post_metadata(html_file):
    """Extract metadata from an HTML blog post."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'<h1>(.*?)</h1>', content)
    if not title_match:
        return None
    title = title_match.group(1)
    # Decode HTML entities
    title = title.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'")
    
    # Extract date from filename
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', html_file.name)
    date = date_match.group(1) if date_match else ''
    
    # Extract formatted date
    formatted_date_match = re.search(r'<span class="post-date">(.*?)</span>', content)
    formatted_date = formatted_date_match.group(1) if formatted_date_match else date
    
    # Extract categories
    categories = []
    cat_matches = re.findall(r'<a href="categories/([^"]+)\.html" class="category-tag">([^<]+)</a>', content)
    for slug, name in cat_matches:
        categories.append({'slug': slug, 'name': name})
    
    return {
        'filename': html_file.name,
        'title': title,
        'date': date,
        'formatted_date': formatted_date,
        'categories': categories
    }

def generate_post_html(post):
    """Generate HTML for a post entry."""
    category_links = []
    for cat in post['categories']:
        category_links.append(f'<a href="categories/{cat["slug"]}.html">{escape(cat["name"])}</a>')
    
    categories_html = ', '.join(category_links) if category_links else ''
    
    # Generate data attributes for search
    data_title = post['title'].lower()
    data_categories = ', '.join([cat['name'].lower() for cat in post['categories']])
    
    return f'''            <div class="post" data-title="{escape(data_title)}" data-categories="{escape(data_categories)}">
                <div class="post-title"><a href="{post['filename']}">{escape(post['title'])}</a></div>
                <div class="post-meta">
                    <span class="post-date">{post['date']}</span>
                    <span class="categories">• {categories_html}</span>
                </div>
            </div>'''

def main():
    """Main function to update index.html."""
    blog_dir = Path(__file__).parent
    
    # Find all 2025 posts
    posts_2025 = []
    for html_file in sorted(blog_dir.glob('2025-*.html')):
        metadata = extract_post_metadata(html_file)
        if metadata:
            posts_2025.append(metadata)
    
    # Sort by date (newest first)
    posts_2025.sort(key=lambda x: x['date'], reverse=True)
    
    print(f"Found {len(posts_2025)} posts for 2025")
    
    # Read current index.html
    index_file = blog_dir / 'index.html'
    with open(index_file, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Find the 2025 section
    year_section_pattern = r'(<div class="year-section" data-year="2025">.*?</div>\s*</div>)'
    match = re.search(year_section_pattern, index_content, re.DOTALL)
    
    if not match:
        print("Could not find 2025 section in index.html")
        return
    
    # Generate new 2025 section
    posts_html = []
    for post in posts_2025:
        posts_html.append(generate_post_html(post))
    
    new_section = f'''        <div class="year-section" data-year="2025">
            <h2 class="year-header">2025 <span style="font-size: 0.6em; color: #95a5a6;">({len(posts_2025)} posts)</span></h2>
{chr(10).join(posts_html)}
        </div>'''
    
    # Replace the section
    new_index_content = index_content[:match.start()] + new_section + index_content[match.end():]
    
    # Write updated index.html
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_index_content)
    
    print(f"✅ Updated index.html with {len(posts_2025)} posts for 2025")

if __name__ == '__main__':
    main()

