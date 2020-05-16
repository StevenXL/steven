import Link from "next/link";
import { slugify } from "voca";

function tagsToSections(tags) {
  const fn = function (acc, tagName) {
    const capitalizedFirstChar = tagName[0].toUpperCase();

    const existingTagNames = acc[capitalizedFirstChar] || [];

    const newTagNames = [...existingTagNames, tagName];

    acc[capitalizedFirstChar] = newTagNames;

    return acc;
  };

  return tags.reduce(fn, {});
}

function TagSection({ char, tags }) {
  return (
    <div className="tag-section mb-2">
      <div className="row">
        <div className="col-12">
          <h2 className="border-bottom">{char}</h2>
        </div>
      </div>

      <div className="row">
        {tags.sort().map((tag) => {
          const t = slugify(tag);
          return (
            <div className="col-6 col-md-3" key={t}>
              <Link href={`/tags/${t}`}>
                <a>{tag}</a>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TagList({ tags }) {
  const charToTags = tagsToSections(tags);

  const TagSections = Object.keys(charToTags)
    .sort()
    .map((char) => (
      <TagSection key={char} char={char} tags={charToTags[char]} />
    ));

  return (
    <div className="container">
      <h1 className="text-center">All Topics</h1>
      {TagSections}
    </div>
  );
}
