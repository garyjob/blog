---
layout: post
title: "Reflections on the decentralized multi-sided market place - GetData.IO"
date: 2018-06-18 07:27:25
categories: ['Machine Learning', 'Deep Learning', 'futurism', 'Startups', 'Big Data', 'investing']
tags: []
---

### The beginning

The concept of GetData.IO was first conceived back in November 2012. I was rewriting one of my side project (ThingsToDoSingapore.com) in NodeJS back then. Part of the rewrite required that I wrote up two separate crawlers each for a different site which I was getting data for.

Very soon after I was done with the initial rewrite, I was once again compelled to write a third crawler when I wanted to buy some stocks on the Singapore stock exchange. I realized while the data for the shares were available on the site, they were not presented in a way that facilitated my decision making process. In addition to that, the other part of the data I needed were presented on a separate site and unsurprisingly not in the way I needed.

I was on my way to write my fourth crawler when it occurred to me, if I structured my code by cleanly decoupling the declaration from underlying implementation details, it is possible to achieve a high level of code re-use.

Two weekends of tinkering and frenzied coding later, I was able to complete the first draft of the [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start) and the engine that would interpret this query language. I was in love. Using just simple JSON, it allowed anybody the ability to declare the desired data from any parts of web. This includes data scattered across multiple pages on the same site or data scattered across multiple domains which could be joined using unique keywords.
### The Journey

Five years have past since, during this time, I brought this project through an incubator in Singapore with my ex-co-founder, tore out and rewritten major parts of the code-base that did not scale well, banged my head countless times on the wall  in frustration due to problems with the code and with product market fit, watched a bunch of well-funded entrants came and went. To be honest, quite a few times I threw in the towel. Always, the love for this idea would call out to me and draw me back to it. I picked up the towel and continued ploughing.

It’s now June 2018. Though it has taken quite a while, I am now here in the Bay Area, the most suitable home for this project given to the density of technological startups in this region. My green card was finally approved last month. I have accumulated enough runway to allow my full attention on this project for the next 10 years. Its time to look forward.
### The vision

The vision of this project is a multi-sided market place enabled by a Turing complete [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start). The [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start) will be interpreted and executed upon by a fully decentralized data harvesting platform that will the capacity to gather data from more than 50% of the world’s websites on a daily basis.

Members can choose to participate in this data sharing community by playing one or more of the 4 roles:

 	- Members who need data
 	- Members who maintain the data declarations
 	- Members’ who will run instances of the [Semantic Query Language](https://getdata.io/docs/semantic-query-language/quick-start) interpreter on their servers to mine for data
 	- Member’s who sell their own proprietary data

From this vantage point, given its highly decentralized nature, it feels appropriate to deploy the use of block chains. The final part that needs to be sorted out prior to the deployment of blockchain to operate in full decentralized mode is figure out the “proof of work”.

[Operations available](https://modern-sql.com/feature/listagg) in other database technologies will get ported over where appropriate as and when we encounter relevant use cases surfaced by our community members.
### Why now and how is it important?

More as I dwell in this space, I see very clearly why it is only going to become increasingly important to have this piece of infrastructure in place. There are namely 3 reasons for this.
#### Leveling the playing field

The next phase of our computing will rely very heavily on machine learning. It is a very data intensive activity. Given that established data siren's like Facebook, Google, Amazon and Microsoft have over the past years aggregated huge tons of data, this have given them a huge unfair advantage which might not necessarily be good for the eco-system. We need to level the playing field by making it possible for other startups to gain easy access to training data for their machine learning work.
#### Concerns about data ownership

GDPR is a cumulation of concerns of data ownership that has been building for the past 10 years. People will increasing want to establish ownership and control over their own data, independent of the data siren's use to house them. This means a decentralized infrastructure which people can trust to manage their own data.
#### Increasing world-wide need for computing talents

Demand for engineering talent will only continue to increase as the pervasiveness of computing in our lives increase. The supply of engineering talents does not seem like it will be catching up and short fall is projected to continue widening till 2050. A good signal is the increasingly high premium paid to engineering talents in the form of salaries over the recent years. It's just plain stupidity as a civilization to [devote major portions of this precious engineering resource](https://www.google.com/search?q=freelancer+webscraping&oq=freelancer+webscraping&aqs=chrome..69i57j0l3.4670j0j4&sourceid=chrome&ie=UTF-8) to the writing and rewriting of web crawlers for the same data sources over and over again. Their time should be freed up to do more important things.
#### The first inning

Based on historical observation, I believe we are on the cusp of the very first inning in this space. A good comparison to draw upon is the early days of online music streaming.

Napster versus the music publishers is similar to how the lay of the land was back 5 years ago when Craigslist was able to successfully sue 3Tap.

Last year, LinkedIn lost the law suit against folks who were scraping public data. This is a very momentous inflection point in this space. Even the government is starting to the conclusion that public data is essentially public and Data Siren’s like any of the big Tech should have no monopoly over data that essentially belongs to the users who generated them.

Drawing further upon on the music industry analogy, the future of this space should look like how Spotify and ITunes operate in the modern day online music scene
### What about recumbents?

...
### Further readings

 	- [How to launch an ICO ](https://medium.com/swlh/how-to-launch-an-initial-coin-offering-7fa000ba3f59)
 	- [Modern SQL](https://modern-sql.com/)
 	- [GetData.IO](https://getdata.io)