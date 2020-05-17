---
author: Steven Leiva
createdAt: 1589691735
tags: [Initial Commit]
teaser: In this post, I lay out my rationale for shipping this website as is, warts and all!
title: Initial Commit
updatedAt: 1589691735
---

I have taken the plunge and created my personal website. This website will serve as my internet presence - it will contain my blog posts, contact information, resume, etc.

As you can tell, this website is far from finished. The styling can use a lot of work, the About page is incomplete, and there are not many posts.

There are, however, a few features that the site supports, such as:

**Publishing**: Publishing is as easy a three-step process: create a markdown file; commit to git; push to master.

**Tag List**: Posts can be tagged with zero, one, or many tags, and those tags will appear in the [All Topics](/tags) page.

**Syntax Highlighting**: I will be using this website primarily to write about programming, so formatted / highlighted code is a must. Just check out the React code below!

```js
var React = require('react');
var Markdown = require('react-markdown');

React.render(
  <Markdown source="# Your markdown here" />,
  document.getElementById('content')
);
```

These three features constitute the site's MVP. Now, we just ship it!
