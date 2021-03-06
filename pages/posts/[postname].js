import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import footnotes from "remark-footnotes";

import Layout from "../../components/Layout";
import CodeBlock from "../../components/CodeBlock";
import FootnoteReference from "../../components/FootnoteReference";
import FootnoteDefinition from "../../components/FootnoteDefinition";

const renderers = {
  code: CodeBlock,
  footnoteReference: FootnoteReference,
  footnoteDefinition: FootnoteDefinition,
};

export default function BlogPost({ frontmatter, markdownBody }) {
  if (!frontmatter) return <></>;

  return (
    <Layout pageTitle={frontmatter.title}>
      <article className="container">
        <h1>{frontmatter.title}</h1>
        <p>By {frontmatter.author}</p>
        <div>
          <ReactMarkdown
            source={markdownBody}
            renderers={renderers}
            plugins={[[footnotes, { inlineNotes: true }]]}
          />
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticProps({ ...ctx }) {
  const { postname } = ctx.params;

  const content = await import(`../../posts/${postname}.md`);
  const data = matter(content.default);

  return {
    props: {
      frontmatter: data.data,
      markdownBody: data.content,
    },
  };
}

export async function getStaticPaths() {
  const blogSlugs = ((context) => {
    const keys = context.keys();

    const data = keys.map((key, index) => {
      let slug = key.replace(/^.*[\\\/]/, "").slice(0, -3);

      return slug;
    });

    return data;
  })(require.context("../../posts", true, /\.md$/));

  const paths = blogSlugs.map((slug) => `/posts/${slug}`);

  return {
    paths,
    fallback: false,
  };
}
