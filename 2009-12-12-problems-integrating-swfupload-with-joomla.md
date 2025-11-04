---
layout: post
title: "Problems integrating SWFupload with Joomla"
date: 2009-12-12 04:34:05
categories: ['Uncategorized']
tags: ['php', 'free open source systems', 'web 2.0', 'Software configurations', 'joomla 1.5', 'swfupload']
---

I am currently working on integrating the SWFUpload library with Joomla 1.5. All seems to be working well except till the portion whereby the file is uploaded.

I get the response by the system to do a login and this response is returned to me via **uploadSuccess(file, serverData) **method in the SWFupload **handlers.js **file. The session is not maintained apparently when I do the post.

I am currently referencing http://docs.joomla.org/Creating_a_file_uploader_in_your_component for possible resolutions to this bug.

Now I am heading off to work as the Dancing Christmas tree. Hopefully I would solve it when I get back in the evening.