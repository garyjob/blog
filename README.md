# Gary Teh's Blog

Personal blog covering startups, investing, machine learning, psychology, and life reflections.

## 📊 Current Stats

- **Total Posts:** 833+ posts
- **Time Span:** 2009 - 2025
- **Categories:** 65+ categories including Startups, Machine Learning, Deep Learning, Investing, Psychology, Technology, TrueSight DAO, Oracle Insights, and more

## 🏗️ System Architecture

This is a static HTML blog powered by:
- **Google Apps Script** - AI-powered blog editor interface (web app)
- **Grok AI** - Content generation and editing assistant
- **Python scripts** - Post-processing and site generation
- **Static HTML files** - Published blog posts and pages

## 📁 File Structure

```
garyteh_blog/
├── index.html                          # Landing page (recent posts + archive nav)
├── archive-YYYY.html                   # Year-based archive pages (auto-generated)
├── YYYY-MM-DD-post-title.html         # Individual blog post files
├── categories/                         # Category archive pages (auto-generated)
│   ├── category-name.html             # Category listing pages
│   └── ...
├── drafts/                            # Draft posts (markdown with frontmatter)
├── images/                            # Post images organized by date
├── google-apps-script/                # Google Apps Script web app
│   ├── Code.gs                        # Main script (blog editor backend)
│   └── Index.html                     # UI for blog editor (with voice input)
├── restructure_index.py               # Generates index.html and archive pages
├── generate_category_pages.py         # Generates category listing pages
├── update_index.py                    # Updates index.html for specific year
├── convert_drafts.py                  # Converts markdown drafts to HTML
└── fix_and_publish.py                 # Fixes encoding issues and publishes drafts
```

## 🚀 Blog Post Creation Workflow

### Primary Method: AI-Powered Web Editor

1. **Access the Editor**: The blog editor is a Google Apps Script web app that provides:
   - Conversational AI interface (powered by Grok)
   - Voice dictation for content input
   - Image upload support
   - Real-time content refinement
   - Automatic draft saving

2. **Creating a New Post**:
   - Open the Google Apps Script web app
   - Start a conversation to draft your post
   - Use voice dictation to input content (microphone button)
   - Upload images as needed
   - Refine content through conversation with AI
   - The AI will suggest categories based on content
   - When ready, publish the post

3. **What Happens on Publish**:
   - Draft is saved as markdown in `drafts/` folder with frontmatter
   - Post is converted to HTML with proper template
   - Categories are extracted and added as tags
   - File is named: `YYYY-MM-DD-post-slug.html`

### Post-Publication Steps

After publishing a new post, you **must** run these scripts to update the site:

```bash
# 1. Regenerate index.html and all archive pages
python3 restructure_index.py

# 2. Regenerate all category pages (to include new post)
python3 generate_category_pages.py

# 3. Add Google Analytics to new post (if not already present)
python3 add_google_analytics.py
```

**Important**: These scripts must be run after:
- Publishing a new post
- Adding new categories to a post
- Fixing category links in posts
- Any changes that affect post metadata
- Creating any new HTML files (the Google Analytics script will add tracking to new posts automatically)

## 📝 Scripts Documentation

### `restructure_index.py`

**Purpose**: Generates `index.html` and year-based archive pages (`archive-YYYY.html`)

**What it does**:
- Scans all HTML post files in the root directory
- Extracts metadata (title, date, categories) from each post
- Generates `index.html` with:
  - Recent posts (last 25)
  - "Browse Archives" navigation
  - Year-based archive links
- Generates individual archive pages for each year
- Ensures post counts are accurate

**Usage**:
```bash
python3 restructure_index.py
```

**Output**:
- Updates `index.html`
- Creates/updates `archive-YYYY.html` for each year with posts

### `generate_category_pages.py`

**Purpose**: Generates category listing pages in `categories/` directory

**What it does**:
- Scans all HTML post files
- Groups posts by category (extracted from category tags)
- Generates a page for each category showing all posts in that category
- Organizes posts by year within each category page
- Handles category name display and slug mapping

**Usage**:
```bash
python3 generate_category_pages.py
```

