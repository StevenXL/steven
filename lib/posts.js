import fs from "fs";
import { compose, flatten, map, merge, prop, uniq } from "ramda";
import matter from "gray-matter";
import path from "path";

const directory = path.join(process.cwd(), "posts");

function getSingleMetadata(fullPath) {
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  const slug = fullPathToSlug(fullPath);

  return merge(matterResult.data, { slug });
}

function getAllMetadata() {
  const fileNames = fs.readdirSync(directory);

  const allMetadata = fileNames.map((fileName) => {
    const fullPath = path.join(directory, fileName);
    return getSingleMetadata(fullPath);
  });

  return allMetadata;
}

function fullPathToSlug(fullPath) {
  return path
    .basename(fullPath)
    .replace(/^.*[\\\/]/, "")
    .slice(0, -3);
}

function uniqueTags() {
  const allMetadata = getAllMetadata();
  const transform = compose(uniq, flatten, map(prop("tags")));

  return transform(allMetadata);
}

export { getAllMetadata, uniqueTags };
