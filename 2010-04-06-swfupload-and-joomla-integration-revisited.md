---
layout: post
title: "SWFupload and Joomla integration revisited"
date: 2010-04-06 09:46:51
categories: ['Uncategorized']
tags: ['free open source systems', 'web 2.0', 'Software configurations', 'joomla 1.5', 'swfupload']
---

After trying 1 hour and getting no where integrating SWFupload fully into the Joomla Administration backend. I finally called it quits. 

The problem is that while the SWFupload component shows up nicely in the front end any call by the component to the scripting backend always results in a login request page. This is despite attempting to follow official instructions on the [Joomla Documentation Site](http://docs.joomla.org/Creating_a_file_uploader_in_your_component).

Finally I created a fileuploader.php file that does not have foreign access restricted by the Joomla CMS permissions. 

To prevent crackers from exploiting this file as a possible entry point to crack any Joomla systems installed with my soon to be launched Joomla 1.5 component, I have limited file upload type to just XML types only. Now it works fine.