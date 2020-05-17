import Layout from "../components/Layout";
import PostList from "../components/PostList";
import { getAllMetadata as getAllPostsMetadata } from "../lib/posts";

const Index = ({ title, posts, ...props }) => {
  return (
    <Layout pageTitle="Steven Leiva | Home">
      <div className="container">
        <h1 className="text-center">Welcome!</h1>
        <p className="lead w-75 mx-auto text-center">
          This is my home on the internet. You can find my writing on software
          topics, contact information, resume, and other interests.
        </p>

        <h2>Latest Blog Posts</h2>
        <PostList posts={posts} />
      </div>
    </Layout>
  );
};

export default Index;

export async function getStaticProps() {
  const posts = getAllPostsMetadata();

  return {
    props: {
      posts,
    },
  };
}
