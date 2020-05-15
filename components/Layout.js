import Head from "next/head";
import Header from "./Header";

export default function Layout({ children, pageTitle, ...props }) {
  return (
    <>
      <Head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link
          rel="stylesheet"
          href="/static/css/bootstrap-4.5.0/bootstrap.min.css"
        />

        <title>{pageTitle}</title>
      </Head>

      <section className="layout">
        <Header />

        <div className="content">{children}</div>
        <footer>Built by me!</footer>
      </section>

      <script src="/static/js/jquery/jquery-3.5.1.slim.min.js"></script>
      <script src="/static/js/popper-1.16.0/popper.min.js"></script>
      <script src="/static/js/bootstrap-4.5.0/bootstrap.min.js"></script>
    </>
  );
}
