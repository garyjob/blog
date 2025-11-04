---
layout: post
title: "Migrating WordPress sites from One Hosting Service to another"
date: 2009-10-04 12:13:33
categories: ['Uncategorized']
tags: ['wordpress', 'PHP programming', 'migrating software']
---

Recently I have been building a lot of wordpress sites. Mostly I start building them on my local testing server. Thereafter when all the developement and testing has been done, I will migrate them to the live servers of clients.

here are the two normal things to look out for when doing migration of wordpress sites for them to work properly in a different server

First place to look at is the **wp-config.php **file

You need to change the following

define('DB_NAME', 'your_database_name');

/** MySQL database username */
define('DB_USER', 'your_user_login');

/** MySQL database password */
define('DB_PASSWORD', 'your_user_password');

/** MySQL hostname */
define('DB_HOST', 'localhost');

The localhost might be something depending on the configuration of the live server.

Next you need to do some changes in the **wp_options **table

Change entry **option_value **with corresponding **option_value **"**upload_path**" to the root path to your wordpress installation.

To find out the root path simply create a php file with the following syntax and dump in it to the root folder and run it.

****

Hopefully this is helpful**
**