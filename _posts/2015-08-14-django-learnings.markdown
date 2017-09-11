---
title: Django Learnings
date: 2015-08-14 05:00:00 +05:30
tags:
- django
- timezone
- tech
- prefetch
layout: post
thumbnail_path: post_thumbnails/django.jpg
add_to_popular_list: true
excerpt: About timezone, prefetch related and some dos and don'ts.
---

### Timezone

#### Always enable timezone.

```
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
```

If you are using MySQL, [see the Time zone](https://docs.djangoproject.com/en/1.8/ref/databases/#mysql-time-zone-definitions) definitions section of the MySQL notes for instructions on loading time zone definitions.


#### How to get current utc time ?

Always use this way because its timezone aware.

<script src="https://gist.github.com/anuragjain67/46cbded3123502adc9f3de2676f77360.js"></script>


#### How to get localtime ?

<script src="https://gist.github.com/anuragjain67/ef9cff827ca46245a4f43d1963b5cfa2.js"></script>

#### What does is_aware, is_naive, make_aware, make_naive do?

<script src="https://gist.github.com/anuragjain67/bf42bcbc3f7893fc616699b73b5e2fde.js"></script>

More info [https://docs.djangoproject.com/en/1.8/topics/i18n/timezones/](https://docs.djangoproject.com/en/1.8/topics/i18n/timezones/)


### Prefetch Related


#### Prefetch related wont work if you call .values_list() in for loop.


Case where Prefetch Related is working fine

<script src="https://gist.github.com/anuragjain67/c54c5e3682e27952e7613e000c36c101.js"></script>


Case where Prefetch Related is not working fine

<script src="https://gist.github.com/anuragjain67/6a360eb42ad19227333b9fd9d2046eb2.js"></script>

### Other
* **Never** define settings in [lower case](https://docs.djangoproject.com/en/dev/topics/settings/#creating-your-own-settings).
* Always use django-debug-toolbar, it shows how many queries you are exceuting.

