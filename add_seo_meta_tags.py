#!/usr/bin/env python3
"""
Add/update SEO meta tags to blog posts (Open Graph, Twitter Cards, Structured Data).
"""

import re
import json
from pathlib import Path
from html import escape
from datetime import datetime

def extract_post_content(html_file):
    """Extract content from post for description generation."""
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
        
        # Parse date for ISO format
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            iso_date = date_obj.strftime('%Y-%m-%dT00:00:00+00:00')
        except:
            iso_date = date + 'T00:00:00+00:00'
        
        # Extract formatted date
        formatted_date_match = re.search(r'<span class="post-date">(.*?)</span>', content)
        formatted_date = formatted_date_match.group(1) if formatted_date_match else date
        
        # Extract categories
        categories = []
        cat_matches = re.findall(r'<a href="categories/([^"]+)\.html" class="category-tag">([^<]+)</a>', content)
        for slug, name in cat_matches:
            categories.append(name)
        
        # Extract content text for description
        content_match = re.search(r'<div class="content">(.*?)</div>\s*<footer>', content, re.DOTALL)
        if content_match:
            content_html = content_match.group(1)
            # Strip HTML tags for description
            content_text = re.sub(r'<[^>]+>', '', content_html)
            content_text = content_text.strip().replace('\n', ' ').replace('\r', '')
            # Take first 155 chars
            description = content_text[:155].strip()
            if len(content_text) > 155:
                description += '...'
        else:
            description = title
        
        # Generate article tags
        article_tags = []
        for cat in categories:
            article_tags.append(f'    <meta property="article:tag" content="{escape(cat)}">')
        article_tags_html = '\n'.join(article_tags) if article_tags else ''
        
        return {
            'title': title,
            'date': date,
            'iso_date': iso_date,
            'formatted_date': formatted_date,
            'description': description,
            'categories': categories,
            'article_tags_html': article_tags_html,
            'filename': html_file.name,
            'url': f'https://garyteh.com/{html_file.name}'
        }
    except Exception as e:
        print(f"Error processing {html_file.name}: {e}")
        return None

def add_seo_tags(html_file):
    """Add SEO meta tags to a blog post if missing."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        metadata = extract_post_content(html_file)
        if not metadata:
            return False
        
        # Check if Open Graph tags already exist
        has_og = 'property="og:' in content
        has_twitter = 'name="twitter:' in content
        has_canonical = 'rel="canonical"' in content
        has_jsonld = 'application/ld+json' in content
        
        # If all tags exist, skip
        if has_og and has_twitter and has_canonical and has_jsonld:
            return False
        
        # Find head tag position
        head_match = re.search(r'(<head>.*?)(<style>|<script>|</head>)', content, re.DOTALL)
        if not head_match:
            return False
        
        head_end = head_match.end(1)
        
        # Generate JSON-LD structured data
        jsonld_data = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": metadata['title'],
            "description": metadata['description'],
            "author": {
                "@type": "Person",
                "name": "Gary Teh"
            },
            "datePublished": metadata['iso_date'],
            "dateModified": metadata['iso_date'],
            "publisher": {
                "@type": "Organization",
                "name": "Gary Teh's Blog",
                "url": "https://garyteh.com"
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": metadata['url']
            }
        }
        if metadata['categories']:
            jsonld_data['keywords'] = ', '.join(metadata['categories'])
        
        jsonld_str = json.dumps(jsonld_data, indent=2, ensure_ascii=False)
        
        # Generate SEO tags
        seo_tags = f'''    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{metadata['url']}">
    <meta property="og:title" content="{escape(metadata['title'])}">
    <meta property="og:description" content="{escape(metadata['description'])}">
    <meta property="og:site_name" content="Gary Teh's Blog">
    <meta property="article:published_time" content="{metadata['iso_date']}">
    <meta property="article:author" content="Gary Teh">
{metadata['article_tags_html']}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:url" content="{metadata['url']}">
    <meta name="twitter:title" content="{escape(metadata['title'])}">
    <meta name="twitter:description" content="{escape(metadata['description'])}">
    
    <!-- Additional meta for better SEO -->
    <meta name="author" content="Gary Teh">
    <link rel="canonical" href="{metadata['url']}">
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
{jsonld_str}
    </script>
    
'''
        
        # Insert SEO tags before style/script/head end
        new_content = content[:head_end] + '\n' + seo_tags + content[head_end:]
        
        # Write updated content
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error adding SEO tags to {html_file.name}: {e}")
        return False

def main():
    """Add SEO tags to all blog posts."""
    blog_dir = Path(__file__).parent
    updated_count = 0
    
    for html_file in sorted(blog_dir.glob('*.html')):
        if html_file.name.startswith('archive-') or html_file.name == 'index.html':
            continue
        
        if add_seo_tags(html_file):
            updated_count += 1
            print(f"✅ Added SEO tags to {html_file.name}")
    
    print(f"\n✅ Updated {updated_count} posts with SEO meta tags")

if __name__ == '__main__':
    main()

