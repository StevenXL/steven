import { uniqueTags as uniqueTagsFromPosts } from "../lib/posts";

import Layout from "../components/Layout";
import TagList from "../components/TagList";

const Tags = ({ title, description, tags, ...props }) => {
  return (
    <>
      <Layout pageTitle={`${title} | About`} description={description}>
        <TagList tags={tags} />
      </Layout>
    </>
  );
};

export async function getStaticProps() {
  const { description, title } = await import(`../siteconfig.json`);

  const tags = uniqueTagsFromPosts();

  return {
    props: {
      description,
      tags,
      title,
    },
  };
}

export default Tags;
