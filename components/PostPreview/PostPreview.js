import Link from "next/link";
import { format, fromUnixTime } from "date-fns";
import { identity, sortBy } from "ramda";
import { slugify } from "voca";

import styles from "./styles.module.scss";

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
          <ul className="d-inline p-0">
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

export default PostPreview;
