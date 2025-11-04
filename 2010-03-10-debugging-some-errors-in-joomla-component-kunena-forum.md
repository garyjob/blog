---
layout: post
title: "Debugging some errors in Joomla Component Kunena Forum"
date: 2010-03-10 17:07:38
categories: ['Uncategorized']
tags: ['debugging Joomla']
---

I have a Joomla installation hosted on GoDaddy.org. I have recently installed the Forum Kunena to this Joomla Installation. All seems to be  working fine on my local server, however this is not the case with the server on GoDaddy.org

On the GoDaddy.org hosting server, my emoticon for the Kunena does not work. This is because some codes on my javascript got mysterious transformed to something else. To work around this I have modified the code.

Below is the modification at **line 98 **of  **components\lib\com_kunena.bbcode.js.php**
color = String(numberList[r]) + String(numberList[g]) + String(numberList[   bb ]);

for (bb = 0; bb ');
document.write('&nbsp;');
document.writeln('');
}

Also I have identified two bugs which cause the inbuilt avatar images not to show when choosen for use by users. The fixes are here

Replace code at **line 162 **of **components\com_kunena\template\default\plugin\myprofile\myprofile_avatar_upload.php **

$kunena_db->setQuery("UPDATE #__fb_users SET avatar='{$kunena_db->getEscaped($avatar)}' WHERE userid='{$kunena_my->id}'");
Replace code at **line 335 **of **components\com_kunena\template\default\plugin\myprofile\myprofile_avatar_upload.php **

$kunena_db->setQuery("UPDATE #__fb_users SET avatar='{$kunena_db->getEscaped($newAvatar)}' WHERE userid={$kunena_my->id}");

Hope this is helpful in fixing your Kunena Forum Joomla Component Bug. :)