---
layout: post
title: "Apache data streaming project - NIFI & MINIFI"
date: 2017-05-11 03:39:09
categories: ['Big Data']
tags: ['big data', 'apache project', 'data streaming', 'etl']
---

### [![](http://garyteh.com/wp-content/uploads/2017/05/IMG_5525.jpg)](http://garyteh.com/wp-content/uploads/2017/05/IMG_5525.jpg)

### Technology

 	- Apache Nifi - comes with a webserver
 	- Apache Minifi - very lightweight solution

### Usage

 	- Tail CDC database transaction logs and pipes it to the rest of the Apache NIFI cluster
 	- listens to port and takes data into stream
 	- transform data by pulling out attribute into meta key
 	- can write to specificAWS S3 folder object
 	- can run Ruby, Python n Java within each Node

### Hardware Requirements

 	- minimum AWS T2.small instance type
 	- needs to have enough disk space to support the largest possible size of each batch of data

### Insight

Data scientist does not want to waste time writing to and from Kafka