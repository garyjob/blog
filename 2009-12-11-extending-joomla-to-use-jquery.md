---
layout: post
title: "Extending Joomla to use Jquery"
date: 2009-12-11 17:31:21
categories: ['Uncategorized']
tags: ['free open source systems', 'web 2.0', 'social media', 'Software configurations', 'joomla 1.5']
---

Recently there seems to be a lot of libraries that are being created using Jquery.

Joomla has been traditionally used with the  mootools library. Instead of using this library, I have opted to instead use the Jquery library.

I created a component for myself and  loaded the jQuery library into one of the sub folders of this Joomla component. I further instructed Joomla to load the javascript file.

Keeping my fingers crossed I wrote this syntex in the template file

jQuery(document).ready(function(){alert('hello world')});

And Eureka!! It worked. Now I will go on further extending Joomla to create a very user friendly component for my clients which have been facing lots of problems with the counter-intuitive Joomla Administration interface.