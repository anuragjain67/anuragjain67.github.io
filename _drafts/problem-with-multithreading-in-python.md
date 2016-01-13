---
layout: post
title: Problem with multithreading in python ?
categories: []
tags:
- python-thread
- GIL
published: True
excerpt: "To understand this we first need to learn multithreading, multiprocessing, concurrency, parallelism etc."
---

## GOAL

What is the problem with multithreading in python ? 

To understand the issue, first you need to answer below questions?

1. What is Process ?
2. What is Thread ?
3. What is multithreading, multiprocessing, multitasking ?
4. What is multicore CPU ?
5. Concurrency vs Parallelism ?
6. What is Global Interpreter lock ? Why it is required ? What is the problem if it exists ?
7. What is thread safe ?
7. What is the problem with multithreading in python ? When should we use thread in python ?
8. Multiprocessing module in python ?
9. How to stop / kill a thread in python ? Why CTRL+c doesn't work ?

I believe after answering to all of them, we must reach to goal.

So, Lets answer !

>
* After Google searching I haven't found a single place where I can learn all of them together. This blog is just a collection of all websites, stackoverflow contents which I found on INTERNET.
* I wont go into full details of process, thread, core etc. for example explaining process control block (PCB).
* I am placing some story to build better understanding, story may not be real.

---------------------

### What is Process.

A process is a program in execution. 

Example: when you run a python program its a process.

```Single CPU can only run one process at a time.```

> Story: When computer was invented, they must have started with single process. It means, if person is working on calculator and want to work on Word Doc then he has to kill Calculator process first. (Obvious Reason: CPU can only run one process at a time.) To address the problem they must have invented context switching.

#### What is Context Switching ? 

Wiki Definition: In computing, a context switch is the process of storing and restoring the state (more specifically, the execution context) of a process or thread so that execution can be resumed from the same point at a later time. This enables multiple processes to share a single CPU and is an essential feature of a multitasking operating system.

So following thing happens when context got switch.

1. CPU pause a process.
2. Save all computation work.
3. Switch to another process.

> Story continue: Lets say, if word doc have two features, one editing and another printing doc. As till now only processes invented, to give that feature they must have written two processes. You need to open both editing program and printing program. As context switch exists you can open multiple program at a time. But you are still wasting good amount of time in waiting, because context switching takes time as it has to save all work to switch to another process. To address the problem they must have invented Threading.

### What is Thread ?

There are lot of definitions I have found over the INTERNET.

* A thread is a basic unit of CPU utilization, consisting of a program counter, a stack, and a set of registers, ( and a thread ID. )
* A thread is a light weight process. 
* Each thread belongs to exactly one process and no thread can exist outside a process. 
* Traditional ( heavyweight ) processes have a single thread of control - There is one program counter, and one sequence of instructions that can be carried out at any given time.
* As shown in Figure 1 multi-threaded applications have multiple threads within a single process, each having their own program counter, stack and set of registers, but sharing common code, data, and certain structures such as open files.

{% include figure.html path="posts/process_threads.jpg" caption="Figure 1 - Single Process Multithreading" %}

#### Why Thread ?

* Threads are very useful in modern programming whenever a process has multiple tasks to perform independently of the others.

	> For example in a word processor, a background thread may check spelling and grammar while a foreground thread processes user input ( keystrokes ), while yet a third thread loads images from the hard drive, and a fourth does periodic automatic backups of the file being edited.

* Threads provide a way to improve application performance through parallelism and/or concurrency.

#### Advantages

* Responsiveness - One thread may provide rapid response while other threads are blocked or slowed down doing intensive calculations.
* Resource sharing - By default threads share common code, data, and other resources, which allows multiple tasks to be performed simultaneously in a single address space.
* Economy - Creating and managing threads ( and context switches between them ) is much faster than performing the same tasks for processes.
* Scalability, i.e. Utilization of multiprocessor architectures - A single threaded process can only run on one CPU, no matter how many may be available, whereas the execution of a multi-threaded application may be split amongst available processors. ( Note that single threaded processes can still benefit from multi-processor architectures when there are multiple processes contending for the CPU, i.e. when the load average is above some certain threshold. )

#### Multithreading Model

* There are two types of thread: User Level Thread, Kernel Level Thread.
* User level thread: Application manages thread, i.e. creating/destroying thread, saving/restoring thread, scheduling thread, passing message/data to thread. Kernel is not aware of the existence of threads.
* Kernel level thread: Thread management done by Kernel i.e. maintain context information for a process or threads within process. Scheduling by Kernel is done on a thread basis. Kernel perform thread creation, scheduling and management in Kernel space.
* Advantages of User level thread:

	* User level thread can run on any operating system.
	* Thread switching does not require Kernel mode privileges.
	* Scheduling can be application specific in the user level thread.
	* User level threads are fast to create and manage.

* Disadvantages of User level thread:

	* When context switch happens it block process, as process is maintaining threads so threads also block.
	* Multithreaded application cannot take advantage of multiprocessing

* Advantages of Kernel level thread:
	* Kernel can simultaneously schedule multiple threads from the same process on multiple processes.
	* If one thread in a process is blocked, the Kernel can schedule another thread of the same process.
	* Kernel routines themselves can multithreaded.

* Disadvantages of Kernel level thread:

	* Kernel threads are generally slower to create and manage than the user threads.
	* Transfer of control from one thread to another within same process requires a mode switch to the Kernel.

In a specific implementation, the user threads must be mapped to kernel threads, using one of the following strategies.

#### Many-To-One Model

* In the many-to-one model, many user-level threads are all mapped onto a single kernel thread.
Thread management is handled by the thread library in user space, which is very efficient.
* However, if a blocking system call is made, then the entire process blocks, even if the other user threads would otherwise be able to continue.
* Because a single kernel thread can operate only on a single CPU, the many-to-one model does not allow individual processes to be split across multiple CPUs.
* Green threads for Solaris and GNU Portable Threads implement the many-to-one model in the past, but few systems continue to do so today.

{% include figure.html path="posts/threads_manytoone.jpg" caption="Figure 2 - Many to one" %}

#### One-To-One Model

* The one-to-one model creates a separate kernel thread to handle each user thread.
* One-to-one model overcomes the problems listed above involving blocking system calls and the splitting of processes across multiple CPUs.
* However the overhead of managing the one-to-one model is more significant, involving more overhead and slowing down the system.
* Most implementations of this model place a limit on how many threads can be created.
* Linux and Windows from 95 to XP implement the one-to-one model for threads.

{% include figure.html path="posts/threads_onetoone.jpg" caption="Figure 3 - One to one" %}

#### Many-To-Many Model

* The many-to-many model multiplexes any number of user threads onto an equal or smaller number of kernel threads, combining the best features of the one-to-one and many-to-one models.
* Users have no restrictions on the number of threads created.
* Blocking kernel system calls do not block the entire process.
* Processes can be split across multiple processors.
* Individual processes may be allocated variable numbers of kernel threads, depending on the 
number of CPUs present and other factors.

{% include figure.html path="posts/threads_manytomany.jpg" caption="Figure 4 - Many to many" %}

## References
1. [https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/4_Threads.html](https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/4_Threads.html)
2. [http://www.tutorialspoint.com/operating_system/os_multi_threading.htm](http://www.tutorialspoint.com/operating_system/os_multi_threading.htm)
