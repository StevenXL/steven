import Link from "next/link";

import { equals, find, isEmpty, prop, sortBy } from "ramda";
import { slugify } from "voca";

import Layout from "../../components/Layout";
import PostPreview from "../../components/PostPreview";

import {
  fromTag as postsFromTag,
  uniqueTags as uniqueTagsFromPosts,
} from "../../lib/posts";

export default function Tag({ tagDisplay, posts, ...props }) {
  return (
    <Layout pageTitle={tagDisplay}>
      <div className="container">
        <h1 className="title text-center">{tagDisplay} Articles</h1>

        {isEmpty(posts) && <p className="lead text-center">Zero Posts!</p>}

        {sortBy(prop("createdAt"), posts).map((post) => {
          return <PostPreview key={slugify(post.title)} {...post} />;
        })}
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = uniqueTagsFromPosts()
    .map(slugify)
    .map((slug) => `/tags/${slug}`);

  return { paths, fallback: false };
}

export async function getStaticProps(context) {
  const {
    params: { tag: tagSlug },
  } = context;

  const posts = postsFromTag(tagSlug);

  const fn = (tagDisplay) => equals(slugify(tagDisplay), tagSlug);

  const tagDisplay = find(fn, posts[0].tags);

  return {
    props: {
      posts,
      tagSlug,
      tagDisplay,
    },
  };
}
