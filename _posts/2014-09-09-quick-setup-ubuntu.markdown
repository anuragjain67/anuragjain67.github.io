---
layout: post
title: Quick Setup Steps New Ubuntu Laptop
date: 2014-09-09 14:00:00
thumbnail_path: post_thumbnails/setup-folder-icon.png
add_to_popular_list: true
tags:
 - setup
 - installation
 - tech
 - ubuntu
excerpt: Installation steps for nodejs, build essential, eclipse, java etc.
---

### Necessary Packages:

{% highlight yaml %}
sudo apt-get install python-software-properties
sudo apt-get install build-essential python-dev libmysqlclient-dev
To install vlc etc. use software center
To install dropbox/skype go to their website.
sudo apt-get update
sudo apt-get install sni-qt:i386 [ If skype not showing on top right ]
chmod 600 /home/[username]/.ssh/* [ If you are getting Ssh private key error ] 
{% endhighlight %}

### To install nodejs & npm.

{% highlight yaml %}
sudo apt-get install nodejs nodejs-dev npm
sudo npm install -g less
{% endhighlight %}

### To install Mysql:

{% highlight yaml %}
sudo apt-get autoremove
sudo apt-get autoclean
sudo apt-get purge mysql-client-core-5.5
sudo apt-get install mysql-server
sudo apt-get install mysql-client
{% endhighlight %}

### To Install git and Setup:

**To setup git**

{% highlight yaml %}
sudo apt-get install git-core
git config --global user.name "Username"
git config --global user.email "emailId@email.com"
ssh-keygen -t rsa -C "emailId@email.com"
eval "$(ssh-agent -s)"ssh-add ~/.ssh/id_rsa
sudo apt-get install xclip
xclip -sel clip < ~/.ssh/id_rsa.pub [Add to github account] 
{% endhighlight %}

**To setup Meld**

{% highlight yaml %}
sudo apt-get install meld
git config --global merge.tool tkdiff
git config --global diff.tool tkdiff
git config --global --add difftool.prompt false
{% endhighlight %}


### Eclipse:

**To setup the Icon:**

* gedit ~/.local/share/applications/opt_eclipse.desktop
* Paste
{% highlight yaml %}
 [Desktop Entry]
 Type=Application
 Name=Eclipse
 Comment=Eclipse Integrated Development Environment
 Icon= <IconPath>
 Exec= <ExecPath>
 Terminal=false
 Categories=Development;IDE;Java;
 StartupWMClass=Eclipse
{% endhighlight %}

* nautilus ~/.local/share/applications
* chmod +x ~/.local/share/applications/opt_eclipse.desktop

>If you have meta data of old system for eclipse, then your life will be easier to setup eclipse.



### For java

{% highlight yaml %}
sudo add-apt-repository ppa:webupd8team/java
For Java7:  sudo apt-get install oracle-java7-installer
For Java8: sudo apt-get install oracle-java8-installer
sudo apt-get install maven
sudo update-alternatives --config java
{% endhighlight %}

### To setup Django Project [ If it uses Django Project Template]:

{% highlight python linenos %}
python bootstrap.py
bin/buildout
sudo npm install -g less [If required]
If you get error
/usr/bin/env: node: No such file or directory
sudo apt-get install nodejs
sudo update-alternatives --install /usr/bin/node nodejs /usr/bin/nodejs 100
bin/django migrate
{% endhighlight %}

### To install mongo:
{% highlight yaml %}
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
{% endhighlight %}

### Good links:
{% highlight yaml linenos %}
http://howtoubuntu.org/things-to-do-after-installing-ubuntu-14-04-trusty-tahr
{% endhighlight %}
