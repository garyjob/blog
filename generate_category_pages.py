#!/usr/bin/env python3
"""
Generate category pages from all blog posts.
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

def generate_category_page(category_slug, category_name, posts):
    """Generate HTML for a category page."""
    # Group posts by year
    posts_by_year = defaultdict(list)
    for post in posts:
        posts_by_year[post['year']].append(post)
    
    # Sort years
    years = sorted(posts_by_year.keys(), reverse=True)
    
    # Generate year sections
    year_sections_html = []
    total_posts = len(posts)
    
    for year in years:
        year_posts = sorted(posts_by_year[year], key=lambda x: x['date'], reverse=True)
        year_sections_html.append(f'        <div class="year-section" data-year="{year}">')
        year_sections_html.append(f'            <h2 class="year-header">{year} <span style="font-size: 0.6em; color: #95a5a6;">({len(year_posts)} posts)</span></h2>')
        
        for post in year_posts:
            year_sections_html.append(f'            <div class="post">')
            year_sections_html.append(f'                <div class="post-title"><a href="../{escape(post["filename"])}">{escape(post["title"])}</a></div>')
            year_sections_html.append(f'                <div class="post-meta">')
            year_sections_html.append(f'                    <span class="post-date">{escape(post["date"])}</span>')
            year_sections_html.append(f'                </div>')
            year_sections_html.append(f'            </div>')
        
        year_sections_html.append(f'        </div>')
    
    category_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(category_name)} - Gary Teh's Blog</title>
    <meta name="description" content="All posts in the {escape(category_name)} category on Gary Teh's Blog">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
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
        .stats {{
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            color: #555;
        }}
        .year-section {{
            margin-bottom: 40px;
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
        footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
        }}
        @media (max-width: 600px) {{
            .container {{
                padding: 20px;
            }}
            h1 {{
                font-size: 2em;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back-link">← Back to all posts</a>
        
        <header>
            <h1>{escape(category_name)}</h1>
            <div class="stats">
                <strong>{total_posts} post{"s" if total_posts != 1 else ""}</strong> in this category
            </div>
        </header>
{chr(10).join(year_sections_html)}
        <footer>
            <p><a href="../index.html">← Back to all posts</a></p>
            <p>© Gary Teh • 2009-2025</p>
        </footer>
    </div>
    <script id="mcjs">!function(c,h,i,m,p){{m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/f4002ef7c62ee64494321ba14/9c56fa20706b0138cf6fea672.js");</script>
</body>
</html>'''
    
    return category_html

def main():
    """Main function to generate category pages."""
    blog_dir = Path(__file__).parent
    categories_dir = blog_dir / 'categories'
    categories_dir.mkdir(exist_ok=True)
    
    # Collect all posts and group by category
    posts_by_category = defaultdict(list)
    
    for html_file in sorted(blog_dir.glob('*.html')):
        if html_file.name.startswith('archive-') or html_file.name == 'index.html':
            continue
        
        metadata = extract_post_metadata(html_file)
        if metadata:
            for cat in metadata['categories']:
                posts_by_category[cat['slug']].append({
                    'filename': metadata['filename'],
                    'title': metadata['title'],
                    'date': metadata['date'],
                    'year': metadata['year'],
                    'formatted_date': metadata['formatted_date']
                })
    
    # Generate category pages
    for category_slug, posts in posts_by_category.items():
        # Get category name from first post
        category_name = posts[0].get('category_name', category_slug.replace('-', ' ').title())
        
        # Try to get the actual category name from a post's categories
        for html_file in sorted(blog_dir.glob('*.html')):
            if html_file.name.startswith('archive-') or html_file.name == 'index.html':
                continue
            metadata = extract_post_metadata(html_file)
            if metadata:
                for cat in metadata['categories']:
                    if cat['slug'] == category_slug:
                        category_name = cat['name']
                        break
                if category_name != category_slug.replace('-', ' ').title():
                    break
        
        category_html = generate_category_page(category_slug, category_name, posts)
        category_file = categories_dir / f'{category_slug}.html'
        
        with open(category_file, 'w', encoding='utf-8') as f:
            f.write(category_html)
        
        print(f"✅ Created categories/{category_slug}.html ({len(posts)} posts)")
    
    print(f"\n✅ Generated {len(posts_by_category)} category pages")

if __name__ == '__main__':
    main()

