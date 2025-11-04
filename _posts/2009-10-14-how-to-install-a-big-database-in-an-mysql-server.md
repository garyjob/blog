---
layout: post
title: "How to install a big database in an MySQL server"
date: 2009-10-14 14:31:13
categories: ['Uncategorized']
tags: []
---

Normally when installing a small database on the mysql server, one does not meet much problems simply execute the script in any mysql client would do.

However when installing a big database it suddenly becomes a whole new story all together.

Pumping too much data or too long a query string to the database would result in the failure of the MySql client or the MySQL server to go away.

During such scenarios, one will necessarily have to write up one's own script. In most cases, it would be written in PHP.

A simple way to do it is as written below.

****