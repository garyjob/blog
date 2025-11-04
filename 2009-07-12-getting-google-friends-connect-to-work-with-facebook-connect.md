---
layout: post
title: "Getting Google Friends Connect to Work with FaceBook Connect"
date: 2009-07-12 04:40:32
categories: ['Uncategorized']
tags: ['Add new tag', 'php', 'paths', 'google friends connect api', 'facebook connect api', 'integration']
---

It seeems getting [facebook connect to work with google friends connect ](http://www.google.com/support/forum/p/friendconnect/thread?tid=5ad9d086ad00a45c&hl=en)has been a issue on the minds of most developers and not many of them has came up with an idea solution for it.

After having attended the [google hackathon ](http://thingstodosingapore.com/see-things/Google-Hackathon-at-SMU)last month and witnessing how [patrick ](httphttp://wordpress.chanezon.com/?p=170)got it the two of them to work it got me experimenting with bringing facebook connect and google friends connect to work together for a while now. The site I am working on is [Thing To Do Singapore](http://thingstodosingapore.com/).

Last night I was finally successful at getting the two of them to work together in a somewhat weird kind of way.

Bascially Pages with GFC elements should not be introduced with FBML elements and vice a vice.  Such a way would cause it to clash. However since authentication for facebook results in a session storing on the server, one possible method for implementing the two on the same system could be via ajax.

On [Things to Do Singapore](http://thingstodosingapore.com/) the default log in is Google Friends Connect. On another page [http://thingstodosingapore.com/facebook/](http://thingstodosingapore.com/facebook/) user can log into their facebook accounts using facebook connect.

So once both of these are done, in the event the user generates some contents on the default page, 3 things will happen.

	- their facebook status will be updated
	- their google friend's connect activity will be updated
	-  the twitter main account [ThingsToDoSg ](http://twitter.com/thingstodosg)will be updated.

Additional events that might happen. Suppose the user declares that this entry has more details in a specific blog. The server will automatically do a ping back once the on the server with the blog entry.

In short I am attempting to position [Things To Do Singapore](http://thingstodosingapore.com/) as both and aggregator and a disseminator.