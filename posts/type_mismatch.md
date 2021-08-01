---
author: Steven Leiva
createdAt: 1627739162
tags: [Haskell]
teaser: A walkthrough of a type mismatch error in GHC
title: Solving a Type Error - Couldn't Match Type
updatedAt: 1627739162
---

Type errors are a common source of frustration for new users to Haskell. Truth
be told, depending on the amount of type-level programming involved, type errors
can be inscrutable even to seasoned Haskell programmers.

In this post, we are going to start off with an ill-typed Haskell program, and
explore how different type-level features affect how we eventually get the
program to compile.

## The Ill-Typed Source Code

```haskell
#!/usr/bin/env stack
-- stack --resolver lts-18.2 script

import           Data.Pool            (Pool)
import           Database.Persist.Sql (SqlBackend)
import           Test.Hspec

main :: IO ()
main = hspec spec

spec :: Spec
spec =
  withPool $ do
    describe "insertAdmin" $ do
      it "is successful when email has not been taken" pending

withPool :: SpecWith SqlPool -> Spec
withPool = undefined

type SqlPool = Pool SqlBackend
```

## The Type Error

The file above is a Haskell Script[^1], and it contains the following type error:

```text
• Couldn't match type ‘()’ with ‘Pool SqlBackend’
  Expected type: SpecWith SqlPool
    Actual type: SpecWith (Arg Expectation)
• In a stmt of a 'do' block:
    it "is successful when email has not been taken" pending
  In the second argument of ‘($)’, namely
    ‘do it "is successful when email has not been taken" pending’
  In a stmt of a 'do' block:
    describe "insertAdmin"
      $ do it "is successful when email has not been taken" pending
```

## What Went Wrong

At a simplified level, we can GHC's job as making sure that our "types line up".
If a function expects a value of type `Int`, and we are applying it to a value
of type `Bool`, GHC will detect that the *types do not line up*. This will
result in a type error.

In this particular case, GCH is information us that there are two types that do
not line up:

1. On the first line of the error message, we can see that the type `()` is not
   the same as the type `Pool SqlBackend`.

2. On the second and third lines of the error message, GHC could not match the
   type `SpecWith SqlPool` with `SpecWith (Arg Expectation)`. Because `SqlPool`
   is a type alias for `Pool SqlBackend`, we substitute `Pool SqlBackend` for
   `SqlPool`. Therefore, we will consider the second line of the error message
   to reference `Pool SqlBackend`[^2].

Where did we expect the type `SpecWith SqlPool`, and why? Though a tad
convoluted, the error message does eventually point us to the argument to
`withPool`. The argument - spanning from the `describe` to the `pending` - has
the type `SpecWith ()`, and *that* is clearly not the same as `SpecWith
SqlPool`.

## Where Did `()` Come From?

Despite the fact that the expression `describe ...` has the wrong type, it was
not wholly wrong, in the sense that the type constructor did match. A graphical
example might be more... illustrative:

```markdown
|          | Type Constructor | Type            |
|----------|------------------|-----------------|
| Expected | SpecWith         | Pool SqlBackend |
| Actual   | SpecWith         | Arg Expectation |
```


Notice how the type constructor - i.e. `SpecWith` - of the expected type **is**
the same as the type constructor of the actual type. What didn't match was
`SqlPool` with `Arg Expectation`. Not only can we *see* that the type
constructor matched in our table above, but GHC told us as much in the first
line of the error message, which, importantly *doesn't* mention the type
constructor `SpecWith`.

However, a mystery arises here. If the types that failed to match are `Pool
SqlBackend` with `Arg Expectation`, why does the first line of the error message
compare `Pool SqlBackend` to `()`? Shouldn't the failure read, instead,
`Couldn't match type ‘Arg Expectation’ with ‘Pool SqlBackend’`?

## Type Families

The reason for this seeming inconsistentcy is that `Arg` is a type family[^3].
This means that it is a type-level function from one type to another. In our
program, we applied the type `Expectation` to the type family `Arg`, and the
*instance* of `Arg` for `Expectation` is in fact `()`[^4]:

```haskell
type Arg Expectation = ()
```

## Solving Our Type Error

Let's recap what we know so far:

1. The `describe ...` expression is reducing to the type `SpecWith ()`.
2. The `withPool` function expects the type `SpecWith (Pool SqlBackend)`.
3. The type family `Arg Expectation` reduces to `()`.
4. `Arg Expectation` is not `Pool SqlBackend`

