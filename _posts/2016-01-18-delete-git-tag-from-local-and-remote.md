---
layout: post
title: Delete git tag from local and remote
tags:
- git
- challenge-120
published: True
thumbnail_path: post_thumbnails/howto.png
excerpt: git command to delete tag from local and remote
date: 2016-01-18 15:36:31
---


{% highlight python %}
# This command will delete v1.0.1 from local
git tag -d v1.0.1
# This command will delete v1.0.1 from remote
git push origin :refs/tags/v1.0.1
{% endhighlight %}
