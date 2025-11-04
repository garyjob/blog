---
layout: post
title: "Modified Joomfish menu bar with more user friendly submenus"
date: 2010-06-25 06:06:26
categories: ['Uncategorized']
tags: ['joomfish', 'css styling']
---

I was just looking through one of the sites that Qiqi wanted to replicate after for her new shopping cart and happen to chance upon their menu. It looks pretty user friendly the way they do their submenus. I have thus decided to do a joomfish replicate of what they did and have the source code included here.For my fellow web developers.... enjoy the codes!

Untitled Document

#menubar li div{
border:1px #000000 solid;
width:300px;
padding:10px;
height:200px;
}

#menubar li ul li{
display:none;
}

#menubar li:hover ul li{
display:block;
margin-top:10px;
margin-left:-50px;
}

#menubar li{
list-style:none;
float:left;
width:100px;
height:30px;
}

-  [top bar ]()

contents 

-  [top bar]()

contents 

-  [top bar]()

contents 

-  [top bar]()

contents