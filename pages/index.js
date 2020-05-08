import { getAllMetadata as getAllPostsMetadata } from "../lib/posts";
import Layout from "../components/Layout";
import PostList from "../components/PostList";

const Index = ({ title, description, posts, ...props }) => {
  return (
    <Layout pageTitle={title}>
      <h1 className="title">Welcome to my blog!</h1>
      <p className="description">{description}</p>
      <main>
        <PostList posts={posts} />
      </main>
    </Layout>
  );
};

export default Index;

export async function getStaticProps() {
  const { description, title } = await import(`../siteconfig.json`);
  const posts = getAllPostsMetadata();

  return {
    props: {
      description,
      posts,
      title,
    },
  };
}
