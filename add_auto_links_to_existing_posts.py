#!/usr/bin/env python3
"""
Script to add automatic links to TrueSight DAO and Agroverse in existing blog posts.
This retroactively applies the automatic linking feature to posts that were published
before the feature was implemented.
"""

import re
import os
from pathlib import Path
from html import escape, unescape

def is_inside_html_tag(text, position):
    """Check if a position is inside an HTML tag"""
    before = text[:position]
    last_open = before.rfind('<')
    last_close = before.rfind('>')
    # If last < is after last >, we're inside a tag
    return last_open > last_close

def is_inside_link(text, position, match_length):
    """Check if a position is inside an <a> tag"""
    before = text[:position]
    after = text[position + match_length:]
    last_a_open = before.rfind('<a ')
    last_a_close = before.rfind('</a>')
    next_a_close = after.find('</a>')
    # If we're inside an <a> tag, don't link
    return last_a_open > last_a_close and next_a_close != -1

def add_auto_links(html_content):
    """Add automatic links to TrueSight DAO and Agroverse"""
    content = html_content
    
    # Auto-link TrueSight DAO
    result = ''
    search_index = 0
    pattern = re.compile(r'TrueSight DAO', re.IGNORECASE)
    
    for match in pattern.finditer(content):
        # Add everything before the match
        result += content[search_index:match.start()]
        
        # Check if we're inside an HTML tag or link
        if not is_inside_html_tag(content, match.start()) and not is_inside_link(content, match.start(), len(match.group())):
            # Safe to link
            result += '<a href="https://truesight.me" target="_blank" rel="noopener noreferrer">TrueSight DAO</a>'
        else:
            # Keep as is
            result += match.group()
        
        search_index = match.end()
    
    # Add remaining text
    result += content[search_index:]
    content = result
    
    # Auto-link Agroverse (case-insensitive, word boundary)
    result = ''
    search_index = 0
    pattern = re.compile(r'\bAgroverse\b', re.IGNORECASE)
    
    for match in pattern.finditer(content):
        # Add everything before the match
        result += content[search_index:match.start()]
        
        # Check if we're inside an HTML tag or link
        if not is_inside_html_tag(content, match.start()) and not is_inside_link(content, match.start(), len(match.group())):
            # Safe to link - preserve original case
            original_text = match.group()
            result += f'<a href="https://agroverse.shop" target="_blank" rel="noopener noreferrer">{original_text}</a>'
        else:
            # Keep as is
            result += match.group()
        
        search_index = match.end()
    
    # Add remaining text
    result += content[search_index:]
    
    return result

def process_post_file(file_path):
    """Process a single blog post file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Only process if it's a blog post (has content div)
        if '<div class="content">' not in content:
            return False, 'Not a blog post file'
        
        # Check if already has auto-links (check for truesight.me or agroverse.shop links)
        # We'll update anyway to ensure consistency
        
        # Add auto-links
        updated_content = add_auto_links(content)
        
        # Only write if content changed
        if updated_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            return True, 'Updated'
        else:
            return False, 'No changes needed'
            
    except Exception as e:
        return False, f'Error: {str(e)}'

def main():
    """Main function"""
    print("=" * 60)
    print("Add Auto-Links to Existing Blog Posts")
    print("=" * 60)
    print()
    
    # Find all HTML post files (YYYY-MM-DD-*.html pattern)
    post_files = []
    for file_path in Path('.').glob('20*.html'):
        if file_path.name.startswith('20') and len(file_path.name) > 10:
            post_files.append(file_path)
    
    print(f"Found {len(post_files)} potential blog post files")
    print()
    
    updated_count = 0
    error_count = 0
    
    for file_path in sorted(post_files):
        print(f"Processing: {file_path.name}...", end=' ')
        updated, message = process_post_file(file_path)
        
        if updated:
            print(f"✓ {message}")
            updated_count += 1
        elif 'Error' in message:
            print(f"✗ {message}")
            error_count += 1
        else:
            print(f"- {message}")
    
    print()
    print("=" * 60)
    print(f"Done! Updated {updated_count} file(s), {error_count} error(s)")
    print()
    print("Note: This script adds links to 'TrueSight DAO' and 'Agroverse'")
    print("in existing posts. Future posts will have automatic linking built-in.")

if __name__ == "__main__":
    main()


