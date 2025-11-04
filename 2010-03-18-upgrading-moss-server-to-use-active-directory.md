---
layout: post
title: "Upgrading MOSS server to use Active Directory"
date: 2010-03-18 03:11:26
categories: ['Uncategorized']
tags: ['Software configurations', 'software configuration', 'sharepoint', 'MOSS']
---

I recently upgraded one of my Virtual PC windows 2003 servers to use Active Directory. The very first thing that happened after the upgrading was done was that I encountered tons of errors. Apparently the Active Directory installation process by windows did not automatically update the logon details to services. Hence as a result MOSS which relies on quite a lot of these services to funciton properly was pretty crippled. The first thing I did was to open the service dialogue box and change the logon details for the following services

	- **Windows Sharepoint services administration**
	- **Windows SharePoint Services Search**
	- **Windows SharePoint Services Timer**
	- **Windows SharePoint Services Tracing**
	- **Windows SharePoint Services VSS Writer**
	- **SQL Server 2005 Embedded Edition (Microsoft##SSEE)**
	- **SQL Server VSS Writer**

Apparently MOSS uses an embedded SQL server to store all its configuration as well as Web instances

Next I had to do some configuration at the following location

**Start > Administration Tools > Component Services > Double Click to Open**

**Console Root > Component Services > My Computer > Right Click to Open Dialogue Box > Open Properties**

Navigate to Tab > **MSDTC **and then click on the **Security Configuration **button

Basically in that view click on all checkboxs and then indicate **No Authentication Required**

Once you click  ok the **MSDTC service **will restart itself.

With that done, there is only one last thing to do.

Go To Location **C:\Windows\ **right click on the **Temp** folder, click properties and then navigate to the **Security **Tab

Even thought I have added Administrator and ASP.Net as the users with full control of this folder it seems it is still causing problems with some MOSS services, so I have instead given full control to Authenticated Users as well.

Please note while all these configurations ensure that your sharepoint services gets up and running, it is not all together secured because of the lax security rules. If you really need help please hire a MOSS professional