---
author: Steven Leiva
createdAt: 1591713713
tags: [Haskell, Type-Level Programming, Phantom Types, Note]
teaser: This is the first post in a series about type-level programming in Haskell
title: Type-Level Programming In Haskell - Phantom Types
updatedAt: 1591713713
---

N.B. This post is tagged with [Note](/tags/note). This means that the post is
**not** meant for external consumption. Instead, it is a "stream of
conciousness" or "scratchpad" as I learn about new topics.

## Terms, Types, and Kinds

One of the foundations of understanding type-level programming in Haskell is the
realization that Haskell's type system divides itself into three **separate**
layers - the *term* layer; the *type* layer; and the *kind* layer.

Just like the terms `a`, `b`, `c` are grouped into the type `Char`, types
themselves are grouped together into something called a kind. The kind of
`Char`, for example, is `*`.

## Bridging Terms, Types, and Kinds

The separation between *terms*, *types*, and *kinds* is foundational for
understanding type-level programming. Type-level programming simply means that
instead of operating on terms, we are going to be operating on types. Types are
useful only to the extent that they inform the behavior of our system at
runtime. Therefore, we must be able to bridge the the term layer and the type
layer. There must be facilities to take information at one layer and have that
impact the other layer.

This idea of passing information between these two layers of the type system is
so commonplace that we might not even be aware of it. For example, let's pass
some information from the term layer to the type layer:

```haskell
Nothing :: Maybe Int
```

Using a *type annotation*, we can tell type system that our `Nothing` data
constructor has the type `Maybe Int`. We are now passing type information from
the term layer to the type layer. As you can imagine, only type information can
be passed into the type layer.

What about passing information from the type layer to the term layer? This is
done via typeclasses! For example, we can think about the instance of `Show
Int` as a function (loosely speaking) going from the type `Int` to the value
`Int -> String`. In the discussion of *phantom types* below, we will see a more
explicit example of using typeclasses to bridge the type and term layers.

## Phantom Types

Let's imagine for a second that we are building the navigation software for a
space craft. We want to make sure that we never mix up our units. A potential
attempt at this might be as follows:

```haskell
data Distance = Miles Double | Kilometers Double

distanceInMiles :: Distance
distanceInMiles = Miles 10

distanceInKilometers :: Distance
distanceInKilometers = Kilometers 10
```

How does this save us from mixing up our units? Well, in order to access the
double, we have to pattern match on the data constructors, making it obvious
what units we are dealing with. But there are two problems here:

0. The **unit information exists only at the term layer** - the type system is
   not aware of it.
0. It becomes increasingly difficult to perform simple operations values of type `Distance a`
0. No guarantees that something untoward won't happen outside of `addDistances`.


To the first point:

```haskell
addDistances :: Distance -> Distance -> Distance
addDistances first second = ...
```

Notice how, at the type layer, we have no information about the units.

To the second point, let's actually implement `addDistances`:

```haskell
addDistances :: Distance -> Distance -> Distance
addDistances (Miles x) (Miles y) = Miles (x + y)
addDistances (Kilometers x) (Kilometers y) = Kilometers (x + y)
addDistances (Miles x) (Kilometers y) = Kilometers (x * 1.60934 + y)
addDistances kilometers miles = addDistances miles kilometers
```

If we add more data constructors to the `Distance` type, we'd be in a mess of
trouble!

Finally, to the third point, we have no guarantee that a client of `Distance`
won't do the following:

```haskell
distanceToDouble :: Distance -> Double
distanceToDouble (Miles x) = x
distanceToDouble (Kilometers y) = y

distanceToDouble (Miles x) + distanceToDouble (Kilometers y)
```

We could always use Haskell's combinator pattern and make `Distance` an absract
data type, but that leads to its own issues.

## Phantom Types

Let's go back to our original problem. We want to create navigation software in
such a way that avoids the mixup of units. We saw a potential solution, where
the unit information was carried along at the term level. This time, let's
enlist the type system to help us ensure we don't mix up our types by encoding
the unit information at the type level. We can do this using **Phantom Types**:

