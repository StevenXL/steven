import Link from "next/link";

import { equals, find, identity, isEmpty, prop, sortBy } from "ramda";
import { format, fromUnixTime } from "date-fns";
import { slugify } from "voca";

import Layout from "../../components/Layout";
import styles from "./tag.module.scss";

import {
  fromTag as postsFromTag,
  uniqueTags as uniqueTagsFromPosts,
} from "../../lib/posts";

function PostPreview({ teaser, title, createdAt, tags }) {
  const sortedTags = sortBy(identity, tags);

  return (
    <>
      <h2>{title}</h2>
      <p className="lead">{teaser}</p>

      <div className="row no-gutters">
        <div className="col-3 col-md-2">
          <p className="d-inline">
            {format(fromUnixTime(createdAt), "MMMM do, yyyy")}
          </p>
        </div>

        <div className="col-9 col-md-10">
          <ul className={`d-inline p-1 pl-md-2`}>
            {sortedTags.map((tagDisplay) => {
              const tagSlug = slugify(tagDisplay);

              return (
                <Link key={tagSlug} href={`/tags/${tagSlug}`}>
                  <a className={`mr-1 mr-sm-2 ${styles.tag}`}>{tagDisplay}</a>
                </Link>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default function Tag({ siteTitle, tagDisplay, posts, ...props }) {
  return (
    <Layout pageTitle={siteTitle}>
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

  const { title: siteTitle } = await import(`../../siteconfig.json`);

  const posts = postsFromTag(tagSlug);

  const fn = (tagDisplay) => equals(slugify(tagDisplay), tagSlug);

  const tagDisplay = find(fn, posts[0].tags);

  return {
    props: {
      siteTitle,
      posts,
      tagSlug,
      tagDisplay,
    },
  };
}
