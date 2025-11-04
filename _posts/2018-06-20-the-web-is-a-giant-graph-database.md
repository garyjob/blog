---
layout: post
title: "The Web is a giant graph database."
date: 2018-06-20 06:20:24
categories: ['Uncategorized']
tags: []
---

![](https://cdn-images-1.medium.com/max/800/1*BOTGqwpA7mefNBi_muyAJQ.jpeg)
I was trying for the longest time to articulate the problem I was trying to solve when the most suitable analogy finally occurred to me when I was doing my evening meditation just this evening.

The web is a giant graph database where each web page is a node in the graph.

Just like any node within a graph database, it contains attributes. In this case, there are two types of attributes:

 	- values embedded within the DOM elements of the page
 	- values embedded within the URL of the page

Just like any relationships between nodes within a graph database, each node can be related to other nodes. In this case, the relationships can be expressed in two forms:

 	- explicit hyperlinks from other page to another
 	- attribute of a node who value matches the attribute that exist in another node

People intuitively know the existence of this giant graph database, but few actually see it clearly.

Some folks who “own” a huge number of these nodes try to prevent or make it hard for others to access the attributes embedded within the nodes they own. It is a good thing that governments around the world are starting to realize that some of these nodes don’t really belong to these folks but really belong to people of which the attributes within these nodes describe.

Other folks seeing the value of some of the attributes within some nodes try to gather these attributes through this activity called web scraping. The problem with their usual approach is there they don’t try to solve the problem at a fundamental level but instead resort to a cheap one-off kind of approach. The resultant solution is usually a tight coupling between schematic declaration and code. Imagine mixing HTML code with server side code. It becomes spaghetti code really fast. It is really hard to maintain and does not promote reusability.

From my point of view, it is not really their fault these folks generate spaghetti code. The heart of the problem is the missing [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start) that in normal circumstances should have come accompanied with the database which would have allowed developers the ability to query for data from this giant graph database without the need to concern himself with the underlying implementation details.

And that is the problem I am trying to solve. Defining the missing [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start) as well as building the corresponding ODBC engine that would interpret the query defined by the user.

The mission for [GetData.IO](https://getdata.io) thus is to build an ODBC layer so as to allow anybody to query for data from this giant graph database called the Web. We need to ensure they can easily do so be it via a simple [point and click interface](https://chrome.google.com/webstore/detail/getdataio/ofncgcgajhgnbkbmkdhbgkoopfbemhfj?hl=en) or just writing the [Semantic Query](https://getdata.io/docs/semantic-query-language/api) by hand.

They should not be forced to pay horrendous amount of money to web-scraping companies to run this query on their behalf. They should not be forced to consume in what ever form intermediaries see fit to present the data in. They should have the freedom to query data from this giant graph database in whatever way they deem fit.

We want to democratize access to this giant graph database of human knowledge.