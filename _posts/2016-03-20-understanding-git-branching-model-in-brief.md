---
layout: post
title: Understanding git branching model in brief.
tags:
 - git
published: True
add_to_popular_list: true
excerpt: This blog is just having brief notes of my understanding from various sources
thumbnail_path: post_thumbnails/gitlogo.jpg
date: 2016-03-20 17:55:22
---

#### Disclaimer

This blog is just having brief notes of my understanding from various sources like:

a) [Git successful branching model](http://nvie.com/posts/a-successful-git-branching-model/])

b) [Django git process](https://docs.djangoproject.com/en/1.8/internals/contributing/writing-code/working-with-git/).

c) [http://stackoverflow.com/a/804156/2000121](http://stackoverflow.com/a/804156/2000121)

d) [http://blog.ona.io/general/2016/02/02/squashing-with-git-interactive-rebase.html](http://blog.ona.io/general/2016/02/02/squashing-with-git-interactive-rebase.html)

Please read from above sources if you are looking for detailed explanation.

---

#### Things to remember

a) Master branch should always be ready to deploy.

b) Any development will go in develop branch which is created from master branch.

c) Always give pull request and take at least two thumbs up for your code from your colleague.

---

**When I say**

a) `task branch`, it means task_{task_number} branch.

b) `release branch`, it means upcoming release branch release_{version_number}.

c) `hotfix branch`, it means hotfix_{version_number + fix_number} branch.

---

I am assuming **You follow Agile Process**. So lets just start the sprint.

All developer should create tasks branch from develop branch

{% highlight python %}
git checkout develop
git pull origin develop
git checkout -b task_{task_number}
{% endhighlight %}

Once task completed give pull request, do changes after code review.

Rebase work with develop. The reason for this is that by rebasing, your commits will always be on top of the upstream’s work, not mixed in with the changes in the upstream. This way your branch will contain only commits related to its task, which makes squashing easier. As well as there will be no merge conflicts so it will be easier to merge.
{% highlight python %}
git fetch develop
git rebase develop.
{% endhighlight %}

Squash your changes to meaningful commits.
{% highlight python %}
git rebase -i HEAD~{number_of_commits} 
# This command will open interactive console
# Where you just need to write pick
# or squash just before commit id.
{% endhighlight %}

Push your changes with force and merge the pull request. 
{% highlight python %}
git push origin task_{task_number} -f
# Force because you want to rewrite history
# of changes to remote as well.
{% endhighlight %}

Once sprint is over create release branch from develop and deploy release branch to staging server. QA will test it out and report bugs. Fix them and merge back to release branch. If the fix requires in develop branch immediately then just merge changes in develop branch.

Lets just assume in between **some immediate fix** requires in production in between. Then Create a hotfix branch from master.

a) After code review merge the branch in master branch and deploy.

b) If release branch exists then merge the branch in release. If developer needs the fix immediately then merge it in develop branch as well.

c) If release branch doesn't exists then merge the branch in develop.

After QA of release branch, We need to merge release branch in master and develop branch. Always add tag when you are merging release branch in the master.
{% highlight python %}
git tag -a 'v1.1.1'
git push --tags.
{% endhighlight %}

---

**Other Notes**

a. If you don't want to care about history of branches then use simple git merge else use git merge --no-ff. The --no-ff flag causes the merge to always create a new commit object, even if the merge could be performed with a fast-forward. This avoids losing information about the historical existence of a feature branch and groups together all commits that together added the feature.

b. Rebasing feature help us to track work in better manner.

c. You should squash your commits in meaningful commits. So that it helps in reverting.
