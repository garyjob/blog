#!/usr/bin/env python3
"""
Generate sitemap.xml for SEO.
"""

import re
from pathlib import Path
from datetime import datetime
from html import escape

def extract_post_metadata(html_file):
    """Extract metadata from an HTML blog post."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract date from filename
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', html_file.name)
        if not date_match:
            return None
        date = date_match.group(1)
        
        # Try to get last modified date from file system
        file_stat = html_file.stat()
        lastmod = datetime.fromtimestamp(file_stat.st_mtime).strftime('%Y-%m-%d')
        
        return {
            'url': f'https://garyteh.com/{html_file.name}',
            'lastmod': lastmod,
            'changefreq': 'monthly',
            'priority': '0.8'
        }
    except Exception as e:
        print(f"Error processing {html_file.name}: {e}")
        return None

def main():
    """Generate sitemap.xml."""
    blog_dir = Path(__file__).parent
    base_url = 'https://garyteh.com'
    
    # Collect all pages
    urls = []
    
    # Add homepage
    urls.append({
        'url': base_url + '/index.html',
        'lastmod': datetime.now().strftime('%Y-%m-%d'),
        'changefreq': 'daily',
        'priority': '1.0'
    })
    
    # Add all blog posts
    for html_file in sorted(blog_dir.glob('*.html')):
        if html_file.name.startswith('archive-') or html_file.name == 'index.html':
            continue
        
        metadata = extract_post_metadata(html_file)
        if metadata:
            urls.append(metadata)
    
    # Add archive pages
    for archive_file in sorted(blog_dir.glob('archive-*.html')):
        file_stat = archive_file.stat()
        lastmod = datetime.fromtimestamp(file_stat.st_mtime).strftime('%Y-%m-%d')
        urls.append({
            'url': f'{base_url}/{archive_file.name}',
            'lastmod': lastmod,
            'changefreq': 'weekly',
            'priority': '0.7'
        })
    
    # Add category pages
    categories_dir = blog_dir / 'categories'
    if categories_dir.exists():
        for category_file in sorted(categories_dir.glob('*.html')):
            file_stat = category_file.stat()
            lastmod = datetime.fromtimestamp(file_stat.st_mtime).strftime('%Y-%m-%d')
            urls.append({
                'url': f'{base_url}/categories/{category_file.name}',
                'lastmod': lastmod,
                'changefreq': 'weekly',
                'priority': '0.6'
            })
    
    # Generate sitemap.xml
    sitemap = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
'''
    
    for url_data in urls:
        sitemap += f'''   <url>
      <loc>{escape(url_data['url'])}</loc>
      <lastmod>{url_data['lastmod']}</lastmod>
      <changefreq>{url_data['changefreq']}</changefreq>
      <priority>{url_data['priority']}</priority>
   </url>
'''
    
    sitemap += '</urlset>\n'
    
    # Write sitemap
    sitemap_file = blog_dir / 'sitemap.xml'
    with open(sitemap_file, 'w', encoding='utf-8') as f:
        f.write(sitemap)
    
    print(f"✅ Generated sitemap.xml with {len(urls)} URLs")

if __name__ == '__main__':
    main()


