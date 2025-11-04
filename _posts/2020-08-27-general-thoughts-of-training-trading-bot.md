---
layout: post
title: "General thoughts of training trading bot"
date: 2020-08-27 16:28:59
categories: ['Machine Learning', 'investing']
tags: []
---

- regime change occurs on the average every 3 months and the model gets outdated.
 	- early signs of outdated model includes consistent non-commit signals
 	- initial changes to trading parameters will tend to yield poor initial outcomes.
 	- Good outcomes will require time to play itself out
 	- Buying on the MACD bullish reversal tends to be too late in a volatile market. Potential gains from the reversal would have most likely played out by then
 	- Drastically reducing number of outstanding positions leads to inefficiency of capital deploy as capital is left idling around with a bullish trend plays itself out
 	- Explore buying when negative MACD trend slows down.