---
layout: post
title: "Windows 2003 Server on VPC cannot connect to the internet"
date: 2010-02-18 06:03:28
categories: ['Uncategorized']
tags: ['Software configurations', 'VPC']
---

One of the major problems on using operating Systems on VPC is the hardware detection problem. I tried running my Windows 2003 server on VPC with Windows XP as the host.

I tried connecting to the internet with it but it does not work. I configured the VPC to use my Windows XP Host Ethernet Adapter but still not signals.

Realizing that the issue might be on the Virtual OS. I did an ipconfig to check the details. True enough what I saw was that the Virtual OS could not detect the Local DNS server.

To solve the problem I configured my virtual OS ethernet adapter manually. I did this by specifying the default gateway as well as the DNS address.

Eureka. It worked nicely.  I could now connect to the internet with my VPC.