**Output**:
- Creates/updates all `categories/category-slug.html` files
- Each category page lists posts grouped by year

**Important**: Run this after:
- Publishing a new post with categories
- Adding categories to existing posts
- Creating new categories

### `update_index.py`

**Purpose**: Updates the index.html section for a specific year (currently hardcoded for 2025)

**What it does**:
- Finds all posts for a specific year (2025)
- Updates just the year section in index.html
- Faster than full restructure for small updates

**Usage**:
```bash
python3 update_index.py
```

**Note**: Less commonly used since `restructure_index.py` is more comprehensive.

### `convert_drafts.py`

**Purpose**: Converts markdown draft files to HTML blog posts

**What it does**:
- Reads markdown files from `drafts/` folder
- Parses frontmatter (title, date, categories)
- Converts markdown to HTML
- Applies post template
- Generates final HTML post file

**Usage**:
```bash
python3 convert_drafts.py
```

### `fix_and_publish.py`

**Purpose**: Fixes encoding issues in drafts and publishes them

**What it does**:
- Fixes common encoding issues in draft files
- Validates frontmatter
- Publishes drafts as HTML posts

**Usage**:
```bash
python3 fix_and_publish.py
```

### `add_auto_links_to_existing_posts.py`

**Purpose**: Adds automatic links to "TrueSight DAO" and "Agroverse" in existing blog posts

