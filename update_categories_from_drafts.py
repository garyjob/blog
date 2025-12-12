#!/usr/bin/env python3
"""
Update published blog posts to use suggested categories from their drafts.
This script reads the "Suggested Categories" from draft files and updates
the corresponding published HTML files.
"""

import re
from pathlib import Path
from html import escape

def slugify_category(category):
    """Convert category name to URL-friendly slug."""
    category = re.sub(r'\*\*', '', category)
    category = category.strip().strip('-').strip()
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def extract_suggested_categories(draft_content):
    """Extract suggested categories from draft content."""
    # Look for "Suggested Categories:" pattern
    pattern = r'\*\*Suggested Categories:\*\*\s*(.*?)(?:\n\n|\n\*\*|\nI\'ve|$)'
    match = re.search(pattern, draft_content, re.DOTALL | re.IGNORECASE)
    
    if not match:
        return []
    
    categories_text = match.group(1).strip()
    
    # Handle different formats:
    # 1. Comma-separated: "Cat1, Cat2, Cat3"
    # 2. List format: "- Cat1\n- Cat2\n- Cat3"
    
    categories = []
    
    # Try list format first (lines starting with -)
    if categories_text.startswith('-') or '\n-' in categories_text:
        for line in categories_text.split('\n'):
            line = line.strip()
            if line.startswith('-'):
                cat = line[1:].strip()
                if cat:
                    categories.append(cat)
    else:
        # Comma-separated
        categories = [c.strip() for c in categories_text.split(',')]
    
    # Clean up categories
    cleaned = []
    for cat in categories:
        cat = re.sub(r'\*\*', '', cat)  # Remove markdown bold
        cat = cat.strip().strip('-').strip()
        if cat and cat != '**':
            cleaned.append(cat)
    
    return cleaned

def update_post_categories(html_file, categories):
    """Update categories in a published HTML post."""
    if not categories:
        return False
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Generate category links HTML
    category_links = []
    for cat in categories:
        slug = slugify_category(cat)
        category_links.append(f'<a href="categories/{slug}.html" class="category-tag">{escape(cat)}</a>')
    
    category_html = '\n                '.join(category_links)
    
    # Update post-meta section
    meta_pattern = r'(<div class="post-meta">\s*<span class="post-date">[^<]+</span>)(.*?)(</div>)'
    def replace_meta(match):
        return match.group(1) + '\n                ' + category_html + '\n            ' + match.group(3)
    
    content = re.sub(meta_pattern, replace_meta, content, flags=re.DOTALL)
    
    # Update article:tag meta tags
    # Remove existing article:tag tags
    content = re.sub(r'    <meta property="article:tag"[^>]*>\n', '', content)
    
    # Add new article:tag meta tags after article:author
    meta_tags = []
    for cat in categories:
        meta_tags.append(f'    <meta property="article:tag" content="{escape(cat)}">')
    meta_tags_str = '\n'.join(meta_tags)
    
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
    
    # Update JSON-LD keywords
    keywords_str = ', '.join(categories)
    content = re.sub(
        r'"keywords":\s*"[^"]*"',
        f'"keywords": "{escape(keywords_str)}"',
        content
    )
    
    if content != original_content:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    """Main function."""
    blog_dir = Path(__file__).parent
    drafts_dir = blog_dir / 'drafts'
    
    print("=" * 60)
    print("Updating Published Posts with Suggested Categories from Drafts")
    print("=" * 60)
    
    # Find all December drafts
    december_drafts = sorted(drafts_dir.glob('2025-12-*.md'))
    
    updated_count = 0
    
    for draft_file in december_drafts:
        # Get corresponding HTML file
        html_filename = draft_file.stem + '.html'
        html_file = blog_dir / html_filename
        
        if not html_file.exists():
            print(f"\n⚠️  Draft {draft_file.name} has no corresponding published post")
            continue
        
        # Read draft
        draft_content = draft_file.read_text()
        
        # Extract suggested categories
        suggested_categories = extract_suggested_categories(draft_content)
        
        if not suggested_categories:
            continue
        
        print(f"\n{draft_file.name}:")
        print(f"  Suggested categories: {', '.join(suggested_categories)}")
        
        # Update HTML file
        if update_post_categories(html_file, suggested_categories):
            print(f"  ✅ Updated {html_filename}")
            updated_count += 1
        else:
            print(f"  - No changes needed for {html_filename}")
    
    print(f"\n{'=' * 60}")
    print(f"✅ Updated {updated_count} post(s)")
    print(f"\nNext steps:")
    print(f"1. Run: python3 generate_category_pages.py")
    print(f"2. Run: python3 restructure_index.py")
    print("=" * 60)

if __name__ == '__main__':
    main()

