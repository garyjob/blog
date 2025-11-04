---
layout: post
title: "System - RokCandy causes erratic behaviour in Joomla "
date: 2010-03-11 15:36:10
categories: ['Uncategorized']
tags: []
---

For the past two  days Catherine from Fit-Physique.com has been telling me that the editor of Kunena was not working properly. I was seriously puzzled. How could  this be the case.

But apparently [b]something[/b] gets automatically translated to become **something** when it gets displayed. This really screws up the editor of Kunena.

As I was just looking for the source of the problem in a Joomla system with just Kunena and no RokCandy installed, I failed miserably for one hour. I could find no problems.

Finally giving up, I downloaded the entire Fit-Physique.com site to my local server for testing.

I realized [b]testing[/b] gets translated automatically in not just the Kunena Component but in the standard Content Component as well. Hence this is really a system wide issue.

This prod me to adopt a system wide problem isolation tactic. Thus I deactivated one **Joomla Component **at a time followed by the Plugins. When I finally reached Plugin **RokCandy**, I realised I found the source of the problem **System - RokCandy** automatically translates BBcodes like [b][/b] to html tags. While it maybe helpful. It is painful if you are unaware of its existant.

Thus one problem solved. Seriously, more and more as I do these stuff do I realize solving problems are easy. Identifying are the hardest!