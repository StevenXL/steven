---
author: Steven Leiva
createdAt: 1630327964
tags: [Haskell]
teaser: Another unification exercise
title: The type of (fmap . fmap)
updatedAt: 1630327964
---

In this post, we will be unifying the types in the expression `fmap . fmap`.

The reason for this exercise is that we want to show that our **informal** algorithm for works _so far_.

In a subsequent post, we will be using the results of this exercise to show where our informal algorithm falls short, and extend it to fix this shortcoming.

## Informal Algorithm

As a reminder, our informal algorithm for type unification goes something like this:

1. Rearrange the expression to make it obvious to spot the function applications
2. Gather the types of the **function application** - remember, we only deal with **one application** at a time
3. Ensure that the **type variable names are unique** between function and argument - renaming if necessary
4. Line up the types to figure out the equalities between type variables
5. Erase the argument from the function, replacing type variables and adding in constraints

## The type of `fmap . fmap`

Let's see how well this algorithm works on the expression `fmap . fmap`.

### Step #1 - Rearrange Expression

We will re-arrange the expression to make the application of functions to arguments obvious. In our case `fmap . fmap` is equivalent to `(.) fmap fmap`.

### Step #2 - Gather types of the application

Now that we can clearly spot the two arguments to `(.)`, let's gather the types:

```text 
(.) :: (b -> c) -> (a -> b) -> a -> c

fmap :: Functor f => (a -> b) -> f a -> f b
```

### Step 3 - Ensure Unique Type Variable Names

We can see that the type variable names `a` and `b` are re-used, so let's rename those in `fmap`

```text
(.) :: (b -> c) -> (a -> b) -> a -> c

fmap :: Functor f => (d -> e) -> f d -> f e
```

### Step 4 - Line Up the types

```text
(.) :: (b -> c) -> (a -> b) -> a -> c

fmap :: Functor f => (d -> e) -> f d -> f e
```

Our goal is to unify `b -> c` with `(d -> e) -> f d -> f e`.

Remember that the function type constructor is right-associative. If we take advantage of this fact, we can re-write fmap's signature as: `(d -> e) -> (f d -> f e)`. This leads us to unify as follows:

`b ~ (d -> e)`
`c ~ (f d -> f e)`

### Step 5 - Erase the argument

```text

1 -- (.) fmap :: (a -> b) -> a -> c

b ~ (d -> e)
c ~ (f d -> f e)

2 -- (.) fmap :: (a -> (d -> e)) -> a -> (f d -> f e)

3 -- (.) fmap :: Functor f => (a -> d -> e) -> a -> f d -> f e
```

### Second Application

Now that we've figured out the type of `(.) fmap`, we can rinse and repease:

```text
(.) fmap :: Functor f => (a -> d -> e) -> a -> f d -> f e

fmap :: Functor f => (a -> b) -> f a -> f b

-- Ensure unique type variables
fmap :: Functor g => (c -> b) -> g c -> g b


-- Unify (a -> d -> e) with (c -> b) -> g c -> g b
a ~ (c -> b)
d ~ g c
e ~ g b

-- Erase the first argument
(.) fmap fmap :: a -> f d -> f e

-- Replace type variables, add in constraints
(.) fmap fmap :: (Functor f, Functor g) => (c -> b) -> f (g c) -> f (g b)
```
