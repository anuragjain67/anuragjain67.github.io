---
layout: post
title: Problem with multithreading in python ?
categories: []
tags:
- python-thread
- GIL
- python
- thread
- os
published: True
excerpt: "To understand this we first need to learn multithreading, multiprocessing, concurrency, parallelism etc."
---

## GOAL

What is the problem with multithreading in python ? 

I believe after answering following points, we must reach to goal.

1. Concurrency VS Parallelism ?
2. What is Process ?

    * Process definition and Example ?
    * Context Switching ?
3. What is Thread ?

	* Thread definition
	* Why thread ?
	* Advantages.
	* Multithreading model.
	* What is thread safe ?
4. Multicore, Multitasking ?
5. Global Interpreter lock in python.

	* what is GIL ?
	* Why python uses GIL ?
	* What is the problem if it exists ?
	* Solutions to overcome the problem ?
6. Multithreading in python.

	* How to do ?
	* What is the problem with multithreading in python ?
	* When should we use thread in python ?
	* How to stop / kill a thread in python ? Why CTRL+c doesn't work ?
7. Multiprocessing in python.

So, Lets answer !

>
* After Google searching I haven't found a single place where I can learn all of them together. This blog is just a collection of contents which I found on INTERNET.
* I wont go into full details of process, thread, core etc. for example explaining process control block (PCB).
* I am placing some story to build better understanding, story may not be real.

---------------------

## Concurrency VS Parallelism

* Concurrency is when two or more tasks can start, run, and complete in overlapping time periods. It doesn't necessarily mean they'll ever both be running at the same instant. Eg. multitasking on a single-core machine.

* Parallelism is when tasks literally run at the same time, eg. on a multicore processor.

---------------------

## What is Process.

A process is a program in execution. 

Example: when you run a python program its a process.

```Single CPU can only run one process at a time.```

> Story: When computer was invented, they must have started with single process. It means, if person is working on calculator and want to work on Word Doc then he has to kill Calculator process first. (Obvious Reason: CPU can only run one process at a time.) To address the problem they must have invented context switching.

### What is Context Switching ? 

Wiki Definition: In computing, a context switch is the process of storing and restoring the state (more specifically, the execution context) of a process or thread so that execution can be resumed from the same point at a later time. This enables multiple processes to share a single CPU and is an essential feature of a multitasking operating system.

So following thing happens when context got switch.

1. CPU pause a process.
2. Save all computation work.
3. Switch to another process.

> Story continue: Lets say, if word doc have two features, one editing and another printing doc. As till now only processes invented, to give that feature they must have written two processes. You need to open both editing program and printing program. As context switch exists you can open multiple program at a time. But you are still wasting good amount of time in waiting, because context switching takes time as it has to save all work to switch to another process. To address the problem they must have invented Threading.

---------------------

## What is Thread ?

There are lot of definitions I have found over the INTERNET.

* A thread is a basic unit of CPU utilization, consisting of a program counter, a stack, and a set of registers, ( and a thread ID. )
* A thread is a light weight process. 
* Each thread belongs to exactly one process and no thread can exist outside a process. 
* Traditional ( heavyweight ) processes have a single thread of control - There is one program counter, and one sequence of instructions that can be carried out at any given time.
* As shown in Figure 1 multi-threaded applications have multiple threads within a single process, each having their own program counter, stack and set of registers, but sharing common code, data, and certain structures such as open files.

{% include figure.html path="posts/process_threads.jpg" caption="Figure 1 - Single Process Multithreading" %}

### Why Thread ?

* Threads are very useful in modern programming whenever a process has multiple tasks to perform independently of the others.

	> For example in a word processor, a background thread may check spelling and grammar while a foreground thread processes user input ( keystrokes ), while yet a third thread loads images from the hard drive, and a fourth does periodic automatic backups of the file being edited.

* Threads provide a way to improve application performance through parallelism and/or concurrency.

### Advantages

* Responsiveness - One thread may provide rapid response while other threads are blocked or slowed down doing intensive calculations.
* Resource sharing - By default threads share common code, data, and other resources, which allows multiple tasks to be performed simultaneously in a single address space.
* Economy - Creating and managing threads ( and context switches between them ) is much faster than performing the same tasks for processes.
* Scalability, i.e. Utilization of multiprocessor architectures - A single threaded process can only run on one CPU, no matter how many may be available, whereas the execution of a multi-threaded application may be split amongst available processors. ( Note that single threaded processes can still benefit from multi-processor architectures when there are multiple processes contending for the CPU, i.e. when the load average is above some certain threshold. )


### Multithreading Model

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

---------------------


## Multicore, Multitasking

### Multicore

