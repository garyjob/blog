---
layout: post
title: "Work around for JQuery easing for Internet Explorer"
date: 2009-10-09 09:38:08
categories: ['Uncategorized']
tags: ['social media']
---

Once again, I am using the easing funtion in the JQuery library to create some really cool animations this time for Genesis Motors.

I have been using this library for quite a while now for a few online projects.

Here are a list of some of them:

	- [ Rethink55](http://rethink55.com)
	- [ Heavyworld](http://heavyworld.com)
	- [ Winter In Venice](http://winterinvenice.co.uk)

The latest project Genesis Motors requires that content be allowed to slide in and slide off stage.

Sample code

$(document).ready(function(){

$("#side_bar_ID;  ?>").click(function(event){
//alert(curr_content);
menu_animation_active = true;

new_menu_slider_id = '#'+ID;  ?>+"_banner" ;
//alert($(curr_content));

$(curr_content).animate({left:'-1200px'},600,  function(){

$(curr_content).hide();

// Wait until the above has finished, then do the rest
//alert(new_menu_slider_id);
curr_content = new_menu_slider_id;
$(curr_content ).css("left","1200px");
$(curr_content ).show();
$(curr_content ).animate({left:'0'},{duration:500});

menu_animation_active = false;

});
});
})

Works fine with in firefox but not Internet Explore.

The problem is that when the current content slides out, even when the content is in the area it is not suppose to show, it still remains visible.

Trying hard to recall what I did the other time to solve the porblem  I finally remembered. The trick to work around this is to add the following styling to the container that is holding all the sliding contents as well.

overflow:hidden;
position:relative;

Once you have added these two styles to the container, the Internet Explorer will know that this container is on the same level as the sliding contents within hence will restrict the contents from floating on an unattached z-index above the main layer.