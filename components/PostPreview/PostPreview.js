import Link from "next/link";
import { format, fromUnixTime } from "date-fns";
import { identity, sortBy } from "ramda";
import { slugify } from "voca";

function PostPreview(props) {
  const { teaser, title, createdAt, tags } = props.data;

  const sortedTags = sortBy(identity, tags);

  return (
    <div className="p-2 border rounded">
      <p className="lead">{title}</p>
      <p>{teaser}</p>

      <Link href={`/posts/${props.slug}`}>
        <a className="d-block mb-2">Read More ...</a>
      </Link>

      <div className="row no-gutters">
        <div className="col-12 col-sm-3 mb-1 mb-sm-0">
          {format(fromUnixTime(createdAt), "MMMM do, yyyy")}
        </div>

        <div className="col-12 col-sm-9 d-sm-flex justify-content-end flex-wrap">
          {sortedTags.map((tagDisplay) => {
            const tagSlug = slugify(tagDisplay);

            return (
              <Link key={tagSlug} href={`/tags/${tagSlug}`}>
                <a
                  className={
                    "border border-secondary rounded-pill px-2 mr-1 mr-sm-2 bg-light text-dark text-lowercase"
                  }
                >
                  {tagDisplay}
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PostPreview;
