---
layout: post
title: "Techniques for data migration across hosting servers"
date: 2010-12-28 14:48:26
categories: ['Uncategorized']
tags: []
---

Just these few days I had the opportunity to handle the migration of data for a few web sites. Some were running on the fat cow server. Others were running on the host hi server. All of them were to be ported over to the Vodien server.

The fatcow server has over the past few months proved to be a disappointment, while the hosthi server has all along been a disappointment. Often do I get complains from customers that there web servers are either not loading or their sub domains are showing errors. Come next year I will allow both the fatcow and hosthi accounts to expire. I guess the moral of the story is that if some service providers promise unlimited something, there must seriously be a limited something else somewhere.

While migration of files across servers are easy, the migration of databases and email accounts are somewhat more complicated.

**Large MySQL Database migration process**

There is an instance where I had to migrated a database that is 100mb in size. To do so via the standard database admin panel called the phpmyadmin would have took forever. Hence I wrote a php script that to fetch a file via a handle
$fp = fopen("databasedata.sql", "r+");

instead of reading in the whole file at one shot.
file_get_contents("databasedata.sql");

The latter method would have used up all the allocated resources in a normal php installation unless of course I went ahead and changed the configuration in my php.ini file. However this latter method is not at all a very elegant method to handle the task.

To further expound  on the prior method, I coded the script to parse the $fp  stream line by line and consolidate them into one big line everytime the latest line does not end with the string chunk  ";\r\n". In the event this chunk was detected, I will that this consolidated line and execute them to the database.
while (!feof($fp) && $counter
$query .="\r\n".trim(fgets($fp));
if(substr($query, -1) ==";"){
 //echo "query = ".$query;
 connect_query($query);
 $query = "";
 //$name = fgets(STDIN);
}
}
while (!feof($fp) && $counter execute_query($query);

 $query = "";

}

}

Lastly to free up unnecessary resources, I closed the stream $fp which I did not need to use anymore.

fclose($fp);

var_dump($myvar);
Thus the problem of database migration is solved easily with minimal throughput required on the web server. Of course, if I had configured my php installation, it is possible to run it from the command line.

**Email Account Migration from webmail to google mail server.**
This is another tricky situation I had to resolve. Apparently one of my clients used her webmail account rather extensively. In her webmail account she created various folders in which to store her emails. She wants all her mails migrated over to the new Google Mail server and at the same time have her email folder structure preserved.

What I did to fulfill this requirement was to create an imap stream to the server the original webmail account lies on to retrieve all the folders. Since I have not configurated her webmail to use any security ticket I added the line **novalidate-cert**. This line is very important and I noticed quite a lot of developers faced this problem when try to access their webmail via the use of PHP scripting.

set_time_limit (600000);
$mbox = imap_open("{imap.yourwebhosting.com:143/novalidate-cert}", "userid@somedomainname.com", "password");

$folders = imap_listmailbox($mbox, "{yourwebhosting.com:143}", "*");

For each respective folders that exist, I created an imap stream call to retrieve all her emails. For each respective email, I retrieved all the header information, subject and email content and reconstructed an email packet.

Next due to the fact that the google mail server has been configured to block all emails from sources with a domain name,  ip address mismatch, I had to create another email account (**Account B**) somewhere else so that I could send my mails to from my local web server. There after I configured the new google email account to retrieve those mails from **Account B.**

This in a nut shell is how I migrated both the database and the email accounts.