---
layout: post
title: "Unable to connect to the database:The MySQL adapter \"mysql\" is not available."
date: 2010-01-07 19:09:15
categories: ['Uncategorized']
tags: ['php', 'apache', 'mysql']
---

**Solution : **

Go to C:\program files\mysql\bin\

Copy this file libmysql .dll to C:\windows\system32\

**System**:

Windows XP

**Why it occurred:**

You originally installed a previous version of MySQL probably 4.+++ and then tried to install a new version MYSQL version 5++

**Symptoms**:

When you run your apache server you see this error in the error.log file of your Apache server

*PHP Warning:  PHP Startup: Unable to load dynamic library 'C:/Program Files/PHP/ext\\php_mysql.dll' - The specified module could not be found.\r\n in Unknown on line 0*

... and it happened  despite php_mysql.dll already being in place*
*