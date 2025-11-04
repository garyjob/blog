---
layout: post
title: "Finally deploying my first Hello World Share point - Merry Christmas"
date: 2010-02-20 07:41:04
categories: ['Uncategorized']
tags: ['microsoft', 'sharepoint', 'asp.net']
---

It took me a 12 hours to setup a Windows 2003 VPC with sharepoint installed.

I was face with quite a few detours along the way.

One of the main issues I encoutered was the order in which I tried to install the pre-requisites.

Point to note : The  order in which you install the pre-requisites is VERY IMPORTANT.

This was the order I took that finally worked.

	- Install Windows 2003 Server
	- Install Windows 2003 Server Service Pack 2
	- Install Application Server with IIS, ASP.net, Email Server
	- Install ASP.NET framework Version 2.0
	- Install ASP.NET framework Version 3.5
	- Install Sharepoint

Please try out this order to avoid painfull time wasting detours

So with my sharepoint server finally up. I navigated to http://localhost:80/ using firefox

This translates into my computer at port 80.

I saw my sharepoint landing page.

Next, i thought to try my hands on deploying a ready made sharepoint webpart. To do this I went to [amrein.com](http://amrein.com/)

This site has tonns of web parts available for download. Being an idiot for holiday seasons, I downloaded the Merry Christmas web part and followed the instructions there.

Eureka. It worked nicely! Haha.

Next thing I should do it perhaps to write my own. :P