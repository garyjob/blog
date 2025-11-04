---
layout: post
title: "Insights on managing Big Data from meet up with Dean and Ved"
date: 2019-04-05 22:20:40
categories: ['Machine Learning', 'Startups', 'Big Data', 'personal effectiveness', 'Venture Capital', 'Business models']
tags: []
---

### From Dean (Reputation.com)

 	- Enterprise sales as an acquisition strategy is feasible because revenue per account ranges in the USD millions - e.g. 70 million USD
 	- Once an auto company like Ford or GM signs up, they will start bringing their dealerships in
 	- The infrastructure needs to be able to support the size of the data which can be up to billions of rows
 	- Scaling of infrastructure to handle load ever increasing data becomes critical for the continued growth of the data company
 	- Data Product will appear broken when user attempts generate report while the data is still being written into the database
 	- The key challenge is that different solution is suitable for different operation
 	- Types of data operation include

 	writing into the database
 	- reading from the database
 	- map reduce to generate custom view for data in the database to support different types of reporting for different departments in the client companies.

 	- Successful data companies will create different layers of data management solutions to cater to the different data needs

 	MongoDB

 	good for storing relatively unstructured data
 	- querying is slow
 	- writing is slow
 	- good for performing map reduce

 	- Elastic Search

 	good for custom querying for data

 	- Dev ops become a very important role

 	migration of data between different systems can extend up to weeks before completion
 	- bad map-reduce query in codes while start causing bottlenecks in reading and writing causing the data product to fail
 	- dev ops familiar with infrastructure might on occasion have to flush out all queries to reset
 	- The key challenge is the inability to find bandwidth for flushing out bad queries within the codebase

 	- Mistakes in hindsight

 	In hindsight lumping all the data from different companies into the same index on MongoDB does not scale very well
 	- Might make better sense to create separate database clusters for different clients

 	- Day to day operations

 	Hired a very large 100 strong Web Scraping company in India to make sure web-scrapers for customer reviews are constantly up
 	- Clients occasionally will provide data which internal engineer (Austin) will need to look through before importing into relevant database

 	- Need to increase revenue volume to gear up for IPO
 	- The Catholic church has 10 times more money than Apple and owns a lot of health care companies.

### From Dan (Dharma.AI), the classmate of Ved

 	- Currently has 15 customers for their company
 	- Customers prefer using their solution versus open source software because they can scale the volume of data to be digested and solution comes with SLA
 	- Company provides web, mobile and table solutions which client companies' staff can use in the field to collect demographic and research data in developing countries
 	- The key challenge is balancing between building features for the platform and building features specific verticals:

 	Fields differ between industry: fields in the survey document for healthcare company will be very different for fields in the survey document for an auto company
 	- Fields differ between across company size: survey format for one company might be different as compared to another in the same industry but of different size
 	- Interface required is differs between companies

 	- Original CEO has been forced to leave the company, new CEO was hired by PE firm to increase revenue volume to gear up for IPO

### From Ved

 	- As number of layers increase in the hierarchy, it becomes increasingly challenging for management to keep up to date on the actual situation in the market
 	- New entrant of large establish competitor might sometime serve as an opportunity to ride the wave
 	- when Google decided to repackage Google Docs for Education, it was a perfect opportunity for Edmodo to more tightly integrate into Google and ride that trend rather than being left behind
 	- Failure to ride the wave will result in significant loss of market shares
 	- It takes a lot of discipline to decide on just focusing on the core use case and constantly double down on it.
 	- Knowing that a critical problem, which could potentially kill the company, exists versus successfully convincing everyone in the company that it is important to address it are two different things.