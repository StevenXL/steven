import Layout from "../components/Layout";

const About = ({ title, ...props }) => {
  return (
    <Layout pageTitle="Steven Leiva | About">
      <div className="container">
        <h1 className="title">Welcome to my blog!</h1>

        <p>
          This part of the website is still a work in progress. More to come
          soon!
        </p>
      </div>
    </Layout>
  );
};

export default About;
