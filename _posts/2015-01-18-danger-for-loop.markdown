---
title: A Story of Danger forloop
date: 2015-01-18 17:59:13 +05:30
tags:
- tech
layout: post
add_to_popular_list: true
thumbnail_path: post_thumbnails/sherlock_homes.jpg
excerpt: how dangerous it can be ...
---

## Trailer

<script src="https://gist.github.com/anuragjain67/83a6abbcea34752590f179d4111f7dc9.js"></script>

----

## Preface

**Time**: Early in the morning !

**Where**: On phone !

**Tech Lead**: ```Hey Anurag, there is an API Outage !```

**Wait wait..., Before I start the story, Lemme tell you about myself**

I am working on a project which does server monitoring. There are **no developers** working on this project **who started it**.

It means, If you face any problem then, you have to become the *Sherlock Homes* until and unless documentation helps.

----

## Find out the problem !

> Hey, What is the problem ?

>> API servers are going down in every x hours and AWS launching new server.

> Do we know the exact reason why this is happening ?

>> No !

> Hmm, It means, Its time to change mask and become Sherlock Homes !
{% include figure.html path="posts/sherlock_homes.jpg" caption="Sherlock Homes" url=page.external_url %}


**Check logs**

* AWS cloudwatch:  *Lots of 500 errors.*
* API Server: *Worker queue got increase.*
* Nginx: *Every api is giving slow response.*

**Hey, Every api is giving slow response [#clue]**. 

From past three months everything was working fine and suddenly outage ?

* May be database problem ?
* May be redis memory problem ?
* Or someone hacked ? lets skip this :-D


**Check Database Problem**

	Checked the slow query log. Some queries are very slow.
	Also, CPU utilization is very high. Is this problem ?
	
	Sherlock: I don't think so, because its happening since last three months.


**Check Redis Problem**
	
	Everything seems fine in redis.


> Ah, again **#NoClue**, First **Switch on the RED SIGNAL (Less Traffic)**.

> Now check logs again, have we missed anything ?

**Checked Nginx Log:**

```
POST /api/users/ 192.0 0.2
POST /api/sites/ 201.0 0.1
POST /api/objects/ 1999.0 200.0
```

> Have you noticed there are two type of response time:

* waiting time. (eg. 192.0)
* application execution time. (eg. 0.2)

It means

* Waiting time for all api are large.
* and only for some api Execution time are large.

```
POST /api/objects/ 1999.0 200.0
POST /api/other/ 122.0 120.0
POST /api/another/ 200.0 120.0
```

> Need to Check, if there is any common code which is being used ? 

>> Ah found, only one code is being used. which is update_objects()

<script src="https://gist.github.com/anuragjain67/83a6abbcea34752590f179d4111f7dc9.js"></script>

> Whats wrong here ?

>> Nothing wrong. Its updating tags for only network_interfaces of one server. 


> Wait, How many interfaces can be possible in one server ? 

>> 5 to 10


> Then it should not be the problem right ?

>> Yes, it should not be.


> Are you using docker?

>> Why are you asking this question, is it related? 
Oh you mean, when you run docker it creates new interface ?


> Lets prove this theory for one server (Anurag's Vostro).

>> OMG ! There are 60000 network interfaces for the server. And this server is using Docker :-D


>Oops, 60000 network calls in for loop  ? :-D
----

----

## Moral of Story:

* Never use for loop, When you don't know the `n's max limit`. 
* Always define the max limit in the for loop.
* Never use `network/database` calls in for loop.
* Always do batch processing for network/database calls.

