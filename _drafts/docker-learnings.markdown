---
title: Docker Learnings
date: 2017-09-12 00:55:00 +05:30
tags:
- docker
add_to_popular_list: true
excerpt: Whatever I have learnt about docker.
thumbnail_path: post_thumbnails/Docker.png
layout: post
---

**What is Docker**

**Docker Components**

* Docker Engine

* Docker Daemon

* Docker Machine

* Docker Compose

* Docker Swarm

**Problems without docker**

**How to apply it for development**

## Dockerfile

### **RUN VS CMD**

[https://stackoverflow.com/a/37462208/2000121](https://stackoverflow.com/a/37462208/2000121)

[RUN](https://docs.docker.com/engine/reference/builder/#run) is an image build step, the state of the container after a `RUN` command will be committed to the docker image. A Dockerfile can have many `RUN` steps that layer on top of one another to build the image.

[CMD](https://docs.docker.com/engine/reference/builder/#cmd) is the command the container executes by default when you launch the built image. A Dockerfile can only have one `CMD`. The `CMD` can be overridden when starting a container with `docker run $image $other_command`.

[ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint) is also closely related to `CMD` and can modify the way a container starts the image.

Explain Docker linking, networking, depends

Docker Volume

Docker Port