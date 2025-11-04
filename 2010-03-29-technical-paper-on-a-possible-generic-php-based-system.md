---
layout: post
title: "Technical paper on a possible generic PHP based system"
date: 2010-03-29 18:07:03
categories: ['Uncategorized']
tags: ['Uncertainty', 'free open source systems', 'paths', 'Software configurations']
---

This article is for personal reference. Its creation became necessary while pondering on a certain subject, I realized my brains (as with all brains being limited to a maximum of 7+2 variables simultaneously) could not handle all the required variables at once and was therefore unable to see clearly a coherent big picture of the envisioned idea.

Hopefully in creating this technical paper could it be made visible to me any possible design flaws when I examine each part in detail.

The goal is to create a system/framework that does the following

1. Accept many user created xml documents each describing different reptitive tasks that happens in a company in XML. 
2. A XML document will contain:
2.1 All fields that exist and their data type 
2.2 All stages that exist and their order
2.3 Fields and Stages mapping, access permission to fields available in each stage
2.4 Each stage will provide views of the object defined in the XML document 
3. Instantiates an object that holds all that is in the corresponding XML document declared as properties 
4. Assign system users as personel in charge of each xml defined stage as this is not captured in the XMl document to keep XML document system independent
5. Serialize this object and store it as a record in the **template database table**.
6. When **Template Manager Object **is triggered, it retrieves this template object from the **template database table ** and replicates a working instance which will be then stored in the **object database table**
7. Has a work manager object which handles the manipulation of data stored within working instance objects.
8. Has a work manager object which handles the synchronization of serialized records in the **object database table** and the instantiated deserialized records in the system SESSION. 
9. Ideally the **work manager object** will have built in features that will handle concurrency issues.
10. Data types defined in the XML document as part of object property will automatically instantiate existing native classes already included in the System
11. Data types will extend a parent data type which will provide methods which child data types will have to declare. Possible methods envisioned includes
11.1 Display
11.2 Edit
11.3 Store

**Potential advantages of what I have envisioned thus far.**
1. Database table structure will be independent of the object structure 
2. Database structure will effectively be just reduced to two tables irregardless of the variety of object structure. 
2.1 template table
2.1.1 field : id -> primary key
2.1.2 field : data -> serialized object
2.2 object table
2.2.1 field : id -> primary key
2.2.2 field : data -> serialized object

3. Framework remains sufficient abstract and can be easily ported from system to system

**Potential down side of what I have envisioned thus far.**
1. All objects instance in the object table will be loaded into SESSION during each call. This might impose a high load  on the database server during the initial loading.
2. It might be difficult to sort or do a search amongst a collection of the same objects as compared to sorting available in traditional SQL search queries.
3. Synchronization issues might arise.
4. Possible out of memory error as more object instance comes into existance.

My next step from here will be to research into design patterns to examine the possible patterns that I could apply on this framework to address issues 2 & 3.

I will also need to look  into the PHP documentation to understand the factors that will cause issues 1 & 4