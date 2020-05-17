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
  omit,
  path as Rpath,
  uniq,
} from "ramda";
import { slugify } from "voca";

const directory = path.join(process.cwd(), "posts");

// GETTERS
const getData = Rpath(["data"]);
const getTags = compose(Rpath(["tags"]), getData);

function fromTag(tag) {
  const fn = compose(includes(tag), map(slugify), getTags);

  return filter(fn, getAllMetadata());
}

/*
  {
    content :: String,
    data :: FrontMatter,
    isEmpty :: Bool,
    excerpt :: String,
    slug :: String
  }
 */

function getSingleMetadata(fullPath) {
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  const slug = fullPathToSlug(fullPath);

  return merge(omit(["orig"], matterResult), { slug });
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
  const transform = compose(uniq, flatten, map(getTags));

  return transform(allMetadata);
}

export { fromTag, getAllMetadata, uniqueTags };
