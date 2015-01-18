---
title: Deep Understanding Postgres
date: 2017-09-12 00:42:00 +05:30
tags:
- postgres
add_to_popular_list: true
excerpt: You will learn how postgres query planner execute query.
thumbnail_path: post_thumbnails/explain.jpg
layout: post
---

## Explain

When you run query, 
Postgres query planner plans how it will execute the query.
As per indexes, stats, it decides scan and join method and finally execute the query with selected methods.

*Explain commands* gives you the output of query planner approach.

TODO - put an example

TODO - How to read this

TODO - Write some example on stats.

-----

## Scan Types

### 1. Sequential scan

**Define**

Scan rows one by one.

TODO - Write Code

**When query planner will pick this method**

* If there is no index then by default query planner will do sequential scan.
* It's good when table is small - If table is very big and we haven't created index then sequential scan will take longer time. If table is small and no index still it will take smaller time as table is small.
* If we have index but as per stats query returning lots of rows then query planner will pick sequential scan, as random page reads always worse than CPU.

    TODO - write example

### 2. Index scan

**Define**

It scan index then it go to table and pick that row.

TODO - Write Code

**When query planner will pick this method**

* It’s good when less row getting returned by query. As random page reads increase at time of index scan. Lesser random page reads better than CPU.

* If we have index and as per stats query is returning less number of rows then query planner will use index scan.

    TODO - write example

### 3. Index only scan

**Define**

It only scan index will not look at table at all.

TODO - Write Code

**When query planner will pick this method**
* If you are selecting only that value then it will get used at there is no need to look at rows of table.

### 4. Bitmap scan.

**What is bitmap**

Lets say your query is "select * from table where row1 = 2;" then we will traves all index and find out if row1 is 2 or not. Put it 1/0 then all 1 are my answer.

TODO - define clearly

**Define**

It will scan bitmap index and find out rows and then get all rows at a time. will do bitmap heap scan for available rows It will recheck condition and filterout.

TODO - define clearly

**When query planner will pick this method**

* Generally if as per stats query returning avg number of rows then query planner pick this method.
* Difference between index scan vs bitmap index scan - Bitmap index scann - Scan all page available data in a shot so it has lesser random reads.

-----

## Join Types

### 1. Nested loop - Sequential Scan

**Define**

For each row - Pick one row and match from other table row.

TODO - Define clearly and Write code

**When query planner will pick this method**

* It’s good for smaller table.

TODO - Define clearly and Write examples


### 2. Nested Loop - Index Scan

**Define**

TODO - Define clearly and Write code

**When query planner will pick this method**

TODO - Define clearly and Write examples


### 3. Hash Join

**Define**

* Pick less row table. Hash all available value.
* Now traverse bigger table row. And as per hash it and get that join value.

TODO - Define clearly and Write code

**When query planner will pick this method**

* If one table contains less number of rows and another contains high number of rows.

TODO - recheck and write examples


### 4. Merge Join

**Define**

Sort both inner and outer table. Outer row will traverse till inner row has lesser value than outer.

TODO - Define clearly and Write code

**When query planner will pick this method**

* If big table then query planner endup with this method.

-----

## More Examples
TODO - Examples which covering all above cases.
Also provide configer overrider example.

-----


## Index Types

-----

## Understanding JsonB

-----


## Links