```haskell
data Mile
data Kilometer

newtype Distance a = Distance { unDistance :: Double }
```

Let's pause here to understand what the above code snippet is doing.

First, we are declaring two new data types - `Mile` and `Kilometer`. Notice that
these data types have *no data constructors*. As a result, we cannot create
values of type `Mile` or `Kilometer`.

Secondly, we are creating a new *type constructor* - `Distance`. `Distance`
is parameterized by a type variable. Crucially, because this type variable does
not appear on the right-hand side of the data declaration, the type variable
(`a`) is known as a **phantom type**. In more esoteric terms, you might here
someone say that the type variable has not witness at the term level. What good
is it then? Well, it might be phantom at the value level, but it is alive and
well at the type level! The types `Distance Mile` and `Distance Kilometer` are
two very distinct types. Using phantom types, our type system is now aware that
distance values have units!

## Operating on Distance

Now that we the unit have been promoted to the type level, the compiler can
ensure we don't mix up our units. Let's how we would go about operating on our
`Distance a` values.

Remember that our `Distance` type constructor is just a wrapper around an
underlying value of type `Double`. For "number like" operations, we just want to
unwrap the `Double`, perform the operation, and wrap things up again in our
`Distance` data constructor. We can use `GeneralizedNewtypeDeriving` to have
Haskell derive this exact instance for us:

```haskell
newtype Distance a = Distance { unDistance :: Double } deriving (Num, Show)

a :: Distance Mile
a = Distance 20

b :: Distance Mile
b = Distance 20

a + b
=> Distance { unDistance = 40.0 }
```

However, if we attempt to add two distances with different units, we get a type
error:

```haskell
a :: Distance Mile
a = Distance 20

b :: Distance Kilometer
b = Distance 20

a + b
=> Couldn't match type ‘Kilometer’ with ‘Mile’
```

```haskell
twentyMiles = (Distance 10 :: Distance Mile) + (Distance 10 :: Distance Kilometer)
```

## Working with Information at the Type Level

So we've gained some type safety. The compiler is helping us ensure that we do
not mix up types, and working with distances of the same type is fairly painless
- we rely on the way that `Double`s work.

But what about working with distances with two different units? What if we
wanted to, in fact, add miles and kilometers together? Well, we know we can
write the functions:

```haskell
addMilesToKilometers :: Distance Mile -> Distance Kilometer -> Distance Kilometer
addMilesToKilometers distanceInMiles distanceInKilometers = Distance (unDistance distanceInKilometers + unDistance distanceInMiles 1.60934)

addKilometersToMiles :: Distance Kilometer -> Distance Mile -> Distance Mile
addKilometersToMiles distanceInKilometers distanceInMiles = Distance (unDistance distanceInMiles + unDistance distanceInKilometers * 0.621371)
```

Now, if we have two distances - one in miles and another in kilometers - we know
whether we need to choose `addKilometersToMiles` or `addKilometersToMiles` based
on the information at the type level. As we've said earlier, going for
information from the type level to the term-level requires a typeclass:

```haskell
class Add a b where
  addDistance :: Distance a -> Distance b -> Distance b

instance Add Mile Kilometer where
  addDistance = addMilesToKilometers

instance Add Kilometer Mile where
  addDistance = addKilometersToMiles

instance Add Mile Mile where
  addDistance = +

instance Add Kilometer Kilometer where
  addDistance = +
```

## Lessons for the Novice Type-Level Programmer

The code snippet above contains a multitude of tidbits for the novice type-level
programmer. Let's start with the typeclass declaration:

```haskell
class Add a b where
  addDistance :: Distance a -> Distance b -> Distance b
```

Notice how we apply the type variable `a` and `b` to the `Distance` type
constructor in our declaration of the typeclass. Thus, even though `Distance`
does not appear anywhere in our typeclass declaration's head, we can only call
`addDistance` to values of type `Distance`. Remember, we need to decide between
using `addMilesToKilometers` or `addKilometersToMiles`. The only information we
need to make this choice is the units of the two distance values we are adding.
And that is precisely the information that our `Add` class is "asking" for.

