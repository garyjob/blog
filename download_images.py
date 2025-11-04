#!/usr/bin/env python3
"""
Download images from AWS/hosted servers to local images folder
and update all HTML files to use local references
"""

import os
import re
import urllib.request
import urllib.parse
from pathlib import Path
import time

# Domains to download images from (your own domains)
DOWNLOAD_DOMAINS = [
    'garyteh.com',
    'blog.name1price.com'
]

# Create images directory
images_dir = Path('images')
images_dir.mkdir(exist_ok=True)

# Track downloaded images
downloaded_images = {}
failed_downloads = []

def sanitize_filename(url):
    """Convert URL to safe filename, preserving path structure"""
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.lstrip('/')
    
    # Remove wp-content/uploads/ prefix if present
    path = re.sub(r'^wp-content/uploads/', '', path)
    
    # Replace slashes with underscores for flat structure
    filename = path.replace('/', '_')
    
    return filename

def download_image(url):
    """Download image from URL to local images folder"""
    if url in downloaded_images:
        return downloaded_images[url]
    
    try:
        filename = sanitize_filename(url)
        filepath = images_dir / filename
        
        # Skip if already downloaded
        if filepath.exists():
            print(f"  ✓ Already exists: {filename}")
            downloaded_images[url] = f"images/{filename}"
            return f"images/{filename}"
        
        # Download the image
        print(f"  Downloading: {url}")
        print(f"    → {filename}")
        
        headers = {'User-Agent': 'Mozilla/5.0'}
        request = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(request, timeout=10) as response:
            data = response.read()
            
        with open(filepath, 'wb') as f:
            f.write(data)
        
        downloaded_images[url] = f"images/{filename}"
        time.sleep(0.2)  # Be nice to servers
        
        return f"images/{filename}"
        
    except Exception as e:
        print(f"  ✗ Failed to download {url}: {e}")
        failed_downloads.append((url, str(e)))
        return url  # Keep original URL if download fails

def find_all_image_urls(html_content):
    """Find all image URLs in HTML content"""
    # Find img src attributes
    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
    # Find markdown image syntax ![...](...) 
    md_img_pattern = r'!\[[^\]]*\]\(([^)]+)\)'
    
    urls = []
    urls.extend(re.findall(img_pattern, html_content))
    urls.extend(re.findall(md_img_pattern, html_content))
    
    return urls

def should_download(url):
    """Check if we should download this image (only our own domains)"""
    for domain in DOWNLOAD_DOMAINS:
        if domain in url:
            return True
    return False

def process_html_files():
    """Process all HTML files to download images and update links"""
    html_files = [f for f in os.listdir('.') if f.endswith('.html') and f.startswith('20')]
    
    print(f"Processing {len(html_files)} HTML files...")
    print("=" * 60)
    
    total_images = 0
    total_updated = 0
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all image URLs
            image_urls = find_all_image_urls(content)
            
            if not image_urls:
                continue
            
            # Filter to only our domain images
            our_images = [url for url in image_urls if should_download(url)]
            
            if not our_images:
                continue
            
            print(f"\n{html_file}: {len(our_images)} images to download")
            
            # Download and update
            modified = False
            for url in our_images:
                local_path = download_image(url)
                
                if local_path != url:  # Successfully downloaded
                    # Update both img src and markdown image syntax
                    content = content.replace(f'src="{url}"', f'src="{local_path}"')
                    content = content.replace(f"src='{url}'", f"src='{local_path}'")
                    content = content.replace(f']({url})', f']({local_path})')
                    modified = True
                    total_updated += 1
            
            # Write updated HTML
            if modified:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
            
            total_images += len(our_images)
            
        except Exception as e:
            print(f"Error processing {html_file}: {e}")
    
    print("\n" + "=" * 60)
    print(f"✅ Processing complete!")
    print(f"  Total images found: {total_images}")
    print(f"  Successfully downloaded: {len(downloaded_images)}")
    print(f"  Links updated: {total_updated}")
    print(f"  Failed downloads: {len(failed_downloads)}")
    
    if failed_downloads:
        print("\n⚠️  Failed downloads:")
        for url, error in failed_downloads[:10]:
            print(f"  - {url}")
            print(f"    Error: {error}")
        if len(failed_downloads) > 10:
            print(f"  ... and {len(failed_downloads) - 10} more")

if __name__ == '__main__':
    print("=" * 60)
    print("Image Download & Link Update Script")
    print("=" * 60)
    print(f"Downloading images from: {', '.join(DOWNLOAD_DOMAINS)}")
    print(f"Saving to: {images_dir.absolute()}/")
    print()
    
    process_html_files()
    
    print("\n" + "=" * 60)
    print("✅ All done!")
    print("=" * 60)

