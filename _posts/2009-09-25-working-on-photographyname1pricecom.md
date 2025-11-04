---
layout: post
title: "Working on photography.name1price.com"
date: 2009-09-25 12:46:35
categories: ['Uncategorized']
tags: []
---

After talking with Peter the other apparently it seems I need a chunk of code which I could use to list out the sub categories in my [wordpress photography system ](http://photography.name1price.com)over at photography.name1price.com

I found this chunk of code over here

if (is_category()) {
  $this_category = get_category($cat);
  if (get_category_children($this_category->cat_ID) != "") {
    echo "# Subcategories
";
    echo "
";
    wp_list_categories('orderby=id&show_count=0&title_li=
&use_desc_for_title=1&child_of='.$this_category->cat_ID);
    echo "
";
  }
}

This is from [Yoast ](http://yoast.com/showing-subcategories-on-wordpress-category-pages/)

Let's see if it is what I am looking for.