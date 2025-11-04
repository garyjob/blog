---
layout: post
title: "Learning how to use Ektron CMS"
date: 2010-03-26 09:13:08
categories: ['Uncategorized']
tags: ['web 2.0', 'Software configurations', 'asp.net', 'ektron', 'c#']
---

Browsing through the Ektron manuals as well as watching all the videos on YouTube does help alot with the picking up of Ektron CMS.

Today I finally created a template page and registered it as a template in the EKTRON CMS. I am currently using it as a sandbox within which I test all the user controls that come along with the Ektron CMS.

It applied a templated to my page called test by first including it as an option in my Content Folder which holds my content object

I then assigned the template to my content object.

Thereafter I went to the command prompt and inserted the command IISRESET. This forced the Ektron CMS to clear off its cache and create a new one. Thus my changes are updated nicely. 

Strangely, even though I haven't programmed in C# for quite a few years already I could understand up to 80% of the syntax used. The main part that I found to be tedious at tackling was its convention. There is the aspx file, the aspx.cs file (if you are using C#)

within the aspx file itself there seem to be a few lines at the top registering some assemblies the source of which I have no idea where from. 

As compared to typical open source technologies like PHP, this is mainly the downside of Proprietory technologies like ASP.net. PHP being open allows you to investigate through all the codes that were used in the implementation of a system. Try investigating the source of where a function came from in ASP.net and sooner or later you will hit a wall. The function was compiled and hidden within a DLL file of which location you have no idea where. Ouch!