Here, we can pursue two lines of inquiry. First, we can investigate the
`describe ...` expression to figure out why it reduced to `SpecWith ()`.

Secondly, we can try to find an instance of `Arg` that reduces to `Pool
SqlBackend`.

Note: It is important to point out here that we are assuming that the type
signature of `withPool` is correct. Our error would be gone if we changed
`withPool :: SpecWith () -> Spec`. However, we are assuming that, in a
real-world scenario, what `withPool` does with the `SpecWith SqlPool` value
would mean that there is no other type signature possible.

Let's start with `describe`.

### `describe`

`describe` has the the type:

```haskell
describe :: HasCallStack => String -> SpecWith a -> SpecWith a
```

This type signature tell us that the return type of `describe` is wholly
dependent on the type of its second argument. In our case, that second argument
is `it "is successful when email has not been taken" pending`.

What is the type of `it`?

```haskell
it :: (HasCallStack, Example a) => String -> a -> SpecWith (Arg a)
```

Much like `describe`, the return type of `it` is wholly dependent on the type of
its second argument. In our case, we used `pending`, which has the type
`Expectation`, and which caused the return type of the entire `describe ...`
expression to be `SpecWith (Arg Expectation)` - a.k.a. `SpecWith ()`.

However, this line of inquiry has gotten us very far. Our goal is now to find a
type `a` such that `SpecWith (Arg a)` reduces to `SpecWith (Pool SqlBackend)`.
We know that such a type must have an instance of `Example` because of the
constraint in the type signature of `it`, and because we know that the type
family `Arg` is a associated with the `Example` type class.

Notice that this excursion into what our `describe ...` expression reduced to
led us to the same conclusion we had before. Namely:

> Secondly, we can try to find an instance of `Arg` that reduces to `Pool
> SqlBackend`.

We can argue, convincingly, that it was unneccesary work, but it is very useful
from a pedagogical perspective.

## Reaching Our Goal

At this point, we have boiled down our problem to finding an instance of `Arg`
that reduces to `Pool SqlBackend`.

Unfortunately, I have no general way of finding such an instance. Because `Arg`
is an open type family, such an instance can be defined anywhere. The best I
have come up with is good 'ol `grep`ing of the code base. We have two hooks that
we can search for `instance Example` (again, since `Arg` is an associated type
family) and `type Arg`. This will work if the instance is defined within your
code base, but not if the instance is defined in a library whose source code is
not in your project.

Alas, in our case, it was the former. A library that I was using had the
following instance of `Example`:

```haskell
instance Example (AppExample app a) where
  type Arg (AppExample app a) = app
```

This meant that if I had the type `Arg (AppExample (Pool SqlBackend) a)` would
reduce to `Pool SqlBackend` - exactly what we are looking for. Since
`AppExample app` is also a monad, we can create a value of the correct type by
using the monad interface:

```haskell
#!/usr/bin/env stack
-- stack --resolver lts-18.2 script

import           Data.Pool            (Pool)
import           Database.Persist.Sql (SqlBackend)
import           FrontRow.App.Test
import           Test.Hspec

main :: IO ()
main = hspec spec

spec :: Spec
spec = withPool $ do
  describe "insertAdmin" $ do
    let myPending :: AppExample SqlPool ()
        myPending = pure ()

    it "is successful when email has not been taken" myPending

withPool :: SpecWith SqlPool -> Spec
withPool = undefined

type SqlPool = Pool SqlBackend
```

[^1]: Assuming you've saved this file into `type_error.hs`, you can run the
  script with `stack type_error.hs`.

[^2]: I have changed mentions of `SqlPool` to `Pool SqlBackend`. The former is a
  type synonym for the later, which means that these are two different names for
  the same type. They can be used interchangeably, but when trying to figure out
  why our types don't line up, it is much easier to avoid having to remember
  that these are the same thing, and simply use one name.

[^3]: [Arg](https://www.stackage.org/haddock/lts-18.5/hspec-2.7.10/Test-Hspec.html#t:Arg)

[^4]: `Arg` is an open and an associated type family. The *open* adjective means
  that there is no "master" list of all of the instances of `Arg`. A new
  instance can be defined at any time. The *associated* adjective means that the
  type family is associated with a type class. Looking at the [source
  code](https://github.com/hspec/hspec/blob/e990053f35e1c9f2b0b6dfc13475f657d2eef120/hspec-core/src/Test/Hspec/Core/Example.hs#L45),
  we can see that `Arg` is associated with the `Example` type class.
