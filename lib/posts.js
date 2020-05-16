import fs from "fs";
import matter from "gray-matter";
import path from "path";
import {
  compose,
  flatten,
  filter,
  includes,
  map,
  merge,
  prop,
  uniq,
} from "ramda";
import { slugify } from "voca";

const directory = path.join(process.cwd(), "posts");

function fromTag(tag) {
  const fn = (postMetaData) => includes(tag, postMetaData.tags.map(slugify));

  return filter(fn, getAllMetadata());
}

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

export { fromTag, getAllMetadata, uniqueTags };
