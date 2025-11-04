---
layout: post
title: "Restoring an MOSS site"
date: 2010-03-18 03:42:20
categories: ['Uncategorized']
tags: ['Software configurations', 'software configuration', 'sharepoint', 'MOSS']
---

Given an MOSS bak file which looks something like **blahblah.DAT**. You will need to do the  following to install it on your MOSS installation.

First you will need to go to your MOSS Central Administration Page and create a site collection. For example

**http://localhost/sites/test_site_collection**

of you could simply go to

**C:\program files\common files\microsoft\shared\web server  extensions\12\bin**

and type the following

**STSADM.EXE -o createsite  -url**  **-ownerlogin** domain\user **-owneremail **

Next you will need to navigate to the following location using command prompt

**C:\program files\common files\microsoft\shared\web server extensions\12\bin**

Once you are here type in the following command

**explorer .**

This command will open this location and you can copy your **blahblah.DAT **file here via copy and paste.

Next go back to your command prompt you can type in the following command

**stsadmin -o restore - url http://localhost/sites/test_site_collection -filename blahblah.DAT -overwrite**

Click enter when you are done.

To see the restored sitetype

**iexplore ****http://localhost/sites/test_site_collection **