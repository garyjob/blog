---
layout: post
title: "Back to doddling with ASP.net technologies"
date: 2010-03-21 17:50:43
categories: ['Uncategorized']
tags: []
---

Recently I started touching ASP.net all over again. This time it was due to the fact we might have some project where clients love Microsoft technology.

These are the potential places I have to watch for when setting up ASP.net systems on my IIS.

1. The permission and access of the Inetpub folder is very important. Make sure to add ASPNET user and give him full control to this folder

2. Login method allowed for your MSSQL server. MSSQL server allows administrators the ability to restrict log in types. Types available include Windows Integrated Authentication and SQL server authentication. Administrators could restrict it to either one of two types or allow both. Once done, types not allowed will have problems logging into the system

3. Always remember that Windows running the threads under different accounts, some accounts will have permission to access some locations or services while other don't.

All in all dealing with Windows technology has always been a complicated affair. If the budget is there, I dont mind dealing with it, if not... chuck it! haha. There are so many alternatives out there.