---
layout: post
title: "Improving the performance of Ajax on ThingsToDoSingapore.com"
date: 2010-01-01 06:50:09
categories: ['Uncategorized']
tags: ['Uncertainty', 'free open source systems', 'paths', 'web 2.0', 'Software configurations']
---

Recently I started working on [Things To Do Singapore ](http://thingstodosingapore.com)again.

Apparently the javascript libraries were getting quite thick and this was affecting the loading of the interface.

There is the use of the following :

	- Xajax Library
	- Jquery Library
	- Google friends Connect Api
	- Facebook Connect Api
	- SWFUpload Library

After much observation I realised the SWFUpload Library sometimes takes too long to load and fails as well causing the whole interface to fail loading at time seriously affecting usability of the site. Perhaps this might be to cause of the high bounce rate I observer from my Google Analytics of 80%.

I spent this morning thinking how to go about solving this problem and this was the method I came to

Javascript library should be classify into two groups as critical and non-critical to user experience.

The Xajax Library, jQuery library are considered critical to user experience

The Google Friends Connect library as well as the Facebook Connect library are not often employed. though these two library are too tightly integrated with the core achitecture. Perhaps it was a bad design choice.

SWFUpload is not often used by other users and hence rarely employed.

Having done the proper classification, I next work  on loading the SWFUpload asynchronously after the other library and interface has loaded. This in face drastically reduced improved useer experience. It reduced user waiting time as well as at the same time reduced the error rate of the loading interface.

This was how I did it.

jQuery(document).ready(function() {

loadScript("http://thingstodosingapore.com/swfupload/swfupload.js");
loadScript("http://thingstodosingapore.com/swfupload/swfupload.queue.js");
loadScript("http://thingstodosingapore.com/swfupload/fileprogress.js");
loadScript("http://thingstodosingapore.com/swfupload/handlers.js");
//alert("swf loaded");
});

function loadScript(sScriptSrc) {
var oHead = document.getElementById('head');
var oScript = document.createElement('script');
oScript.type = 'text/javascript';
oScript.src = sScriptSrc;
oHead.appendChild(oScript);
}