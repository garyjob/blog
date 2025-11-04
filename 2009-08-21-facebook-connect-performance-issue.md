---
layout: post
title: "Facebook connect performance issue"
date: 2009-08-21 14:23:00
categories: ['Uncategorized']
tags: ['black swan', 'social media', 'buggy', 'programming', 'social networking']
---

Last night I was sitting with Satheesh and Jim working on [SingaporeRental.com](http://singaporerental.com). We happened to talked about [ThingsToDoSingapore.com](http://thingstodosingapore.com) during our conversation in my living room.

Satheesh said that the  site was experiencing very very slow loading time. I knew that the site was slow in loading since before I stopped touching it in terms of coding. I have been getting rather busy with my own IT projects recently.

Today finally finding some time for myself I decided to do some tweaking to my favorite pet project. The coding was familiar. I have yet to port it to any content management system. I actually have two systems in mind which I could do the porting to. One is WordPress the other is Joomla.

Given the choice between the two I rather like Wordpress better. First off, it is lighter more agile and has this well established PingBack System which could be easily used for generating more Traffic on the world wide  web.

Once again on that hosthi server I experienced very slow loading  time. Nothing knowing which was really causing this problem I decided to do some split testing. I suspected that it could either be the server running low of bandwidht or that google friends connect was unstable again. So I pointed ThingsToDoSingapore.com to my local testing web server and ran the scripts.

Much to my surprise, the stage when I was experiencing the bottle neck was at ak.connect.facebook.com. So apparently it was the part where [Things To Do Singapore ](http://thingstodosingapore.com)gathers content from the facebook server that things start to really slow down.

From my experience, Facebook has been experiencing very bad performance issues the past few weeks. If you went to the site and tried to login, half the time the images do not load properly. Suspecting that it would only affect facebook.com, I was wrongly, apparently it does affect other sites which uses facebook connect as well.

Searching on the web for the possible reason, I identified the denial of [service attack on facebook ](http://www.cantonrep.com/business/x1701870632/Hackers-attack-Twitter-slow-down-Facebook)as a possible  contributing factor. It is crazy actually that things nowadays are so interconnected that when a hub goes down the spooks get affected too.

I believe somewhere along the way, with all the interconnectedness as well as cloud computing,  it will really be easy to bring down the whole world wide web with a touch of the button. Another possible [black swan](http://freakonomics.blogs.nytimes.com/2007/05/21/straight-from-the-black-swans-mouth/) is in the making

**More References on the Black Swan**

[http://samdavidson.blogspot.com/2009/01/black-swan.html](http://samdavidson.blogspot.com/2009/01/black-swan.html)

[http://en.wikipedia.org/wiki/Black_swan_theory](http://en.wikipedia.org/wiki/Black_swan_theory)