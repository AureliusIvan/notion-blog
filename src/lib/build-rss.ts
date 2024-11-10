import {resolve} from 'path';
import {writeFile} from './fs-helpers';
import {renderToStaticMarkup} from 'react-dom/server';

import {textBlock} from './notion/renderers';
import getBlogIndex from './notion/getBlogIndex';
import getNotionUsers from './notion/getNotionUsers';
import {getBlogLink, postIsPublished} from './blog-helpers';

process.env['NODE' + '_ENV'] = 'production';
process.env.USE_CACHE = 'true';

const NOW = new Date().toJSON();

type Author = { full_name: string };
type Post = {
  title: string;
  Slug: string;
  Page: string;
  Date: string;
  Published: string;
  Authors: string[];
  preview?: any[];
  content?: any[];
  link?: string;
  authors?: Author[];
  date?: string;
};

function mapToAuthor(author: Author): string {
  return `<author><name>${author.full_name}</name></author>`;
}

function decodeHTML(string: string): string {
  return string
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
}

function mapToEntry(post: Post): string {
  const content = post.preview
      ? post.preview.map((block, idx) => textBlock(block, false, `${post.title}${idx}`))
      : post.content;

  return `
    <entry>
      <id>${post.link}</id>
      <title>${decodeHTML(post.title)}</title>
      <link href="${post.link}"/>
      <updated>${new Date(post.date!).toJSON()}</updated>
      <content type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${renderToStaticMarkup(content)}
          <p class="more">
            <a href="${post.link}">Read more</a>
          </p>
        </div>
      </content>
      ${(post.authors || []).map(mapToAuthor).join('\n')}
    </entry>`;
}

function createRSS(blogPosts: Post[]): string {
  const postsString = blogPosts.map(mapToEntry).join('');

  return `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>My Blog</title>
    <subtitle>Blog</subtitle>
    <link href="/atom" rel="self" type="application/rss+xml"/>
    <link href="/" />
    <updated>${NOW}</updated>
    <id>My Notion Blog</id>
    ${postsString}
  </feed>`;
}

async function fetchBlogPosts(): Promise<Post[]> {
  const postsTable = await getBlogIndex(true);
  const neededAuthors = new Set<string>();

  const blogPosts = Object.keys(postsTable)
      .map((slug) => {
        const post = postsTable[slug];
        if (!postIsPublished(post)) return;

        post.authors = post.Authors || [];
        post.authors.forEach((authorId: string) => neededAuthors.add(authorId)); // ensure authorId is a string
        return post;
      })
      .filter(Boolean) as Post[];

  const {users} = await getNotionUsers([...neededAuthors]);

  return blogPosts.map((post) => ({
    ...post,
    // @ts-ignore
    authors: post.authors?.map((id: string) => users[id]), // specify 'id' as a string type
    link: getBlogLink(post.Slug),
    title: post.Page,
    date: post.Date,
  }));
}


async function main() {
  try {
    const blogPosts = await fetchBlogPosts();
    const rssFeed = createRSS(blogPosts);
    const outputPath = './public/atom';

    await writeFile(resolve(outputPath), rssFeed);
    console.log(`Atom feed file generated at \`${outputPath}\``);
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
  }
}

main().catch((error) => console.error(error));
