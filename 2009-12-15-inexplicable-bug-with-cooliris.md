---
layout: post
title: "inexplicable bug with cooliris"
date: 2009-12-15 17:03:03
categories: ['Uncategorized']
tags: ['web 2.0', 'cool iris']
---

Recently I did an extension for [ThingsToDoSingapore.com](http://thingstodosingapore.com) by getting it to display images on Cooliris.

All is going well on Firefox until I attempted to do the following on Internet Explorer

A php script basically redirects the browser to this location

http://www.cooliris.com/tab/#cs=11&url=http%3A%2F%2Fthingstodosingapore.com%2Fcooliris.rss&guid=288f5cc75ef1fbabd4e8bc27a3de59ab.jpg

Where one particular image is zoomed in on.

Apparently when cooliris loads up this URL gets redirected automatically to

http://www.cooliris.com/tab/#cs=11&url=http%3A%2F%2Fthingstodosingapore.com%2Fcooliris.rss instead.

This is a most puzzling scenario. I will over the next few days go about understanding this issue to see if there might be a possible solution to it.