Now, let's at one of our instance declarations:

```haskell
instance Add Mile Kilometer where
  addDistance = addMilesToKilometers
```

Notice how the typeclass instance is used to go from type level information -
the units of the distances that we are adding - to term level information,
namely, a function from two distances (mile and kilometer) to a single distance
in kilometers.

## What Have We Gained

Our first declaration of `Distance` was conceptually simple, fairly type-safe,
but hard to work with and hard to extend.

Our "phantom type" version of distance was conceptually more complex, just as
type-safe, and we didn't sacrifice much in the way of ergonomics:

```haskell
let tenMiles = Distance 10 :: Distance Mile
let tenKilometers = Distance 10 :: Distance Kilometer

addDistance tenMiles tenMiles
=> Distance {unDistance = 20.0} :: Distance Mile

addDistance tenKilometers tenKilometers
=> Distance {unDistance = 20.0} :: Distance Kilometer

addDistance tenMiles tenKilometers
=> Distance {unDistance = 26.0934} :: Distance Kilometer

addDistance tenKilometers tenMiles
=> Distance {unDistance = 16.21371} :: Distance Mile
```

## Complete Module

The code snippet below is a complete module of the lessons learned here. Notice
that we declare a `Convert` typeclass that lets us convert from miles to
kilometers or kilometers to miles. If you load this module in GHCI, you can run
the `main` action and see the tests pass (hopefully!).

```haskell
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}

module IntroToTypeLevelProgramming.PhantomTypes where

import           Test.Hspec

newtype Distance a = Distance { unDistance :: Double } deriving (Eq, Show, Num)

data Mile

data Kilometer

milesToKilometers :: Distance Mile -> Distance Kilometer
milesToKilometers distanceInMiles = Distance (unDistance distanceInMiles * 1.60934)

kilometersToMiles :: Distance Kilometer -> Distance Mile
kilometersToMiles distanceInKilometers = Distance (unDistance distanceInKilometers * 0.621371)

class Convert a b where
  convert :: Distance a -> Distance b

-- instance Convert (Distance Mile) (Distance Kilometer); we'd be passing
instance Convert Mile Kilometer where
  convert = milesToKilometers

instance Convert Kilometer Mile where
  convert = kilometersToMiles

class Add a b where
  addDistance :: Distance a -> Distance b -> Distance b

instance Add Mile Kilometer where
  addDistance distanceInMiles distanceInKilometers = convert distanceInMiles + distanceInKilometers

instance Add Kilometer Mile where
  addDistance distanceInKilometers distanceInMiles = convert distanceInKilometers + distanceInMiles

instance Add Mile Mile where
  addDistance = (+)

instance Add Kilometer Kilometer where
  addDistance = (+)

main :: IO ()
main = hspec $ do
  it "converts from miles to kilometers" $ do
    let distanceInMiles = Distance 10 :: Distance Mile
    (convert distanceInMiles :: Distance Kilometer) `shouldBe` Distance 16.0934
  it "converts from kilometers to miles" $ do
    let distainceInKilometers = Distance 10 :: Distance Kilometer
    (convert distainceInKilometers :: Distance Mile) `shouldBe` Distance 6.21371
  it "can add miles to kilometers" $ do
    let distanceInKilometers = Distance 10 :: Distance Kilometer
        distanceInMiles = Distance 10 :: Distance Mile
    (addDistance distanceInMiles distanceInKilometers) `shouldBe` (Distance 26.0934 :: Distance Kilometer)
  it "can add kilometers to miles" $ do
    let distanceInKilometers = Distance 10 :: Distance Kilometer
        distanceInMiles = Distance 10 :: Distance Mile
    (addDistance distanceInKilometers distanceInMiles) `shouldBe` (Distance 16.21371 :: Distance Mile)

```
