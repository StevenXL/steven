---
author: Steven Leiva
createdAt: 1591882817
tags: [Haskell, Type-Level Programming, Note]
teaser: This is the second post in a series about type-level programming in Haskell
title: Type-Level Programming In Haskell - GADTs
updatedAt: 1591882817
---

N.B. This post is tagged with [Note](/tags/note), which means that my
understanding of the topic at hand is fluid, subject to change, and I am likely
to update the post time and time again as my understanding matures. The post is
not meant for external consumption - you are likely to find incomplete thoughts
that make sense only to me (or maybe don't make sense at all). Maybe one day my
understanding will advance to the point where I can delete the note tag.

## GADTs

Generalized Algebraic Data Types have a fairly intimidating name. Luckily, like
most terminology, it is only intimidating because it is new. As soon as we start
unpacking the reason for that name, this start to be less intimidating. So let's
get started.

What the "Generalized" word in GADTs means is that we generalize over the
**return type** of the data constructors for a data type. Let's compare a data
declaration that uses GADTs and one that doesn't, so that we may see this
"generalization on the return type" in action:

```haskell
-- Not GADTs
data AType a = ATypeNullaryDataConstructor | ATypeUnaryDataConstructor a

-- GADTs
data MyType a where
  MyTypeNullaryDataConstructor :: MyType Int
  MyTypeUnaryDataConstructor :: a -> MyType a
```

In the declaration for `AType`, once the type variable `a` has been initialized,
then every data constructor for `AType` will have the same return type. For
example, in the case when `a ~ Int`, `ATypeNullaryDataConstructor` and
`ATypeUnaryDataConstructor` must have the return type `AType Int`. The key here
is to focus on the return type. The data constructors must return the same type
once `a` has been initialized.

But what about `MyType`? Again, the key is the return type of the data
constructors. They do not have to be the same! If we initialize the type
variable `a` to `Bool`, `MyTypeNullaryDataConstructor` will have the type
`MyType Int`, but **MyTypeUnaryDataConstructor will have the type `MyType
Bool`**. In other words, the return type of the data constructor **depends on
the data constructor itself**, modulo other type information. This is simply not
possible without GADTs In the case of `AType`, the return type of the data
constructors depends not on the data constructors themselves, but on what the
type variable has been initialized to.

## Why Is This Useful?

In the declaration of `MyType`, we focused on how GADTs lift a restriction
imposed (necessarily) by the type system. In practice, GADTs are most useful
when we pair the lifting of one restriction by **the imposition of another**.
Specifically, we can restrict the type of the parameters that the data
constructor accepts. Let's re-write `MyType a` to show an example:

```haskell
data MyType a where
  MyTypeNullaryDataConstructor :: MyType Int
  MyTypeNullaryDataConstructor :: Bool -> MyType Bool
```

Notice how, in this new declaration of `MyType`, we are still making use of the
ability for our data constructors to have different return types. In addition,
we are restricting the type of the parameters to which
`MyTypeUnaryDataConstructor` can be applied to. Of course, restricting the type
of the values to which a function can be applied to is no large feat. We do that
all the time in functional programming, and it is the reason d'etre of types to
begin with. Nevertheless, it is clear that one of the guarantees that we get by
restricting the type of the paramters to the data constructors is that if we
have a value of type `MyType Bool`, then we are guaranteed that the data
constructor `MyTypeUnaryDataConstructor` must have been applied to a value of
type `Bool`. But, **with GADTs**, the relationship also holds the other way
around. If we have a value "tagged" with the data constructor
`MyTypeUnaryDataConstructor`, then we are **guaranteed** to be dealing with a
the type `MyType Bool`!. To quote the [GHC User
Guide](https://downloads.haskell.org/ghc/latest/docs/html/users_guide/glasgow_exts.html#generalised-algebraic-data-types-gadts):

*The key point about GADTs is that pattern matching causes type refinement.*

```haskell
patternMatch :: MyType a -> a
patternMatch (MyTypeUnaryDataConstructor b) = b
```

In the above code, by inference, the compiler initializes `a` to `Bool` **if**
the `MyTypeUnaryDataConstructor` pattern matches!

And just to round out the discussion, let's explore why it is impossible to
determine the type of a value from its data constructor without GADTs:

```haskell
data NoGADT a = NoGADT Int

a :: NoGADT Bool
b = NoGADT 5

b :: NoGADT Int
b = NoGADT 5

c :: NoGADT String
b = NoGADT 5
```

Notice that at the value level, we have the exact same data: `NoGADT 5`.
However, in each case, we have a different type - `NoGADT Bool`, `NoGADT Int`,
and `NoGADT String`. This is why, without GADTs, we cannot determine from the
data constructor what the type is. If we can't do it, neither can Haskell's type
system. Now, try to construct a value using the data constructor
`MyTypeUnaryDataConstructor` and have it **not** result in a value of type
`MyType Bool`. It is impossible!

## Information Flow Between Layers

In my post on [phantm types](/posts/phantom_types), I continually emphasized the
importance of understanding how information flows from one layer of the type
system to another. In that post, we learned three things:

1. Information can be encoded at the type layer; one way to do so is with
   **phantom types**
2. **Typeclasses** allow us to translate type-level information to the term layer
3. We can use **type annotations** to send information from the term layer to
   the type layer

GADTs give us a new tool by which to communicate from the term layer to the type
layer. The **data constructors** at the term layer can be used to determine the
type (at the type layer).

The ability of GADTs to convey information from the term layer - via the data
constructors - to the type layer is how they change the game!


## Misc

When writing this post, the ability to send information from the term layer to
the type layer finally dawned on me. What happened was that I was going to
extoll the fact that when we loosen the restriction on the return type and add
restrictions on the type of the parameter to a GADT, we get a guarantee of the
type of the value to which a data constructor was applied. It dawned on me that
this was true even without GADTs, but that GADTs made possible to infer things
the other way around - given a data constructor, we have a guarantee of the
type.
