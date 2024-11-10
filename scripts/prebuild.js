// scripts/prebuild.js
import fs from "fs";
import path from "path";
import {BLOG_INDEX_ID, NOTION_TOKEN} from "../src/lib/notion/server-constants.js";


// Remove cache files if they exist
try {
  fs.unlinkSync(path.resolve('.blog_index_data'));
  fs.unlinkSync(path.resolve('.blog_index_data_previews'));
} catch (err) {
  console.warn("Cache files not found or couldn't be deleted, proceeding...");
}

// Check for environment variables
if (!NOTION_TOKEN) {
  console.error(
      `\nNOTION_TOKEN is missing. Please provide one to proceed.`
  );
  process.exit(1);
}

if (!BLOG_INDEX_ID) {
  console.error(
      `\nBLOG_INDEX_ID is missing. Please provide one to proceed.`
  );
  process.exit(1);
}