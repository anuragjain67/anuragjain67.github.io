---
layout: post
title:  "Django Learnings"
date:   2015-08-13 23:30:00
thumbnail_path: post_thumbnails/django.jpg
add_to_popular_list: true
tags:
 - django
 - timezone
 - tech
 - prefetch
excerpt: About timezone, prefetch related and some dos and don'ts.
---

### Timezone

* Always enable timezone.

{% highlight python %}
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
# If you are using MySQL,
# [see the Time zone](https://docs.djangoproject.com/en/1.8/ref/databases/#mysql-time-zone-definitions) definitions section of the MySQL notes for instructions on loading time zone definitions.
{% endhighlight %}


* How to get current utc time ?

{% highlight python %}
# Always use this way because its timezone aware.
>> from django.utils import timezone
>> timezone.now()
datetime.datetime(2015, 8, 13, 18, 39, 50, 423516, tzinfo=<UTC>)

# You can also do, but output wont be timezone aware, so avoid.
>> from datetime import datetime
>> datetime.utcnow()
datetime.datetime(2015, 8, 13, 18, 41, 21, 824650)
{% endhighlight %}

* How to get localtime ?

{% highlight python %}
# Always use this way because its timezone aware.
>> from django.utils import timezone
>> timezone.localtime(timezone.now())
datetime.datetime(2015, 8, 14, 0, 26, 28, 415929, tzinfo=<DstTzInfo 'Asia/Kolkata' IST+5:30:00 STD>)
{% endhighlight %}


* What does is_aware, is_naive, make_aware, make_naive do?

{% highlight python %}
>> from django.utils.timezone import is_aware, is_naive
>> is_aware(datetime.utcnow())
False
>> is_naive(datetime.utcnow())
True

# To make it aware,
# Note: make aware will just append the tzinfo.
# it wont care if datetime was given in utc | Asia/Kolkata
>> from django.utils.timezone import make_aware
>> make_aware(datetime.utcnow())
datetime.datetime(2015, 8, 13, 18, 46, 14, 559027, tzinfo=<DstTzInfo 'Asia/Kolkata' IST+5:30:00 STD>)

# To make it naive,
# Note: make naive will just remove the tzinfo.
# it wont care if datetime was given in utc | Asia/Kolkata
>> from django.utils.timezone import make_aware, make_naive
>> make_naive(make_aware(datetime.utcnow()))
datetime.datetime(2015, 8, 13, 18, 46, 14, 559027)

{% endhighlight %}

* More info [https://docs.djangoproject.com/en/1.8/topics/i18n/timezones/](https://docs.djangoproject.com/en/1.8/topics/i18n/timezones/)



### Prefetch Related
* Prefetch related wont work if you call .values_list() in for loop.

{% highlight python %}
# Case where Prefetch Related is working fine
destinations = Destination.objects.all().prefetch_related('devices')

for destination in destinations:
     for device in destination.devices.all():
         print device


# Queries Executed:
"""
SELECT 
"destination"."id", "destination"."title" 
FROM 
"destination"

SELECT 
("destinationdevicemapping"."destination_id") AS "_prefetch_related_val_destination_id",
"device"."id"
FROM 
"device"
INNER JOIN
"destinationdevicemapping" ON ("device"."id" = "destinationdevicemapping"."device_id")
WHERE
"destinationdevicemapping"."destination_id" IN (1, 2)
"""
{% endhighlight %}

{% highlight python %}
# Case where Prefetch Related is not working fine
destinations = Destination.objects.all().prefetch_related('devices')

for destination in destinations:
     for device in destination.devices.all().values_list('id'):
         print device

# Queries Executed:
"""
SELECT 
"destination"."id", "destination"."title" 
FROM 
"destination"

SELECT 
("destinationdevicemapping"."destination_id") AS "_prefetch_related_val_destination_id",
"device"."id"
FROM 
"device"
INNER JOIN
"destinationdevicemapping" ON ("device"."id" = "destinationdevicemapping"."device_id")
WHERE
"destinationdevicemapping"."destination_id" = 1

SELECT 
("destinationdevicemapping"."destination_id") AS "_prefetch_related_val_destination_id",
"device"."id"
FROM 
"device"
INNER JOIN
"destinationdevicemapping" ON ("device"."id" = "destinationdevicemapping"."device_id")
WHERE
"destinationdevicemapping"."destination_id" = 2
"""

{% endhighlight %}

### Also
* **Never** define settings in [lower case](https://docs.djangoproject.com/en/dev/topics/settings/#creating-your-own-settings).
* Always use django-debug-toolbar, it shows how many queries you are exceuting.

