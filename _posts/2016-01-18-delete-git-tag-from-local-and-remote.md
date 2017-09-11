---
title: Delete git tag from local and remote
date: 2016-01-18 21:06:31 +05:30
tags:
- git
layout: post
thumbnail_path: post_thumbnails/howto.png
excerpt: git command to delete tag from local and remote
---

```
# This command will delete v1.0.1 from local
git tag -d v1.0.1
# This command will delete v1.0.1 from remote
git push origin :refs/tags/v1.0.1
```
