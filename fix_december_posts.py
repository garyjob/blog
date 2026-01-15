#!/usr/bin/env python3
"""
Fix blog posts published after Dec 1, 2025:
1. Convert span category tags to proper anchor links
2. Fix malformed category data
3. Ensure categories link to category pages
"""

import re
from pathlib import Path
from html import escape
from datetime import datetime

def slugify_category(category):
    """Convert category name to URL-friendly slug."""
    # Remove markdown formatting and clean up
    category = re.sub(r'\*\*', '', category)
    category = re.sub(r'\[&quot;|&quot;\]', '', category)  # Remove JSON array artifacts
    category = category.strip().strip('"').strip("'")
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def extract_categories_from_post(content):
    """Extract categories from a post, checking both span and anchor tags."""
    categories = []
    
    # First, try to find anchor tags with category links
    anchor_matches = re.findall(r'<a href="categories/([^"]+)\.html" class="category-tag">([^<]+)</a>', content)
    for slug, name in anchor_matches:
        # Clean up the name
        name_clean = name.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'")
        # Skip malformed categories
        if name_clean and not name_clean.startswith('[') and name_clean != '**':
            categories.append({'slug': slug, 'name': name_clean})
    
    # Also check for span tags (these need to be converted)
    span_matches = re.findall(r'<span class="category-tag">([^<]+)</span>', content)
    for name in span_matches:
        name_clean = name.strip()
        # Skip malformed categories
        if name_clean and name_clean != '**' and not name_clean.startswith('['):
            slug = slugify_category(name_clean)
            categories.append({'slug': slug, 'name': name_clean})
    
    # Remove duplicates while preserving order
    seen = set()
    unique_categories = []
    for cat in categories:
        key = (cat['slug'], cat['name'])
        if key not in seen:
            seen.add(key)
            unique_categories.append(cat)
    
    return unique_categories

def fix_post_categories(html_file):
    """Fix category tags in a blog post."""
    print(f"\nProcessing: {html_file.name}")
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Extract categories
    categories = extract_categories_from_post(content)
    
    if not categories:
        print(f"  - No valid categories found")
        return False
    
    print(f"  Found {len(categories)} category/categories: {', '.join([c['name'] for c in categories])}")
    
    # Generate proper category links HTML
    category_tags_html = []
    for cat in categories:
        category_tags_html.append(f'<a href="categories/{cat["slug"]}.html" class="category-tag">{escape(cat["name"])}</a>')
    
    category_tags_html_str = '\n                '.join(category_tags_html)
    
    # Find and replace the category section in post-meta
    # Pattern 1: Replace span tags
    span_pattern = r'(<div class="post-meta">\s*<span class="post-date">[^<]+</span>)\s*(<span class="category-tag">[^<]+</span>\s*)+'
    if re.search(span_pattern, content):
        content = re.sub(
            span_pattern,
            r'\1\n                ' + category_tags_html_str,
            content
        )
        print(f"  ✓ Replaced span category tags")
    
    # Pattern 2: Replace existing anchor tags (to fix malformed ones)
    anchor_pattern = r'(<div class="post-meta">\s*<span class="post-date">[^<]+</span>)\s*(<a href="categories/[^"]+\.html" class="category-tag">[^<]+</a>\s*)+'
    if re.search(anchor_pattern, content):
        content = re.sub(
            anchor_pattern,
            r'\1\n                ' + category_tags_html_str,
            content
        )
        print(f"  ✓ Replaced anchor category tags")
    
    # Pattern 3: More flexible pattern - find post-meta and replace everything after post-date
    flexible_pattern = r'(<div class="post-meta">\s*<span class="post-date">[^<]+</span>)(.*?)(</div>)'
    def replace_categories(match):
        return match.group(1) + '\n                ' + category_tags_html_str + '\n            ' + match.group(3)
    
    # Only replace if we found category tags in the original
    if '<span class="category-tag">' in content or '<a href="categories/' in content:
        content = re.sub(flexible_pattern, replace_categories, content, flags=re.DOTALL)
        print(f"  ✓ Updated category section")
    
    # Also fix meta tags if they have malformed categories
    # Fix article:tag meta tags
    meta_tag_pattern = r'<meta property="article:tag" content="[^"]*\[&quot;[^"]*&quot;\][^"]*">'
    if re.search(meta_tag_pattern, content):
        # Remove malformed meta tags
        content = re.sub(meta_tag_pattern, '', content)
        # Add correct meta tags
        meta_tags = []
        for cat in categories:
            meta_tags.append(f'    <meta property="article:tag" content="{escape(cat["name"])}">')
        meta_tags_str = '\n'.join(meta_tags)
        
        # Find where to insert (after article:author or article:published_time)
        if '<meta property="article:author"' in content:
            content = re.sub(
                r'(<meta property="article:author"[^>]*>)',
                r'\1\n' + meta_tags_str,
                content
            )
        elif '<meta property="article:published_time"' in content:
            content = re.sub(
                r'(<meta property="article:published_time"[^>]*>)',
                r'\1\n' + meta_tags_str,
                content
            )
        print(f"  ✓ Fixed meta tags")
    
    # Fix JSON-LD keywords if present
    keywords_pattern = r'"keywords":\s*"[^"]*\[&quot;[^"]*&quot;\][^"]*"'
    if re.search(keywords_pattern, content):
        keywords_list = [cat['name'] for cat in categories]
        keywords_str = ', '.join(keywords_list)
        content = re.sub(keywords_pattern, f'"keywords": "{escape(keywords_str)}"', content)
        print(f"  ✓ Fixed JSON-LD keywords")
    
    if content != original_content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed: {html_file.name}")
        return True
    else:
        print(f"  - No changes needed")
        return False

def main():
    """Main function to fix all December posts."""
    blog_dir = Path(__file__).parent
    
    print("=" * 60)
    print("Fixing December 2025 Blog Posts")
    print("=" * 60)
    
    # Find all posts from December 2025
    december_posts = []
    for html_file in blog_dir.glob('2025-12-*.html'):
        december_posts.append(html_file)
    
    december_posts.sort()
    
    print(f"\nFound {len(december_posts)} posts from December 2025")
    
    fixed_count = 0
    for post_file in december_posts:
        if fix_post_categories(post_file):
            fixed_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✓ Fixed {fixed_count} post(s)")
    print(f"\nNext steps:")
    print(f"1. Run: python3 generate_category_pages.py")
    print(f"2. Run: python3 restructure_index.py")
    print("=" * 60)

if __name__ == '__main__':
    main()





