#!/usr/bin/env python3
"""
Fix JSON-LD formatting in posts - replace HTML entities with proper JSON.
"""

import re
import json
from pathlib import Path

def fix_jsonld(html_file):
    """Fix JSON-LD formatting in a post."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find JSON-LD script tag - use more flexible pattern
        jsonld_pattern = r'(<script[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)'
        jsonld_match = re.search(jsonld_pattern, content, re.DOTALL | re.IGNORECASE)
        if not jsonld_match:
            return False
        
        jsonld_content = jsonld_match.group(2).strip()
        
        # Check if it has HTML entities (needs fixing)
        if '&quot;' not in jsonld_content and '&#x27;' not in jsonld_content and '&#x39;' not in jsonld_content:
            return False  # Already properly formatted
        
        # Try to parse the JSON-LD to extract data
        # Use html.unescape to properly decode HTML entities
        from html import unescape
        temp_json = unescape(jsonld_content)
        
        # Clean up any stray HTML tags
        temp_json = re.sub(r'</?[^>]+>', '', temp_json)
        
        # JSON requires double quotes, but we might have single quotes from the escape
        # Try to parse as-is first
        try:
            data = json.loads(temp_json)
        except json.JSONDecodeError:
            # If parsing fails, try converting single quotes to double quotes (carefully)
            # Only convert quotes that are used as string delimiters, not inside strings
            # This is tricky, so let's try a simpler approach: recreate from metadata
            try:
                # Extract fields using regex as fallback
                headline_match = re.search(r'"headline":\s*([^,}]+)', temp_json)
                desc_match = re.search(r'"description":\s*([^,}]+)', temp_json)
                date_match = re.search(r'"datePublished":\s*"([^"]+)"', temp_json)
                url_match = re.search(r'"@id":\s*"([^"]+)"', temp_json)
                
                # Reconstruct JSON properly
                data = {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": headline_match.group(1).strip(' \'"') if headline_match else "",
                    "description": desc_match.group(1).strip(' \'"') if desc_match else "",
                    "author": {
                        "@type": "Person",
                        "name": "Gary Teh"
                    },
                    "datePublished": date_match.group(1) if date_match else "",
                    "dateModified": date_match.group(1) if date_match else "",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Gary Teh's Blog",
                        "url": "https://garyteh.com"
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": url_match.group(1) if url_match else ""
                    }
                }
                # Try to get keywords if present
                keywords_match = re.search(r'"keywords":\s*([^,}]+)', temp_json)
                if keywords_match:
                    keywords = keywords_match.group(1).strip(' \'"')
                    if keywords:
                        data["keywords"] = keywords
            except:
                # If all else fails, skip this file
                return False
        
        # Re-serialize as proper JSON
        proper_json = json.dumps(data, indent=2, ensure_ascii=False)
        
        # Replace in content
        script_start = jsonld_match.group(1)
        script_end = jsonld_match.group(3)
        new_jsonld = f'{script_start}\n{proper_json}\n    {script_end}'
        new_content = content[:jsonld_match.start()] + new_jsonld + content[jsonld_match.end():]
        
        # Write updated content
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
        
    except Exception as e:
        print(f"Error fixing {html_file.name}: {e}")
        return False

def main():
    """Fix JSON-LD in all blog posts."""
    blog_dir = Path(__file__).parent
    fixed_count = 0
    
    for html_file in sorted(blog_dir.glob('*.html')):
        if html_file.name.startswith('archive-') or html_file.name == 'index.html':
            continue
        
        if fix_jsonld(html_file):
            fixed_count += 1
            print(f"✅ Fixed JSON-LD in {html_file.name}")
    
    print(f"\n✅ Fixed JSON-LD formatting in {fixed_count} posts")

if __name__ == '__main__':
    main()

