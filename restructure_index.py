#!/usr/bin/env python3
"""
Restructure blog: Show recent posts on index.html, create year-based archive pages.
"""

import re
from pathlib import Path
from html import escape
from collections import defaultdict

def extract_post_metadata(html_file):
    """Extract metadata from an HTML blog post."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<h1>(.*?)</h1>', content)
        if not title_match:
            return None
        title = title_match.group(1)
        title = title.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'")
        
        # Extract date from filename
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', html_file.name)
        if not date_match:
            return None
        date = date_match.group(1)
        year = date[:4]
        
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
            'year': year,
            'formatted_date': formatted_date,
            'categories': categories
        }
    except Exception as e:
        print(f"Error processing {html_file.name}: {e}")
        return None

def generate_post_html(post):
    """Generate HTML for a post entry."""
    category_links = []
    for cat in post['categories']:
        category_links.append(f'<a href="categories/{cat["slug"]}.html">{escape(cat["name"])}</a>')
    
    categories_html = ', '.join(category_links) if category_links else ''
    
    data_title = post['title'].lower()
    data_categories = ', '.join([cat['name'].lower() for cat in post['categories']])
    
    return f'''            <div class="post" data-title="{escape(data_title)}" data-categories="{escape(data_categories)}">
                <div class="post-title"><a href="{post['filename']}">{escape(post['title'])}</a></div>
                <div class="post-meta">
                    <span class="post-date">{post['date']}</span>
                    <span class="categories">• {categories_html}</span>
                </div>
            </div>'''

def generate_archive_page(year, posts, all_years):
    """Generate an archive page for a specific year."""
    posts_html = []
    for post in sorted(posts, key=lambda x: x['date'], reverse=True):
        posts_html.append(generate_post_html(post))
    
    # Generate year navigation
    year_nav = []
    for y in sorted(all_years, reverse=True):
        if y == year:
            year_nav.append(f'<strong>{y}</strong>')
        else:
            year_nav.append(f'<a href="archive-{y}.html">{y}</a>')
    
    year_nav_html = ' | '.join(year_nav)
    
    archive_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive {year} - Gary Teh's Blog</title>
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
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }}
        header {{
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }}
        h1 {{
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .archive-nav {{
            margin-bottom: 30px;
            padding: 15px;
            background: #ecf0f1;
            border-radius: 5px;
            text-align: center;
        }}
        .archive-nav a {{
            color: #3498db;
            text-decoration: none;
            margin: 0 5px;
        }}
        .archive-nav a:hover {{
            text-decoration: underline;
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
        .year-header {{
            color: #3498db;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }}
        .post {{
            margin-bottom: 15px;
            padding: 15px;
            background: #fafafa;
            border-left: 4px solid #3498db;
            transition: all 0.3s ease;
        }}
        .post:hover {{
            background: #f0f8ff;
            border-left-color: #2980b9;
            transform: translateX(5px);
        }}
        .post-title {{
            font-size: 1.2em;
            margin-bottom: 5px;
        }}
        .post-title a {{
            color: #2c3e50;
            text-decoration: none;
            font-weight: 500;
        }}
        .post-title a:hover {{
            color: #3498db;
        }}
        .post-meta {{
            color: #7f8c8d;
            font-size: 0.9em;
        }}
        .post-date {{
            font-weight: 600;
        }}
        .categories {{
            display: inline-block;
            margin-left: 10px;
            color: #95a5a6;
        }}
        .categories a {{
            color: #3498db;
            text-decoration: none;
        }}
        .categories a:hover {{
            text-decoration: underline;
        }}
        footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Archive: {year}</h1>
            <p class="subtitle">{len(posts)} posts</p>
        </header>
        
        <div class="archive-nav">
            <a href="index.html">← Back to Recent Posts</a> | {year_nav_html}
        </div>
        
        <div class="year-section">
            <h2 class="year-header">{year} <span style="font-size: 0.6em; color: #95a5a6;">({len(posts)} posts)</span></h2>
{chr(10).join(posts_html)}
        </div>
        
        <footer>
            <p><a href="index.html">← Back to Recent Posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
</body>
</html>'''
    
    return archive_html

def main():
    """Main function to restructure the blog."""
    blog_dir = Path(__file__).parent
    
    # Collect all posts
    all_posts = []
    posts_by_year = defaultdict(list)
    
    for html_file in sorted(blog_dir.glob('*.html')):
        if html_file.name.startswith('archive-') or html_file.name == 'index.html':
            continue
        
        metadata = extract_post_metadata(html_file)
        if metadata:
            all_posts.append(metadata)
            posts_by_year[metadata['year']].append(metadata)
    
    # Sort all posts by date (newest first)
    all_posts.sort(key=lambda x: x['date'], reverse=True)
    
    print(f"Found {len(all_posts)} total posts across {len(posts_by_year)} years")
    
    # Generate archive pages for each year
    all_years = sorted(posts_by_year.keys(), reverse=True)
    for year in all_years:
        archive_html = generate_archive_page(year, posts_by_year[year], all_years)
        archive_file = blog_dir / f'archive-{year}.html'
        with open(archive_file, 'w', encoding='utf-8') as f:
            f.write(archive_html)
        print(f"✅ Created archive-{year}.html ({len(posts_by_year[year])} posts)")
    
    # Read current index.html to get the template
    index_file = blog_dir / 'index.html'
    with open(index_file, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Extract the header and styles (everything before year sections)
    header_match = re.search(r'(.*?)(<div class="year-section")', index_content, re.DOTALL)
    if not header_match:
        print("Could not find header section")
        return
    
    header_html = header_match.group(1)
    
    # Extract footer
    footer_match = re.search(r'(<footer>.*?</footer>)', index_content, re.DOTALL)
    footer_html = footer_match.group(1) if footer_match else ''
    
    # Get recent posts (last 25)
    recent_posts = all_posts[:25]
    
    # Generate recent posts section
    recent_posts_html = []
    for post in recent_posts:
        recent_posts_html.append(generate_post_html(post))
    
    # Generate archive navigation
    archive_nav_items = []
    for year in all_years[:10]:  # Show last 10 years
        archive_nav_items.append(f'<a href="archive-{year}.html">{year}</a> ({len(posts_by_year[year])})')
    
    archive_nav_html = ' | '.join(archive_nav_items)
    if len(all_years) > 10:
        archive_nav_html += f' | <a href="archive-{all_years[-1]}.html">...</a>'
    
    # Generate new index.html
    new_index = f'''{header_html}
        <div class="archive-nav" style="margin-bottom: 30px; padding: 15px; background: #ecf0f1; border-radius: 5px; text-align: center;">
            <strong>Browse Archives:</strong> {archive_nav_html}
        </div>
        
        <div class="year-section">
            <h2 class="year-header">Recent Posts <span style="font-size: 0.6em; color: #95a5a6;">(Last {len(recent_posts)} of {len(all_posts)} total)</span></h2>
{chr(10).join(recent_posts_html)}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #ecf0f1; border-radius: 5px;">
            <h3 style="margin-bottom: 15px; color: #2c3e50;">Browse by Year</h3>
            <p style="margin-bottom: 10px;">{archive_nav_html}</p>
            <p style="font-size: 0.9em; color: #7f8c8d; margin-top: 15px;">Total: {len(all_posts)} posts across {len(all_years)} years</p>
        </div>
        
{footer_html}'''
    
    # Write new index.html
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(new_index)
    
    print(f"\n✅ Updated index.html with {len(recent_posts)} recent posts")
    print(f"✅ Created {len(all_years)} archive pages")

if __name__ == '__main__':
    main()

