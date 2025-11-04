---
layout: post
title: "MSSQL 2008 server on VPC resource pool error"
date: 2010-03-22 06:59:46
categories: ['Uncategorized']
tags: []
---

I tried getting funky with the Ektron installation by attempting to install the database on a separate server.

I created a log in account on the** MSSQL 2008** **server **with all rights.

I configured the **component services **to allow remote access.

My ektron setup could detect and login to the remote **MSSQL 2008 server, **however when attempting to run the SQL scripts, the system threw and error

We ran out of resources on the MSSQL 2008 server. Checking the settings of the VPC I realised that I just gave it a 256mb ram. Not good!

Come to think of it no wonder this particular VPC was so slow in responding to my request.