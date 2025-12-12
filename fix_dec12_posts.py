#!/usr/bin/env python3
"""
Fix blog posts published after Dec 12, 2025:
1. Extract suggested categories from drafts and add them to published posts
2. Update category pages to link back to posts
3. Update index.html to include these posts
"""

import re
from pathlib import Path
from html import escape
from collections import defaultdict
from datetime import datetime

def slugify_category(category):
    """Convert category name to slug."""
    slug = category.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def extract_suggested_categories_from_draft(draft_path):
    """Extract suggested categories from a draft file."""
    try:
        with open(draft_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for "Suggested Categories:" line
        # Pattern: **Suggested Categories:** followed by comma-separated list
        pattern = r'(?i)(?:Suggested Categories|Categories):\s*([^\n]+)'
        match = re.search(pattern, content)
        
        if match:
            categories_str = match.group(1).strip()
            # Remove markdown bold if present
            categories_str = re.sub(r'\*\*', '', categories_str)
            # Split by comma
            categories = [cat.strip() for cat in categories_str.split(',')]
            # Filter out empty strings
            categories = [cat for cat in categories if cat]
            return categories
        
        return []
    except Exception as e:
        print(f"  ⚠️  Error reading draft {draft_path.name}: {e}")
        return []

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
            'categories': categories,
            'content': content
        }
    except Exception as e:
        print(f"Error processing {html_file.name}: {e}")
        return None

def update_post_with_categories(html_file, new_categories):
    """Update a blog post HTML file with new category links."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the post-meta section where categories are
        # Pattern: <div class="post-meta">...<span class="post-date">...</span>...categories...</div>
        post_meta_pattern = r'(<div class="post-meta">\s*<span class="post-date">[^<]+</span>)(.*?)(\s*</div>)'
        match = re.search(post_meta_pattern, content, re.DOTALL)
        
        if not match:
            print(f"  ⚠️  Could not find post-meta section in {html_file.name}")
            return False
        
        # Generate category links HTML
        category_links = []
        for cat in new_categories:
            slug = slugify_category(cat)
            category_links.append(f'<a href="categories/{slug}.html" class="category-tag">{escape(cat)}</a>')
        
        category_html = '\n                '.join(category_links) if category_links else ''
        
        # Replace the post-meta section
        new_post_meta = f'{match.group(1)}\n                {category_html}\n            {match.group(3)}'
        new_content = content[:match.start()] + new_post_meta + content[match.end():]
        
        # Also update meta tags
        # Find article:tag meta tags
        meta_tag_pattern = r'(<meta property="article:tag" content="[^"]+">\s*)+'
        meta_match = re.search(meta_tag_pattern, content)
        
        if meta_match:
            # Generate new meta tags
            new_meta_tags = '\n'.join([f'    <meta property="article:tag" content="{escape(cat)}">' for cat in new_categories])
            new_content = re.sub(meta_tag_pattern, new_meta_tags + '\n', new_content)
        else:
            # Insert after article:author
            author_pattern = r'(<meta property="article:author"[^>]+>)'
            if re.search(author_pattern, new_content):
                new_meta_tags = '\n'.join([f'    <meta property="article:tag" content="{escape(cat)}">' for cat in new_categories])
                new_content = re.sub(author_pattern, r'\1\n' + new_meta_tags, new_content)
        
        # Update JSON-LD keywords
        keywords_pattern = r'"keywords":\s*"[^"]*"'
        keywords_value = ', '.join(new_categories)
        new_content = re.sub(keywords_pattern, f'"keywords": "{escape(keywords_value)}"', new_content)
        
        # Write updated content
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"  ⚠️  Error updating {html_file.name}: {e}")
        return False

def main():
    """Main function to fix posts published after Dec 12."""
    blog_dir = Path(__file__).parent
    drafts_dir = blog_dir / 'drafts'
    
    print("🔍 Finding posts published after Dec 12, 2025...")
    
    # Find all posts from Dec 12 onwards
    posts_to_fix = []
    for html_file in sorted(blog_dir.glob('2025-12-*.html')):
        date_match = re.search(r'2025-12-(\d{2})', html_file.name)
        if date_match:
            day = int(date_match.group(1))
            if day >= 12:  # Dec 12 and later
                posts_to_fix.append(html_file)
    
    print(f"Found {len(posts_to_fix)} posts to check\n")
    
    # Process each post
    updated_posts = []
    for html_file in posts_to_fix:
        print(f"Processing: {html_file.name}")
        
        # Extract metadata
        metadata = extract_post_metadata(html_file)
        if not metadata:
            print(f"  ⚠️  Could not extract metadata")
            continue
        
        # Find corresponding draft
        # Try to match by date and title slug
        date_str = metadata['date']
        title_slug = re.sub(r'[^a-z0-9]+', '-', metadata['title'].lower()).strip('-')
        
        # Look for draft files matching the date
        draft_candidates = list(drafts_dir.glob(f'{date_str}-*.md'))
        
        if not draft_candidates:
            print(f"  ⚠️  No draft found for {html_file.name}")
            continue
        
        # Try to find the best match
        draft_file = None
        for candidate in draft_candidates:
            # Check if the draft title matches
            try:
                with open(candidate, 'r', encoding='utf-8') as f:
                    draft_content = f.read()
                    if metadata['title'].lower() in draft_content.lower():
                        draft_file = candidate
                        break
            except:
                continue
        
        if not draft_file and draft_candidates:
            # Use the first candidate if we can't find a match
            draft_file = draft_candidates[0]
        
        if not draft_file:
            print(f"  ⚠️  Could not find matching draft")
            continue
        
        print(f"  📄 Found draft: {draft_file.name}")
        
        # Extract suggested categories
        suggested_categories = extract_suggested_categories_from_draft(draft_file)
        
        if not suggested_categories:
            print(f"  ℹ️  No suggested categories found in draft")
            continue
        
        print(f"  🏷️  Suggested categories: {', '.join(suggested_categories)}")
        
        # Check current categories
        current_category_names = [cat['name'] for cat in metadata['categories']]
        print(f"  📋 Current categories: {', '.join(current_category_names) if current_category_names else 'None'}")
        
        # Merge categories (avoid duplicates)
        all_categories = list(set(current_category_names + suggested_categories))
        
        if set(all_categories) == set(current_category_names):
            print(f"  ✓ Categories already up to date")
            continue
        
        # Update the post
        if update_post_with_categories(html_file, all_categories):
            print(f"  ✅ Updated with categories: {', '.join(all_categories)}")
            updated_posts.append({
                'filename': html_file.name,
                'title': metadata['title'],
                'date': metadata['date'],
                'categories': all_categories
            })
        else:
            print(f"  ❌ Failed to update")
    
    print(f"\n✅ Updated {len(updated_posts)} posts")
    
    if updated_posts:
        print("\n🔄 Regenerating category pages...")
        # Import and run generate_category_pages
        import subprocess
        result = subprocess.run(['python3', str(blog_dir / 'generate_category_pages.py')], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        
        print("\n🔄 Updating index.html...")
        # Import and run restructure_index
        result = subprocess.run(['python3', str(blog_dir / 'restructure_index.py')], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        
        print("\n✅ All fixes complete!")
        print(f"\nSummary:")
        print(f"  - Updated {len(updated_posts)} posts with categories")
        print(f"  - Regenerated category pages")
        print(f"  - Updated index.html")

if __name__ == '__main__':
    main()
