---
author: Steven Leiva
createdAt: 1628988848
updatedAt: 1628988848
tags: [Haskell]
teaser: Dealing with a monad transformer stack of Readers, with different environment requirements
title: Readers on Readers
---

I recently ran into a type error at work involving a monad transformer stack
with multiple `Reader` monads and multiple environments. I have distilled the
problem to its essential components below:

```haskell
#!/usr/bin/env stack
-- stack --resolver lts-18.2 exec ghci --package mtl

{-# LANGUAGE FlexibleContexts #-}


import           Control.Monad.Reader

firstReader :: MonadReader env m => Int -> SqlPersistT m ()
firstReader i = do
  _   <- secondReader -- run a computation

  env <- lift ask -- get the `env` 

  -- more work using the `env` environment

  pure ()

secondReader :: MonadReader Int m => SqlPersistT m ()
secondReader = undefined

-- Note: This is a dummy type synonym, but it motivates the reason for the
-- multiple Reader monads.
type SqlPersistT = ReaderT Char
```

The idea here is that we are in a monad - `SqlPersistT` - which can perform
database actions. That monad  and that is stacked upon another monad that
requires its own environment.

If we run the script above, we will get a type error that boils down to `env`
does not match `Int`. Let's try to figure out how we ended up with this type
error.

## Unifying the Types

It is always good exercise to try to determine how GHC is arriving at a
particular type error. We can re-write `firstReader`:

```haskell
firstReader :: MonadReader env m => Int -> SqlPersistT m ()
firstReader i =
  secondReader
    >> (do
         env <- lift ask
         pure ()
       )
```

And then, we can convert from infix notation to prefix:

```haskell
firstReader :: MonadReader env m => Int -> SqlPersistT m ()
firstReader i = (>>)
  secondReader
  (do
    env <- lift ask
    pure ()
  )
```

The lexical order of the expression now mirrors order in which expression are
being applied. We can now proceed to the unification of the types.

One of the most important rules regarding type unification exercises is that we
want to **apply an expression to a single argument at a time**. This is simply
how Haskell works (remember, all functions are curried), and it has the
enormously beneficial consequence that we only have to think of two expressions
at a time. In our case, we want to apply `>> :: m a -> m b -> m b` to
`secondReader :: MonadReader Int m => SqlPersistT m ()`.

```haskell
>> :: m a -> m b -> m b

secondReader :: MonadReader Int m => SqlPersistT m ()
```

Another important rule of type unfication exercises is that we want to use
**unique type variables** among the two expressions that we are comparing. For
example, because both `>>` and `secondReader` use the `m` type variable name,
we will have to change one of them to something these:

```haskell
>> :: m a -> m b -> m b

secondReader :: MonadReader Int m0 => SqlPersistT m0 ()
```

Now, we can proceed to match `m a ` to `SqlPersistT m0 ()`. In other words, if
`m a ~ SqlPersistT m0 ()`, that implies that `m ~ SqlPersistT m0` and `a ~ ()`.
We can remove the firt argument to `>>`, and then replace the resulting type
signature with that information:

```haskell
-- Remove the first argument in the type signature to `>>`
>> secondReader :: m b -> m b

-- Replace m ~ SqlPersistT m0
-- Replace a ~ ()
>> secondReader :: SqlPersistT m0 b -> SqlPersistT m0 b

-- Add constraints that we know about:
>> secondReader :: MonadReader Int m0 => SqlPersistT m0 b -> SqlPersistT m0 b
```

Now, let's apply `>> secondReader` to the `do` expression. Here, we can take a
shortcut to figure out the type of the `do` expression. We know that `pure () ~
SqlPersistT m ()`, and that that will be the type of the entire `do` expression.

```haskell
>> secondReader :: MonadReader Int m0 => SqlPersistT m0 b -> SqlPersistT m0 b

<do expression> :: MonadReader env m => SqlPersistT m ()
```

`SqlPersistT m0 b ~ SqlPersistT m ()` implies that `SqlPersistT ~ SqlPersistT`,
`m0 ~ m` and `b ~ ()`. Again, we can get rid of an argument to `>>
secondReader`, and then replace the type variable left with the information we
know.

```haskell
-- Remove the first argument to the type signature `>> secondReader`
>> secondReader <do expression> :: MonadReader Int m0 => SqlPersistT m0 b

-- Replace `m0` with `m`
-- Replace `b` with `()`
>> secondReader <do expression> :: MonadReader Int m => SqlPersistT m ()

-- Add constraints we know about:
>> secondReader <do expression> :: (MonadReader env m, MonadReader Int m) => SqlPersistT m ()
```

Now, we can clearly see our type error. The first constraint `MonadReader env
m` disagres with `MonadReader Int m`. Let's look at the head of the
`MonadReader` type class declaration:

```haskell
class Monad m => MonadReader r m | m -> r where
```

The first constraint is saying that the `m` will resolve the `r` to `env`, and
the second constraint is saying that the `m` will resolve the `r` to `Int`. Our
two constraints disagree with one another.

## runReader

With that diversion into a type unfication exercise done, we can continue on how to define `firstReader` in terms of `secondReader`. `firstReader` has an `Int` in scope, which we want to use as the environment for `secondReader`. We can do this by using `runReaderT` to satisfy the `MonadReader` constraint:

```haskell
firstReader :: MonadReader env m => Int -> SqlPersistT m ()
firstReader i = do
  backend <- ask
  _ <- runReaderT (runReaderT secondReader backend) i

  pure ()
```

Why does the above compile? Well, remember that `secondReader` is a monad
transformer stack, where the first transformer is `ReaderT`. We can "peel this
transformer off" using `runReaderT`. Critically, the value that we are left
with has the type `MonadReader Int env`, which we can also peel off using
`runReaderT`!

## Using mapReaderT

The above solution is perfectly valid, but there is a more idiomatic solution - `mapReaderT`. As the documentation states, `mapReaderT` allows us to "[t]ransform the computation inside a ReaderT". That's exactly what we are looking for!

```haskell
firstReader :: MonadReader env m => Int -> SqlPersistT m ()
firstReader i = do
  _ <- mapReaderT (\m -> runReaderT m i) secondReader
  pure ()
```

`mapReaderT` is giving us access to the computation inside of `secondReader`,
which has the type `MonadReader Int m => m ()`. Again, we use `runReaderT` to
satisfy the `MonadReader Int m` constraint!

## Conclusion

Given my previous experience with these subjects, this post served to reinforce previously learned lessons.

In terms of **type unification exercises**, there is a simple algorithm that works for me:

1. Re-write the expression into something that is lexically mirrors the order of application
2. Do **one application at a time**
3. Make sure that the type variables in a given application are unique between the two expressions

In terms of dealing with monadic expression:

1. We can "peel off" the outter monadic structure by using the `runX` functions
   for that monad (unless, of course, if we are dealing with `IO`).
