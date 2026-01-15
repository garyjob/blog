#!/usr/bin/env python3
import re
from pathlib import Path
from datetime import datetime
from html import escape

POSTS_DIR = Path('.')
DRAFTS_DIR = Path('drafts')

def slugify_category(category):
    category = re.sub(r'\*\*', '', category).strip()
    slug = re.sub(r'[^\w\s-]', '', category.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def extract_categories_from_draft(draft_path):
    try:
        with open(draft_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if not content.startswith('---'):
            return []
        parts = content.split('---', 2)
        if len(parts) < 3:
            return []
        frontmatter = parts[1]
        cat_match = re.search(r'categories:\s*\[(.*?)\]', frontmatter, re.DOTALL)
        if cat_match:
            cats_str = cat_match.group(1)
            cats = re.findall(r'["\']([^"\']+)["\']', cats_str)
            cleaned_cats = [re.sub(r'\*\*', '', c).strip() for c in cats if c.strip() and c.strip() != '**']
            return cleaned_cats
    except:
        pass
    return []

def get_category_tags_html(categories):
    if not categories:
        return ''
    tags = []
    for cat in categories:
        slug = slugify_category(cat)
        tags.append(f'<a href="categories/{slug}.html" class="category-tag">{escape(cat)}</a>')
    return '\n                '.join(tags)

def fix_post_categories(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', html_file.name)
    if not date_match:
        return False, "No date"
    file_date = datetime.strptime(date_match.group(1), '%Y-%m-%d')
    if file_date < datetime(2025, 12, 1):
        return False, "Before Dec 1"
    
    has_links = bool(re.search(r'<a href="categories/[^"]+\.html" class="category-tag">', content))
    span_tags = re.findall(r'<span class="category-tag">([^<]*)</span>', content)
    
    draft_name = html_file.name.replace('.html', '.md')
    draft_path = DRAFTS_DIR / draft_name
    categories = []
    if draft_path.exists():
        categories = extract_categories_from_draft(draft_path)
    
    if not categories and span_tags:
        categories = [s.strip() for s in span_tags if s.strip() and s.strip() != '**']
    
    if not categories:
        return False, "No categories found"
    
    post_meta_pattern = r'(<div class="post-meta">.*?<span class="post-date">[^<]+</span>)(.*?)(</div>)'
    post_meta_match = re.search(post_meta_pattern, content, re.DOTALL)
    if not post_meta_match:
        return False, "No post-meta found"
    
    category_tags_html = get_category_tags_html(categories)
    new_content = (content[:post_meta_match.start()] + post_meta_match.group(1) + 
                   ('\n                ' + category_tags_html if category_tags_html else '') +
                   '\n            ' + post_meta_match.group(3) + content[post_meta_match.end():])
    
    new_content = re.sub(r'<span class="category-tag">[^<]*</span>\s*', '', new_content)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, f"Added: {', '.join(categories)}"

if __name__ == '__main__':
    print("Fixing category tags...")
    fixed = 0
    for html_file in sorted(POSTS_DIR.glob('2025-12-*.html')):
        print(f"\n{html_file.name}: ", end='')
        success, msg = fix_post_categories(html_file)
        if success:
            print(f"✓ {msg}")
            fixed += 1
        else:
            print(f"- {msg}")
    print(f"\nFixed {fixed} posts")




