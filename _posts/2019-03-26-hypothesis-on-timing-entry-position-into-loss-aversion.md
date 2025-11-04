---
layout: post
title: "Hypothesis on timing entry position into loss aversion"
date: 2019-03-26 02:47:49
categories: ['investing', 'psychology']
tags: []
---

This documentation is an extension on the strategy of [loss aversion and reversion to mean](https://garyteh.com/2018/04/trading-strategy-capitalizing-on-loss-aversion/). Its aim is to quantitatively identify the point in time when the effects of mass hysteria resultant from bad news has subsided.

For clearer reading of signals, entry should be done at end of day instead of beginning of day.
### Heuristics

 	- Only consider a purchase if there are funds available for deployment
 	- Only consider companies with my circle of competence.
 	- To mitigate intraday noise, only execute orders in the last hour of the trading day. Make sure spreads are narrow.
 	- Only consider entry if the expected value for mean reversion of the company's industry is above 0.1
 	- Only consider entry if the expected value for mean reversion of the company's industry is above 0.2
 	- Large dip is qualified if RSI was below 30
 	- Only enter when MACD histogram down trend receeds
 	- Enter at historical support level
 	- Exit at 5% capital gain
 	- Stop loss at 2% capital loss

### Successful attempts

Listed below are 3 successful entry attempts during early 2019 where a 5% capital gain were captured.

[caption id="attachment_3271" align="alignnone" width="1673"][![](https://garyteh.com/wp-content/uploads/2019/03/svmk_chart-2.jpg)](https://garyteh.com/wp-content/uploads/2019/03/svmk_chart-2.jpg) SVMK trade entry on 15th Feb 2019[/caption]

[caption id="attachment_3273" align="alignnone" width="1671"][![](https://garyteh.com/wp-content/uploads/2019/04/mdb_chart.jpg)](https://garyteh.com/wp-content/uploads/2019/04/mdb_chart.jpg) MDB trade entry on 17th Jan 2019[/caption]

[caption id="attachment_3276" align="alignnone" width="1674"][![](https://garyteh.com/wp-content/uploads/2019/04/tsla_chart.jpg)](https://garyteh.com/wp-content/uploads/2019/04/tsla_chart.jpg) TSLA trade entry 5th March 2019[/caption]

[caption id="attachment_3928" align="alignnone" width="1847"][![](https://garyteh.com/wp-content/uploads/2019/03/mdb-2.jpg)](https://garyteh.com/wp-content/uploads/2019/03/mdb-2.jpg) MDB entry on 30th Sep 2019[/caption]

The key characteristics of these entry were:

 	- Dip classification

 	>10% drop in share price
 	- Trading volume accompanying large dip should be at least **2.5X of 10 day moving average**
 	- In 3 month time frame, RSI of previous day was in the oversold range of 
 	- Entry

 	In the **30 day chart**, sales volume is less than **10 day moving average**

Proper timing of entry could result in a lower denominator to work on for the targeted 5% gain. This would result in overall lower holding period in positions.
### Failed attempt type 1: Entering too early

Depicted is an example of entering the position too early

[![](https://garyteh.com/wp-content/uploads/2019/03/wba_mistake.jpg)](https://garyteh.com/wp-content/uploads/2019/03/wba_mistake.jpg)

 	- Dip classification

 	>10% drop in share price
 	- RSI of previous day was in the oversold range of 
 	- Entry

 	In the** 30 day chart,** negative sales volume was still more than the **10 day moving average**

### Failed attempt type 2: Trading companies with too recent IPO

[![](https://garyteh.com/wp-content/uploads/2019/03/lyft-1.jpg)](https://garyteh.com/wp-content/uploads/2019/03/lyft-1.jpg)

 	- Dip classification

 	>10% drop in share price
 	- **No RSI** available
 	- In the** 30 day chart,** there was not enough data to plot the **10 day moving average**

To check if price recovery is due to covering of prior shorts
### Failed attempt type 3: Trading companies with a steady and consistent down trend and negative fundamental news

[![](https://garyteh.com/wp-content/uploads/2019/05/FE611CE2-727A-4EC7-8DFF-D3520694E639.png)](https://garyteh.com/wp-content/uploads/2019/05/FE611CE2-727A-4EC7-8DFF-D3520694E639.png)

 	- Dip classification

 	>10% gradual drop in share price
 	- Continuous downtrends observed during 6 months, 3 months or 1 month window.

### Failed attempt type 4: Trading companies with a steady and consistent down trend and negative macro news

[![](https://garyteh.com/wp-content/uploads/2019/03/mu_trade_wars.jpg)](https://garyteh.com/wp-content/uploads/2019/03/mu_trade_wars.jpg)

 	- Dip classification

 	>10% gradual drop in share price
 	- Continuous downtrends observed during 6 months, 3 months or 1 month window.

### Failed attempt type 5: Trading companies with a steady and consistent down trend and negative macro news

[![](https://garyteh.com/wp-content/uploads/2019/03/weibo.jpg)](https://garyteh.com/wp-content/uploads/2019/03/weibo.jpg)

 	- Dip classification

 	>10% sharpe drop in share price
 	- Continuous downtrends observed during 6 months, 3 months or 1 month window.

### Related references

 	- [Trading strategy capitalizing on loss aversion and reversion to mean](https://garyteh.com/2018/04/trading-strategy-capitalizing-on-loss-aversion/), Gary Teh
 	- [Swing trading for dummies](https://garyteh.com/2019/03/book-summary-swing-trading-for-dummies/)
 	- [Quantitative momentum](https://garyteh.com/2019/03/book-summary-quantitative-momentum/)
 	- [Short Interest checker](http://shortsqueeze.com/)
 	- [IEX api - useful for pulling intra-day data](https://iextrading.com/developer/docs/)
 	- *Swing trading for dummies*, Omar Bassal
 	- [Probability theory: expected value](https://en.wikipedia.org/wiki/Expected_value)