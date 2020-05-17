import { uniqueTags as uniqueTagsFromPosts } from "../lib/posts";

import Layout from "../components/Layout";
import TagList from "../components/TagList";

const Tags = ({ tags, ...props }) => {
  return (
    <>
      <Layout pageTitle="Steven Leiva | All Topics">
        <TagList tags={tags} />
      </Layout>
    </>
  );
};

export async function getStaticProps() {
  const tags = uniqueTagsFromPosts();

  return {
    props: {
      tags,
    },
  };
}

export default Tags;
