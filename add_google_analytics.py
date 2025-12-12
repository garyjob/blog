#!/usr/bin/env python3
"""
Add Google Analytics (gtag.js) tracking code to all HTML pages.

This script:
- Scans all HTML files in the blog directory
- Adds the Google Analytics tag to the <head> section if not already present
- Places it right after the viewport meta tag for optimal tracking
"""

import re
from pathlib import Path

GOOGLE_ANALYTICS_TAG = '''<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F4W32NLZDE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F4W32NLZDE');
</script>'''

def has_google_analytics(content):
    """Check if the HTML already contains Google Analytics."""
    return 'G-F4W32NLZDE' in content or 'googletagmanager.com/gtag' in content

def add_google_analytics(html_file):
    """Add Google Analytics tag to an HTML file if not already present."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has Google Analytics
        if has_google_analytics(content):
            return False
        
        # Try to find the viewport meta tag and insert after it
        viewport_pattern = r'(<meta name="viewport"[^>]*>)'
        match = re.search(viewport_pattern, content, re.IGNORECASE)
        
        if match:
            # Insert right after the viewport tag
            insert_position = match.end()
            # Find the next newline or tag
            next_newline = content.find('\n', insert_position)
            if next_newline != -1:
                insert_position = next_newline + 1
            new_content = (
                content[:insert_position] +
                '\n    ' + GOOGLE_ANALYTICS_TAG.replace('\n', '\n    ') + '\n' +
                content[insert_position:]
            )
        else:
            # If no viewport tag, try to find the charset meta tag
            charset_pattern = r'(<meta charset="[^"]*">)'
            match = re.search(charset_pattern, content, re.IGNORECASE)
            
            if match:
                insert_position = match.end()
                next_newline = content.find('\n', insert_position)
                if next_newline != -1:
                    insert_position = next_newline + 1
                new_content = (
                    content[:insert_position] +
                    '\n    ' + GOOGLE_ANALYTICS_TAG.replace('\n', '\n    ') + '\n' +
                    content[insert_position:]
                )
            else:
                # Fallback: insert right after <head>
                head_pattern = r'(<head[^>]*>)'
                match = re.search(head_pattern, content, re.IGNORECASE)
                if match:
                    insert_position = match.end()
                    next_newline = content.find('\n', insert_position)
                    if next_newline != -1:
                        insert_position = next_newline + 1
                    new_content = (
                        content[:insert_position] +
                        '\n    ' + GOOGLE_ANALYTICS_TAG.replace('\n', '\n    ') + '\n' +
                        content[insert_position:]
                    )
                else:
                    print(f"  ⚠️  Could not find insertion point in {html_file.name}")
                    return False
        
        # Write updated content
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    
    except Exception as e:
        print(f"  ❌ Error processing {html_file.name}: {e}")
        return False

def main():
    """Main function to add Google Analytics to all HTML files."""
    blog_dir = Path(__file__).parent
    
    # Find all HTML files, excluding the google-apps-script directory
    html_files = []
    for html_file in blog_dir.rglob('*.html'):
        # Skip files in google-apps-script directory
        if 'google-apps-script' not in str(html_file):
            html_files.append(html_file)
    
    # Sort for consistent processing
    html_files.sort()
    
    print(f"Found {len(html_files)} HTML files to process\n")
    
    updated_count = 0
    skipped_count = 0
    
    for html_file in html_files:
        relative_path = html_file.relative_to(blog_dir)
        print(f"Processing {relative_path}...", end=' ')
        
        if add_google_analytics(html_file):
            print("✅ Added Google Analytics")
            updated_count += 1
        else:
            print("⏭️  Skipped (already has GA or error)")
            skipped_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Updated: {updated_count} files")
    print(f"⏭️  Skipped: {skipped_count} files")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()


