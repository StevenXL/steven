import Link from "next/link";
import { isEmpty, isNil } from "ramda";

import PostPreview from "../../components/PostPreview";

export default function PostList({ posts }) {
  const noPosts = isEmpty(posts) || isNil(posts);

  if (noPosts) {
    return <div>No posts!</div>;
  } else {
    return posts.map((post) => {
      return <PostPreview key={post.slug} {...post} />;
    });
  }
}
