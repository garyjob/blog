#!/usr/bin/env python3
"""
Regenerate index.html from all published blog posts.
This script reads all HTML files matching the pattern YYYY-MM-DD-*.html
and regenerates the index.html with all posts.
"""

import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

def extract_post_metadata(html_file):
    """Extract metadata from a blog post HTML file."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title from <h1> or <title>
        title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content, re.IGNORECASE)
        if not title_match:
            title_match = re.search(r'<title[^>]*>([^<]+)</title>', content, re.IGNORECASE)
            if title_match:
                title = title_match.group(1).replace(" - Gary Teh's Blog", "").strip()
            else:
                return None
        else:
            title = title_match.group(1).strip()
        
        # Extract date from filename
        filename = html_file.name
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
        if not date_match:
            return None
        
        date_str = date_match.group(1)
        
        # Extract categories
        categories = []
        category_matches = re.findall(r'<span class="category-tag">([^<]+)</span>', content, re.IGNORECASE)
        if category_matches:
            categories = [cat.strip() for cat in category_matches]
        
        # Parse date for sorting
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return None
        
        return {
            'title': title,
            'date': date_str,
            'date_obj': date_obj,
            'categories': categories,
            'filename': filename,
            'year': date_obj.year
        }
    except Exception as e:
        print(f"Error processing {html_file}: {e}")
        return None

def generate_post_html(post):
    """Generate HTML for a single post entry."""
    is_first = False  # We'll set this when generating year sections
    featured_badge = '<span class="featured-badge">NEW</span>' if is_first else ''
    
    categories_html = ''
    if post['categories']:
        categories_display = ', '.join(post['categories'])
        categories_html = f'<span class="categories">• {categories_display}</span>'
    
    return f'''            <div class="post" data-title="{post['title'].lower()}" data-categories="{', '.join([c.lower() for c in post['categories']])}">
                <div class="post-title"><a href="{post['filename']}">{post['title']}</a>{featured_badge}</div>
                <div class="post-meta">
                    <span class="post-date">{post['date']}</span>
                    {categories_html}
                </div>
            </div>'''

def main():
    """Main function to regenerate index.html."""
    blog_dir = Path(__file__).parent
    
    # Collect all posts
    all_posts = []
    posts_by_year = defaultdict(list)
    
    # Find all HTML files matching the pattern YYYY-MM-DD-*.html
    for html_file in sorted(blog_dir.glob('????-??-??-*.html')):
        # Skip archive files
        if html_file.name.startswith('archive-'):
            continue
        
        metadata = extract_post_metadata(html_file)
        if metadata:
            all_posts.append(metadata)
            posts_by_year[metadata['year']].append(metadata)
    
    # Sort all posts by date (newest first)
    all_posts.sort(key=lambda x: x['date_obj'], reverse=True)
    
    # Sort posts within each year (newest first)
    for year in posts_by_year:
        posts_by_year[year].sort(key=lambda x: x['date_obj'], reverse=True)
    
    print(f"Found {len(all_posts)} total posts across {len(posts_by_year)} years")
    
    # Read current index.html to get header and footer
    index_file = blog_dir / 'index.html'
    if not index_file.exists():
        print("Error: index.html not found!")
        return
    
    with open(index_file, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Extract header (everything before first year-section)
    header_match = re.search(r'(.*?)(<div class="year-section)', index_content, re.DOTALL)
    if header_match:
        header = header_match.group(1)
    else:
        print("Warning: Could not find header section")
        return
    
    # Extract footer (everything after last year-section closing div)
    # Find the closing </div> tags and footer
    footer_match = re.search(r'(    </div>\s*</div>\s*<footer>.*?</footer>.*?</body>.*?</html>)', index_content, re.DOTALL)
    if footer_match:
        footer = footer_match.group(1)
    else:
        # Fallback: look for footer tag
        footer_match2 = re.search(r'(<footer>.*?</footer>)', index_content, re.DOTALL)
        if footer_match2:
            # Get everything from footer to end
            footer_start = index_content.find('<footer>')
            footer = index_content[footer_start:]
        else:
            print("Warning: Could not find footer section")
            return
    
    # Update stats in header
    oldest_year = min(posts_by_year.keys()) if posts_by_year else datetime.now().year
    newest_year = max(posts_by_year.keys()) if posts_by_year else datetime.now().year
    header = re.sub(r'<strong>(\d+) posts</strong>', f'<strong>{len(all_posts)} posts</strong>', header)
    header = re.sub(r'spanning from \d{4} to \d{4}', f'spanning from {oldest_year} to {newest_year}', header)
    
    # Generate year sections
    years = sorted(posts_by_year.keys(), reverse=True)
    year_sections = []
    
    for year in years:
        year_posts = posts_by_year[year]
        post_count = len(year_posts)
        
        posts_html = []
        for i, post in enumerate(year_posts):
            is_first = (year == years[0] and i == 0)
            featured_badge = '<span class="featured-badge">NEW</span>' if is_first else ''
            
            categories_html = ''
            if post['categories']:
                categories_display = ', '.join(post['categories'])
                categories_html = f'<span class="categories">• {categories_display}</span>'
            
            post_html = f'''            <div class="post{" featured-post" if is_first else ""}" data-title="{post['title'].lower()}" data-categories="{', '.join([c.lower() for c in post['categories']])}">
                <div class="post-title"><a href="{post['filename']}">{post['title']}</a>{featured_badge}</div>
                <div class="post-meta">
                    <span class="post-date">{post['date']}</span>
                    {categories_html}
                </div>
            </div>'''
            posts_html.append(post_html)
        
        year_section = f'''        <div class="year-section" data-year="{year}">
            <h2 class="year-header">{year} <span style="font-size: 0.6em; color: #95a5a6;">({post_count} posts)</span></h2>
{chr(10).join(posts_html)}
        </div>'''
        year_sections.append(year_section)
    
    # Combine everything
    new_index_content = header + '\n'.join(year_sections) + '\n' + footer
    
    # Write updated index.html
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_index_content)
    
    print(f"✅ Regenerated index.html with {len(all_posts)} posts")
    print(f"   Years: {', '.join(map(str, years))}")
    for year in years:
        print(f"   {year}: {len(posts_by_year[year])} posts")

if __name__ == '__main__':
    main()

