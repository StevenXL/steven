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
    <div className="tag-section">
      <p>char: {char}</p>
      <p>tags: {JSON.stringify(tags)}</p>
    </div>
  );
}

export default function TagList({ tags }) {
  const charToTags = tagsToSections(tags);

  const TagSections = Object.keys(charToTags).map((char) => (
    <TagSection key={char} char={char} tags={charToTags[char]} />
  ));

  return <div className="tag-list">{TagSections}</div>;
}