* A multicore system is a single-processor CPU that contains two or more cores, with each core housing independent microprocessors.
* A multicore microprocessor performs multiprocessing in a single physical package.
* Multicore systems share computing resources that are often duplicated in multiprocessor systems, such as the L2 cache and front-side bus.
* Multicore systems provide performance that is similar to multiprocessor systems but often at a significantly lower cost because a motherboard with support for multiple processors, such as multiple processor sockets, is not required.

{% include figure.html path="posts/singlecore_concurrent.jpg" caption="Figure 5 - Concurrent Execution" %}
{% include figure.html path="posts/multicore_parallel.jpg" caption="Figure 6 - Parallel Execution" %}

### Multitasking

* In the case of a computer with a single CPU core, only one task runs at any point in time, meaning that the CPU is actively executing instructions for that task. Multitasking solves this problem by scheduling which task may run at any given time and when another waiting task gets a turn.
* When running on a multicore system, multitasking OSs can truly execute multiple tasks concurrently. The multiple computing engines work independently on different tasks.

---------------------

## Global Interpreter Lock

### What is GIL ?

Wiki Definition: Global interpreter lock (GIL) is a mechanism used in computer language interpreters to synchronize the execution of threads so that only one native thread can execute at a time.

### Why python uses GIL ?

In CPython, the global interpreter lock, or GIL, is a mutex that prevents multiple native threads from executing Python bytecodes at once. This lock is necessary mainly because CPython's memory management is not thread-safe.

**Benefits of the GIL**

* Increased speed of single-threaded programs.
* Easy integration of C libraries that usually are not thread-safe.
* It is faster in the single-threaded case.
* It is faster in the multi-threaded case for i/o bound programs.
* It is faster in the multi-threaded case for cpu-bound programs that do their compute-intensive work in C libraries.
* It makes C extensions easier to write: there will be no switch of Python threads except where you allow it to happen (i.e. between the Py_BEGIN_ALLOW_THREADS and Py_END_ALLOW_THREADS macros).
* It makes wrapping C libraries easier. You don't have to worry about thread-safety. If the library is not thread-safe, you simply keep the GIL locked while you call it.

### What is the problem if it exists ?

The GIL is controversial because it prevents multithreaded CPython programs from taking full advantage of multiprocessor systems in certain situations. Note that potentially blocking or long-running operations, such as I/O, image processing, and NumPy number crunching, happen outside the GIL. Therefore it is only in multithreaded programs that spend a lot of time inside the GIL, interpreting CPython bytecode, that the GIL becomes a bottleneck.

### Solutions to overcome the problem ?

* Applications written in programming languages with a GIL can be designed to use separate processes to achieve full parallelism, as each process has its own interpreter and in turn has its own GIL.

* The GIL can be released by C extensions. Python's standard library releases the GIL around each blocking i/o call. Thus the GIL has no consequence for performance of i/o bound servers. You can thus create networking servers in Python using processes (fork), threads or asynchronous i/o, and the GIL will not get in your way.

* There are several implementations of Python, for example, CPython, IronPython, RPython, etc.Some of them have a GIL, some don't. For example, CPython has the GIL.

* Numerical libraries in C or Fortran can similarly be called with the GIL released. While your C extension is waiting for an FFT to complete, the interpreter will be executing other Python threads. A GIL is thus easier and faster than fine-grained locking in this case as well. This constitutes the bulk of numerical work. The NumPy extension releases the GIL whenever possible.

* Threads are usually a bad way to write most server programs. If the load is low, forking is easier. If the load is high, asynchronous i/o and event-driven programming (e.g. using Python's Twisted framework) is better. The only excuse for using threads is the lack of os.fork on Windows.

* The GIL is a problem if, and only if, you are doing CPU-intensive work in pure Python. Here you can get cleaner design using processes and message-passing (e.g. mpi4py). There is also a 'processing' module in Python cheese shop, that gives processes the same interface as threads (i.e. replace threading.Thread with processing.Process).

* Threads can be used to maintain responsiveness of a GUI regardless of the GIL. If the GIL impairs your performance (cf. the discussion above), you can let your thread spawn a process and wait for it to finish.

---------------------

## References
1. [https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/4_Threads.html](https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/4_Threads.html)
2. [http://www.tutorialspoint.com/operating_system/os_multi_threading.htm](http://www.tutorialspoint.com/operating_system/os_multi_threading.htm)
3. [http://www.ni.com/white-paper/6424/en/](http://www.ni.com/white-paper/6424/en/)
4. [http://stackoverflow.com/a/1050257/2000121](http://stackoverflow.com/a/1050257/2000121)
5. [http://programmers.stackexchange.com/questions/186889/why-was-python-written-with-the-gil](http://programmers.stackexchange.com/questions/186889/why-was-python-written-with-the-gil)
