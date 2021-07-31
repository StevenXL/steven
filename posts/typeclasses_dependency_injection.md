---
author: Steven Leiva
createdAt: 1595427079
tags: [Haskell, Typeclasses, Dependency Injection]
teaser: In this post, we take a look at Haskell Typeclasses as dependency injection on steroids.
title: Haskell Typeclasses & Dependency Injection
updatedAt: 1627736497
---

There are a multitude of "lenses" with which to view typeclasses in Haskell. We
can view typeclasses *as an interface*; or, we can view typeclasses *as a name
for a set of related types*; or, we can view typeclasses *as a form of
dependency injection*.

In this post, I'd like to talk about viewing a typeclass *as dependency
injection* (on steroids). This is not a new idea, and credit goes to Matt
Parsons's, who first explained this to me in a tractable way in his post,
[Invert Your Mocks!][invert-your-mocks]

## What is Dependency Injection

For our purposes, we'll define dependency injection as *passing behavior* to a
program, as opposed to hard-coding the behavior into the program. For example:

```javascript
// Decrease the cost once, and then increase it twice
function computeCost(costIncrease, costDecrease, startingCost) {
  const decreasedCost = costDecrease(startingCost)

  const increasedCost = costIncrease(decreasedCost)

  return costIncrease(increasedCost)
}
```

In the snippet above, we have passed into the `computeCost` function how to
increase a cost and decrease the cost. The benefit of doing this is that we can
change the behavior of `computeCost` by passing in different arguments. In one
scenario, maybe increasing our cost means adding 5. In another scenario,
increasing our cost means adding 10. Because this behavior can be passed into
our `computeCost` function, we can change the behavior as needed.

Now we know what dependency injection is, as well as why it is useful.

## "Manual" Dependency Injection in Haskell

Let's translate the above function from JavaScript to Haskell:

```haskell
computeCost :: (a -> a) -> (a -> a) -> a
computeCost costIncrease costDecrease startingCost =
  let decreasedCost = costDecrease startingCost
      increasedCost = costIncrease decreasedCost
  in costIncrease increasedCost
```

## Dependency Injection via Typeclasses

Let's now use typeclasses to perform the dependency injection for us. We'll
write out the code first, and then explain what is going on:

```haskell

class TrackCost a where
  costDecrease :: a -> a
  costIncrease :: a -> a

computeCost :: TrackCost a => a -> a
computeCost startingCost =
  let decreasedCost = costDecrease startingCost
      increasedCost = costIncrease decreasedCost
  in costIncrease increasedCost

newtype HighCost = HighCost Int deriving Show

newtype LowCost = LowCost Int deriving Show

instance TrackCost HighCost where
  costDecrease (HighCost currentCost) = HighCost (currentCost + 10)
  costIncrease (HighCost currentCost) = HighCost (currentCost - 5)

instance TrackCost LowCost where
  costDecrease (LowCost currentCost) = LowCost (currentCost + 5)
  costIncrease (LowCost currentCost) = LowCost (currentCost - 2)

main :: IO ()
main = do
  print (computeCost (HighCost 10)) # Will print "HighCost 25"
  print (computeCost (LowCost 10))  # Will print "LowCost 18"
```

Let's first focus on the *behavior* of `computeCost`. Notice that the result of
`main` proves that we have *injected* behavior into `commputeCost`. How? Because
even though we have passed in essentially the same argument - barring the
`newtype` wrapper, in both cases we are passing in `10` - `computeCost` resulted
in a different number - specifically, `25` and `18`.

What happened is that instead of passing in the behavior explicitly via
arguments to `computeCost`, we are passing in the behavior implicitly via
typeclasses. The function that `costDecrease` and `costIncrease` will resolve to
depend on what the type variable `a` is specialized to. In the case of
`HighCost`, `costDecrease` will resolve to a fuction that subtracts `5`, and
`costIncrease` will resolve to a function that adds `10`. You can likely figure
out what `costDecrease` and `costIncrease` will resolve to when the type
variable `a` is specialized to `LowCost`.

## Side Notes

I wrote `computeCost` in such a way as to keep a symmetry between the JavaScript
function. In the wild, you are most likely to see the Haskell version of
`computeCost` written with *function composition* and in *point free* style:

```haskell
computeCost :: (a -> a) -> (a -> a) -> a
computeCost costIncrease costDecrease = costIncrease . costIncrease . costDecrease

computeCost' :: TrackCost a => a -> a
computeCost' = costIncrease . costIncrease . costDecrease
```

[invert-your-mocks]: https://www.parsonsmatt.org/2017/07/27/inverted_mocking.html
[dependency-injection]: https://en.wikipedia.org/wiki/Dependency_injection
