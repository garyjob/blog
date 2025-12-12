#!/usr/bin/env python3
"""
Verify that suggested categories from drafts are present in published posts.
"""

import re
from pathlib import Path
import base64

def slugify_category(category):
    """Convert category name to URL-friendly slug."""
    category = re.sub(r'\*\*', '', category)
    category = category.strip().strip('-').strip()
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def extract_suggested_categories(draft_content):
    """Extract suggested categories from draft content."""
    pattern = r'\*\*Suggested Categories:\*\*\s*(.*?)(?:\n\n|\n\*\*|\nI\'ve|$)'
    match = re.search(pattern, draft_content, re.DOTALL | re.IGNORECASE)
    
    if not match:
        return []
    
    categories_text = match.group(1).strip()
    categories = []
    
    # Handle different formats
    if categories_text.startswith('-') or '\n-' in categories_text:
        for line in categories_text.split('\n'):
            line = line.strip()
            if line.startswith('-'):
                cat = line[1:].strip()
                if cat:
                    categories.append(cat)
    else:
        categories = [c.strip() for c in categories_text.split(',')]
    
    # Clean up categories
    cleaned = []
    for cat in categories:
        cat = re.sub(r'\*\*', '', cat)
        cat = cat.strip().strip('-').strip()
        if cat and cat != '**':
            cleaned.append(cat)
    
    return cleaned

def extract_categories_from_html(html_content):
    """Extract categories from published HTML post."""
    categories = []
    
    # Check if content is base64 encoded
    is_base64 = len(html_content.split('\n')) < 5 and len(html_content) > 10000
    if is_base64:
        try:
            html_content = base64.b64decode(html_content).decode('utf-8', errors='ignore')
        except:
            pass
    
    # Extract from category-tag links
    pattern = r'<a href="categories/([^"]+)\.html" class="category-tag">([^<]+)</a>'
    matches = re.findall(pattern, html_content)
    
    for slug, name in matches:
        name_clean = name.replace('&quot;', '"').replace('&amp;', '&').replace('&#39;', "'")
        categories.append({
            'slug': slug,
            'name': name_clean
        })
    
    return categories

def normalize_category_name(cat):
    """Normalize category name for comparison."""
    return re.sub(r'[^\w\s]', '', cat.lower()).strip()

def main():
    """Main verification function."""
    blog_dir = Path(__file__).parent
    drafts_dir = blog_dir / 'drafts'
    
    print("=" * 70)
    print("Verifying Suggested Categories in Published Posts")
    print("=" * 70)
    
    december_drafts = sorted(drafts_dir.glob('2025-12-*.md'))
    
    issues = []
    verified = []
    
    for draft_file in december_drafts:
        html_filename = draft_file.stem + '.html'
        html_file = blog_dir / html_filename
        
        if not html_file.exists():
            continue
        
        # Read draft
        draft_content = draft_file.read_text()
        suggested_categories = extract_suggested_categories(draft_content)
        
        if not suggested_categories:
            continue
        
        # Read HTML
        html_content = html_file.read_text()
        published_categories = extract_categories_from_html(html_content)
        published_names = [normalize_category_name(cat['name']) for cat in published_categories]
        
        # Check each suggested category
        missing = []
        for suggested in suggested_categories:
            suggested_normalized = normalize_category_name(suggested)
            if suggested_normalized not in published_names:
                missing.append(suggested)
        
        if missing:
            issues.append({
                'draft': draft_file.name,
                'html': html_filename,
                'suggested': suggested_categories,
                'published': [cat['name'] for cat in published_categories],
                'missing': missing
            })
        else:
            verified.append({
                'draft': draft_file.name,
                'html': html_filename,
                'categories': suggested_categories
            })
    
    # Print results
    print(f"\n✅ Verified ({len(verified)} posts):")
    for item in verified:
        print(f"  {item['html']}")
        print(f"    Categories: {', '.join(item['categories'])}")
    
    if issues:
        print(f"\n⚠️  Issues Found ({len(issues)} posts):")
        for item in issues:
            print(f"\n  {item['html']}")
            print(f"    Suggested: {', '.join(item['suggested'])}")
            print(f"    Published: {', '.join(item['published'])}")
            print(f"    ❌ Missing: {', '.join(item['missing'])}")
    else:
        print(f"\n✅ All suggested categories are present in published posts!")
    
    print("\n" + "=" * 70)
    
    return len(issues) == 0

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)

