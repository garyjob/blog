---
layout: post
title: "Making mod_rewrite work for Apache server on Windows XP"
date: 2010-02-05 17:25:28
categories: ['Uncategorized']
tags: ['free open source systems', 'web 2.0', 'Software configurations', 'apache web server']
---

Last year I set up an Apache 2.2 server on my computer to do some developement work using EzPublish in multiple virtual host environment. One day, I happened to raise a question to Steven on how to get it configured so that mod_rewrite works on my server and I could debug my script locally instead of always having to test it on some remote server. I got the response from him that it does not work in Windows environment. Due to the fact that this particular feature was not critical to the whole operation, I left it as that.

Two days ago out of curiosity, I downloaded this new PHP social networking software called ElGG . Apparently it uses mod_rewrite extensively and provides no other alternative methods to access its function. I was thus forced into a corner. Hence I did what I did. I went to google.com and started researching. Interestingly, I read that some actually got mod_rewrite working on Apache server running on Windows XP.

I spent the next two days researching on the Apache architecture. The result I got was this assuming you already have multiple virtual host setup:

	- uncomment **LoadModule rewrite_module modules/mod_rewrite.so **in your **httpd.conf **file
	- add the following lines to your **vhost.conf **files

* #Tells your Apache webserver to detect for the .htaccess file in your directory*
AllowOverride All

	- The below was copied lock stock and barrel from Joomla. Copy and paste it into a .htaccess file on your webserver and place it at the root location

##
# @version $Id: htaccess.txt 10492 2008-07-02 06:38:28Z ircmaxell $
# @package Joomla
# @copyright Copyright (C) 2005 - 2008 Open Source Matters. All rights reserved.
# @license http://www.gnu.org/copyleft/gpl.html GNU/GPL
# Joomla! is Free Software
##

#####################################################
#  READ THIS COMPLETELY IF YOU CHOOSE TO USE THIS FILE
#
# The line just below this section: 'Options +FollowSymLinks' may cause problems
# with some server configurations.  It is required for use of mod_rewrite, but may already
# be set by your server administrator in a way that dissallows changing it in
# your .htaccess file.  If using it causes your server to error out, comment it out (add # to
# beginning of line), reload your site in your browser and test your sef url's.  If they work,
# it has been set by your server administrator and you do not need it set here.
#
#####################################################

##  Can be commented out if causes errors, see notes above.
Options +FollowSymLinks

#
#  mod_rewrite in use

RewriteEngine On

########## Begin - Rewrite rules to block out some common exploits
## If you experience problems on your site block out the operations listed below
## This attempts to block the most common type of exploit `attempts` to Joomla!
#
# Block out any script trying to set a mosConfig value through the URL
RewriteCond %{QUERY_STRING} mosConfig_[a-zA-Z_]{1,21}(=|\%3D) [OR]
# Block out any script trying to base64_encode crap to send via URL
RewriteCond %{QUERY_STRING} base64_encode.*\(.*\) [OR]
# Block out any script that includes a  tag in URL
RewriteCond %{QUERY_STRING} (\|%3E) [NC,OR]
# Block out any script trying to set a PHP GLOBALS variable via URL
RewriteCond %{QUERY_STRING} GLOBALS(=|\[|\%[0-9A-Z]{0,2}) [OR]
# Block out any script trying to modify a _REQUEST variable via URL
RewriteCond %{QUERY_STRING} _REQUEST(=|\[|\%[0-9A-Z]{0,2})
# Send all blocked request to homepage with 403 Forbidden error!
RewriteRule ^(.*)$ index.php [F,L]
#
########## End - Rewrite rules to block out some common exploits

#  Uncomment following line if your webserver's URL
#  is not directly related to physical file paths.
#  Update Your Joomla! Directory (just / for root)

# RewriteBase /

########## Begin - Joomla! core SEF Section
#
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/index.php
RewriteCond %{REQUEST_URI} (/|\.php|\.html|\.htm|\.feed|\.pdf|\.raw|/[^.]*)$  [NC]
RewriteRule (.*) index.php
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization},L]
#
########## End - Joomla! core SEF Section

If you are still having problems after all these steps [contact me](http://name1price.com/index.php/contact-us.html). I will help set it up for your nicely. :)