---
title: Quick Setup Steps New Ubuntu Laptop
date: 2014-09-09 19:30:00 +05:30
tags:
- setup
- installation
- tech
- ubuntu
layout: post
thumbnail_path: post_thumbnails/setup-folder-icon.png
add_to_popular_list: true
excerpt: Installation steps for nodejs, build essential, eclipse, java etc.
---

### Necessary Packages:

```
sudo apt-get install python-software-properties
sudo apt-get install build-essential python-dev libmysqlclient-dev
To install vlc etc. use software center
To install dropbox/skype go to their website.
sudo apt-get update
sudo apt-get install sni-qt:i386 [ If skype not showing on top right ]
chmod 600 /home/[username]/.ssh/* [ If you are getting Ssh private key error ] 
```

### To install nodejs & npm.

```
sudo apt-get install nodejs nodejs-dev npm
sudo npm install -g less
```

### To install Mysql:

```
sudo apt-get autoremove
sudo apt-get autoclean
sudo apt-get purge mysql-client-core-5.5
sudo apt-get install mysql-server
sudo apt-get install mysql-client
```

### To Install git and Setup:

**To setup git**

```
sudo apt-get install git-core
git config --global user.name "Username"
git config --global user.email "emailId@email.com"
ssh-keygen -t rsa -C "emailId@email.com"
eval "$(ssh-agent -s)"ssh-add ~/.ssh/id_rsa
sudo apt-get install xclip
xclip -sel clip < ~/.ssh/id_rsa.pub [Add to github account] 
```

**To setup Meld**

```
sudo apt-get install meld
git config --global merge.tool tkdiff
git config --global diff.tool tkdiff
git config --global --add difftool.prompt false
```


### Eclipse:

**To setup the Icon:**

* gedit ~/.local/share/applications/opt_eclipse.desktop
* Paste
```
 [Desktop Entry]
 Type=Application
 Name=Eclipse
 Comment=Eclipse Integrated Development Environment
 Icon= <IconPath>
 Exec= <ExecPath>
 Terminal=false
 Categories=Development;IDE;Java;
 StartupWMClass=Eclipse
```

* nautilus ~/.local/share/applications
* chmod +x ~/.local/share/applications/opt_eclipse.desktop

>If you have meta data of old system for eclipse, then your life will be easier to setup eclipse.



### For java

```
sudo add-apt-repository ppa:webupd8team/java
For Java7:  sudo apt-get install oracle-java7-installer
For Java8: sudo apt-get install oracle-java8-installer
sudo apt-get install maven
sudo update-alternatives --config java
```

### To setup Django Project [ If it uses Django Project Template]:

```
python bootstrap.py
bin/buildout
sudo npm install -g less [If required]
If you get error
/usr/bin/env: node: No such file or directory
sudo apt-get install nodejs
sudo update-alternatives --install /usr/bin/node nodejs /usr/bin/nodejs 100
bin/django migrate
```

### To install mongo:
```
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
```

### Good links:
```
http://howtoubuntu.org/things-to-do-after-installing-ubuntu-14-04-trusty-tahr
```
