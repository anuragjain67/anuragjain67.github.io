---
layout: post
title:  "Danger For loop"
date:   2015-01-18 12:29:13
---

## Trailer

*A Story of "Danger for loop".*

{% highlight python%}
def update_objects():
    interfaces = get_all_network_interface()
    for interface in interfaces:
        update_tag(interface, 'pro')

update_objects()
{% endhighlight %}

----
****

## Preface

**Time**: Early in the morning !

**Tech Lead**: ```Hey Anurag, there is an API Outage !``` (on phone)

Wait Wait, Before I start the story, Lemme tell you about myself, 

I am working on a project which does server monitoring. There are no developers working on this project who started it. It means, If you face any problem you have to become the *Sherlock Homes* until and unless Documentation helps.

----
****

## Find out the problem !

What is the problem ?

> API servers are going down in every x hours and AWS launching new server.

>> So, We don't know the exact reason why this is happening.

>>> Its time to change mask and become Sherlock Homes !

![ sherlock homes]({{ site.baseurl }}/img/sherlock_homes.jpg "Sherlock Homes")


**Lets check logs**

* AWS cloudwatch:  *lots of 500 errors*.
* API Server: *worker queue got increase*.
* nginx: Every api is giving slow response.

**Every api is giving slow response, hmm...**. 

From past three months everything was working fine and suddenly outage ?

* May be database problem ?
* May be redis memory problem ?
* Or someone hacked ? lets skip this :-D


**Database Problem**

	Checked the slow query log. Some queries are very slow.
	Also, CPU utilization is very high. Is this problem ?
	
	Sherlock: I don't think so, because its happening since last three months.

	Reliased, this is wrong track !


**Redis Problem**
	
	Everything seems fine in redis.

	Reliased, this is wrong track !


Ah, again Clue less, So we decided to **Switch on the RED SIGNAL (Less Traffic)**.

Now check logs again, have we missed anything ?

**Checked Nginx Log:**

{% highlight python%}
POST /api/users/ 192.0 0.2
POST /api/sites/ 201.0 0.1
POST /api/objects/ 1999.0 200.0
{% endhighlight %}

Have you noticed there are two type of response time:

* waiting time. (eg. 192.0)
* application execution time. (eg. 0.2)

It means, only some apis are slow, not all.

{% highlight python%}
POST /api/objects/ 1999.0 200.0
POST /api/other/ 122.0 120.0
POST /api/another/ 200.0 120.0
{% endhighlight %}

Need to Check, if there is any common code which is being used ? 

Ah found, only one code is being used. which is update_objects()


{% highlight python%}
def update_objects():
    interfaces = get_all_network_interface()
    for interface in interfaces:
        update_tag(interface, 'pro')

update_objects()
{% endhighlight %}


**Whats wrong here ?**

> Its updating tags for only network_interfaces.

> How many interfaces can be possible in one server ? 

>> 5/10 (maximum)

> Then it should not be the problem right ?

>> Yes, it should not be.

> Are you using docker?

>> Why are you asking this question, is it related? 
Oh you mean, when you run docker and then close it creates new interface ?

> Lets check for one site.

>> there are 60000 network interfaces.

>Oh, for loop for 60000 ? :-D
----

----
****


## Moral of Story:

* When you don't know the `n` max limit, Don't use for loop. Define the max limit and then use it.
* Don't use `network/database` calls in for loop.
* Always do batch processing for network/database calls.