**What it does**:
- Scans all blog post HTML files
- Adds links to "TrueSight DAO" → [TrueSight.me](https://truesight.me)
- Adds links to "Agroverse" → [Agroverse.shop](https://agroverse.shop)
- Intelligently avoids linking text that's already inside HTML links or tags
- Only updates files that need changes

**Usage**:
```bash
python3 add_auto_links_to_existing_posts.py
```

**When to run**:
- Once to retroactively add links to posts published before automatic linking was implemented
- Future posts will have automatic linking built-in via the Google Apps Script editor

## 📋 Post File Format

Each blog post is an HTML file with this structure:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Meta tags, title, description -->
</head>
<body>
    <div class="container">
        <h1>Post Title</h1>
        <div class="post-meta">
            <span class="post-date">December 05, 2025</span>
            <a href="categories/technology.html" class="category-tag">Technology</a>
            <!-- More category tags -->
        </div>
        <div class="content">
            <!-- Post content in HTML -->
        </div>
    </div>
</body>
</html>
```

**Important metadata**:
- Title in `<h1>` tag
- Date in `<span class="post-date">`
- Categories as `<a href="categories/slug.html" class="category-tag">Category Name</a>`
- Date in filename: `YYYY-MM-DD-post-slug.html`

## 🏷️ Categories System

### How Categories Work

1. **In Post Files**: Categories are links in the format:
   ```html
   <a href="categories/category-slug.html" class="category-tag">Category Name</a>
   ```

2. **Category Slugs**: Generated from category names:
   - Spaces → hyphens
   - Lowercase
   - Special characters removed
   - Example: "TrueSight DAO" → `truesight-dao`

3. **Category Pages**: Auto-generated in `categories/` directory:
   - Filename: `category-slug.html`
   - Lists all posts in that category
   - Grouped by year
   - Links back to individual posts

### Adding Categories to a Post

1. Edit the HTML post file
2. Add category tags in the post-meta section:
   ```html
   <a href="categories/category-slug.html" class="category-tag">Category Name</a>
   ```
3. Run `generate_category_pages.py` to create/update category pages

### Creating New Categories

1. Add category tag to post(s)
2. Run `generate_category_pages.py`
3. Category page will be automatically created

## 🔧 Common Tasks & How to Handle Them

### Publishing a New Post

1. Create/edit post via Google Apps Script editor OR create HTML file manually
2. Ensure post has proper metadata (title, date, categories)
3. Save as `YYYY-MM-DD-post-slug.html` in root directory
4. Run scripts:
   ```bash
   python3 restructure_index.py
   python3 generate_category_pages.py
   ```

### Updating Post Categories

1. Edit the post HTML file
2. Update category tags in post-meta section
3. Run `generate_category_pages.py` to update category pages

### Fixing Duplicate Posts

If you see duplicate entries:
1. Check for duplicate files (e.g., `post.html` and `post-clean.html`)
2. Delete unnecessary duplicates
3. Run `restructure_index.py` to regenerate index

### Fixing Archive Counts

If archive counts are wrong:
1. Delete problematic archive pages
2. Run `restructure_index.py` to regenerate them

### Fixing Category Page Links

If category pages don't link back to posts:
1. Run `generate_category_pages.py` to regenerate all category pages

### Cleaning Up Draft Content in Published Posts

If AI conversation text appears in published posts:
1. Edit the HTML file
2. Remove any conversation/draft metadata (e.g., "Suggested Categories", "Notes from Gary's Voice")
3. Keep only the final published content
4. Ensure markdown links are converted to HTML `<a>` tags

### Fixing Escaped Characters in Titles

If titles show escaped quotes (e.g., `\&quot;`):
1. Edit the HTML file
2. Replace `\&quot;` with `"` in:
   - `<h1>` title
   - `<title>` meta tag
   - Open Graph meta tags
   - Twitter Card meta tags

## 🎨 UI Features (Google Apps Script Editor)

The blog editor (`google-apps-script/Index.html`) includes:

- **Voice Dictation**: 
  - Continuous mode (stays active until manually stopped)
  - Appends to existing text (doesn't overwrite)
  - Prevents duplicate words by tracking confirmed transcripts
- **Global Speech Speed**: Single dropdown in header for all text-to-speech
- **Image Upload**: Support for adding images to posts
- **Mobile Responsive**: Optimized for mobile and desktop
- **Conversation History**: Saves conversation state

## 🎯 UI/UX Design Decisions

- Prefer optimistic UI: show the published URL immediately on publish and avoid waiting on backend completion where possible for `garyteh_blog`.

## 📱 Important Notes

1. **Always Run Scripts After Changes**: After publishing or modifying posts, run the generation scripts to keep everything in sync.

2. **File Naming Convention**: Posts must follow `YYYY-MM-DD-slug.html` format for proper extraction.

3. **Category Links**: Category tags must link to `categories/slug.html` for the system to work.

4. **No Duplicates**: Ensure no duplicate post files exist (especially `-clean` versions).

5. **Archive Counts**: The "Browse Archives" section in index.html shows post counts per year - these are auto-generated and should match archive pages.

6. **Category Pages**: All category pages are auto-generated - don't edit them manually.

7. **Google Analytics**: All pages must include Google Analytics tracking. Run `add_google_analytics.py` after creating new posts to ensure tracking is added. The script automatically skips pages that already have it.

8. **Automatic Linking**: The blog automatically links mentions of "TrueSight DAO" to [TrueSight.me](https://truesight.me) and "Agroverse" (case-insensitive) to [Agroverse.shop](https://agroverse.shop). This happens automatically during HTML conversion in the Google Apps Script editor, so you don't need to manually add these links. The system intelligently avoids linking text that's already inside HTML links or code blocks.

   **For Existing Posts**: To add these links to posts published before this feature was implemented, run:
   ```bash
   python3 add_auto_links_to_existing_posts.py
   ```
   This will scan all blog posts and add the appropriate links where needed.

## 🔄 Typical Workflow Summary

1. **Create Post** → Use Google Apps Script editor
2. **Review Post** → Check HTML file for any issues
3. **Fix Issues** → Clean up any draft metadata or formatting
4. **Update Site** → Run `restructure_index.py` and `generate_category_pages.py`
5. **Add Analytics** → Run `add_google_analytics.py` to ensure tracking is on all pages (including new post)
6. **Update SEO** → Run `generate_sitemap.py` (and `add_seo_meta_tags.py` if needed)
7. **Verify** → Check index.html, archive pages, and category pages

## 🔍 SEO Optimization

The blog is fully optimized for search engines with:

### SEO Features Included

1. **Meta Tags**:
   - Open Graph tags for social media sharing (Facebook, LinkedIn, WhatsApp)
   - Twitter Card tags for Twitter sharing
   - Meta descriptions (auto-generated from post content)
   - Canonical URLs
   - Author meta tags

2. **Structured Data (JSON-LD)**:
   - BlogPosting schema on all posts
   - Includes: headline, description, author, datePublished, dateModified
   - Publisher information
   - Keywords from categories

3. **Sitemap**:
   - Auto-generated `sitemap.xml` with all pages
   - Includes blog posts, archive pages, and category pages
   - Proper priority and change frequency settings
   - Automatically updated when you run the generator

4. **robots.txt**:
   - Allows all search engine crawlers
   - Points to sitemap location
   - Blocks admin directories

### SEO Scripts

#### `generate_sitemap.py`

**Purpose**: Generates `sitemap.xml` for search engine discovery

**What it does**:
- Scans all HTML files (posts, archives, categories)
- Creates XML sitemap with proper priorities
- Sets change frequencies based on content type
- Includes last modified dates

**Usage**:
```bash
python3 generate_sitemap.py
```

**Output**: Creates/updates `sitemap.xml` in root directory

**When to run**:
- After publishing new posts
- After creating new category pages
- Periodically to update last modified dates

#### `add_seo_meta_tags.py`

**Purpose**: Adds comprehensive SEO meta tags to blog posts

**What it does**:
- Adds Open Graph meta tags
- Adds Twitter Card meta tags
- Adds canonical URLs
- Adds JSON-LD structured data
- Generates meta descriptions from content
- Only updates posts that are missing SEO tags

**Usage**:
```bash
python3 add_seo_meta_tags.py
```

**Output**: Updates all blog post HTML files with SEO tags

**When to run**:
- Once to add SEO tags to all existing posts
- After manually creating posts that might be missing tags

#### `fix_jsonld_formatting.py`

**Purpose**: Fixes JSON-LD structured data formatting in posts

**What it does**:
- Replaces HTML entities (`&quot;`, `&#x27;`) with proper JSON
- Ensures valid JSON syntax for structured data
- Only fixes posts with malformed JSON-LD

**Usage**:
```bash
python3 fix_jsonld_formatting.py
```

**Output**: Updates blog post HTML files with properly formatted JSON-LD

**When to run**:
- After running `add_seo_meta_tags.py` if JSON-LD has formatting issues
- To fix any posts with malformed structured data

#### `add_google_analytics.py`

**Purpose**: Adds Google Analytics (gtag.js) tracking code to all HTML pages

**What it does**:
- Adds Google Analytics tracking script to the `<head>` section of all HTML files
- Places the script right after the viewport meta tag for optimal tracking
- Skips files that already have Google Analytics installed

**Usage**:
```bash
python3 add_google_analytics.py
```

**Output**: Updates all HTML files (blog posts, index, archives, category pages) with Google Analytics tracking code

**When to run**:
- Once to add Google Analytics to all existing pages
- After creating new pages that might be missing the tracking code

### SEO Best Practices Already Implemented

✅ **Clean URLs**: Descriptive, date-based URLs (`YYYY-MM-DD-post-slug.html`)  
✅ **Semantic HTML**: Proper heading hierarchy (`<h1>`, `<h3>`)  
✅ **Internal Linking**: Category links, archive navigation  
✅ **Meta Descriptions**: Auto-generated from content  
✅ **Social Sharing**: Open Graph and Twitter Cards  
✅ **Structured Data**: JSON-LD for rich snippets  
✅ **Mobile Friendly**: Responsive design  
✅ **Fast Loading**: Static HTML files  

### SEO Maintenance

**After Publishing New Posts**:
```bash
# Update site structure
python3 restructure_index.py
python3 generate_category_pages.py

# Add Google Analytics to new posts
python3 add_google_analytics.py

# Update SEO
python3 generate_sitemap.py
```

The sitemap should be updated regularly to reflect new content and help search engines discover your latest posts.

## 📚 Additional Resources

- Google Apps Script runs the blog editor web app
- Posts are stored as static HTML files for fast loading
- Category and archive pages are auto-generated for easy navigation
- The system supports 800+ posts efficiently through static generation
- Fully SEO optimized with structured data, sitemaps, and meta tags

---

**Last Updated**: December 2025  
**Total Posts**: 833+  
**SEO**: Fully optimized with structured data, sitemaps, and meta tags  
© Gary Teh • 2009-2025
