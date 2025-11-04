---
layout: post
title: "Milestones and more milestones"
date: 2010-12-07 07:08:32
categories: ['Uncategorized']
tags: []
---

From the statistics shown in Google Analytics, the changes made to the web application [thingstodosingapore.com](thingstodosingapore.com) over the past few weeks has thus far had a positive impact on on the length and depth of incoming visits.

	- Average length of stay has increase a 100%, from a pathetic 53 sec beginning of last month to 2 mins and 30 secs
	- bounced rate has  dropped to an average of 6% from the previous 12% beginning of last month

The results could be attributed to the following changes:

	- Migration of web hosting server to Singapore where up to 70% of the visits are coming from, a choice resultant from analysis of data available in Google Analytics, Alexa.com as well as valuable inputs from end users.
	- Ajax auto count of items in each category when visitor scrolls to a new section of the map resulting in preempt of information users could browse through. (A feature adapted from YouTube.com)
	- In the event whereby a visitor arrives in a page other than the main page, the starting category will be set to the one this content belongs to. The pheriperal markers will also be from the currently selected category. This results in increased relevancy in contents presented (A feature adapted from Google.com).
	- The migration from in map content presentation to the use of the Thickbox library. Users can now browse through the current content with more ease and less irritation. This is a choice resultant from the series of usability analysis I conducted.
	- Auto population of Event contents from Facebook.co. This is a feature inspired by Facebook's newly launched Graph API and the existing Google Map API. The process is made more comprehensive by an ever growing internal dataset of locations specific to Singapore. After months of experience dealing with the Google Map API, I have concluded that while the Google Map Geocoding feature is pretty extensive, it has problems detected locations in the event whereby the location is referred in the local jargon.

Over the past few days, I have had the great opportunity to correspond with a few corporate event organizers and in the process receive some feedbacks. One of the features, resultant of my correspondences, will be the visitor analytics which event organizers will find useful.

Another set of features related to the first set will be the viral feature which I will hope to implement over the next two weeks, it will be somewhat inspired by one of the [prototypes we have had the opportunity to build in Silicon Valley during the Techcrunch Hackathon](http://socialsample.com). This second set of feature will be designed to increase foot track to events by organizers happening in Singapore, increase visibility of such events to the general public as well as aid in the process of customer retention.

Considering the fact that Singapore is in the midst of positioning itself as business hub where multiple international conventions will take place, the infrastructure for the online social media support for events is thus far minimal, if not non-existant. This might in fact be a niche that is uncompetited for and in demand.

Not only does [ThingsToDoSingapore.com](http://thingstodosingapore.com) concentrate on providing valuable information to people interested in attending events happening in Singapore, it also complements these events with information on related facilities at nearby premises.

Another thread of work to be done is the android application. I have had the opportunity to bring the HTC desire I recently acquired out for a test run and have identified some issues of concern which I will have to that into consideration when building the Android Application that will allows users to gain access to relevant information on ThingsToDoSingapore.com while on the road. Thus far these are the issues identified:

	- Content Synchronization vs Bandwidth Lag
	- Content Synchronization vs Android SqlLite memory size
	- Content Synchronization vs Battery Life
	- Content Presentation vs Screen Size
	- Content Presentation vs Relevance to User Experience

The options available for the Android Application are as follows:

	- Map
	- Listing View
	- Grid View

While the above issues are important, there is a more fundamental underlying area which begs for my attention. I will need to identify the use cases that will be relevant towards the Android Application User experience when exploring Singapore on foot. This presents a difficulty for me at the moment as I have yet gathered a comprehensive set of data, enough at least to determine which features are critical to a Singapore explorer and which are not. The option available for my pursuit at the moment is that I do trial runs using other peoples application to determine the painful spots not covered as yet. However even, the resultant set might be biaised as it due to my personal experiences as Ricky once said. Hopefully this biased could be resolved via the feedbacks gathered from my test users (guinea pigs) after the initial prototype is developed.

The path ahead is still long. There is much to be accomplished.