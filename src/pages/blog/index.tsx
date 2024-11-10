import Link from 'next/link';
import Header from '../../components/header';

import blogStyles from '../../styles/blog.module.css';
import sharedStyles from '../../styles/shared.module.css';

import {getBlogLink, getDateStr, postIsPublished,} from '@lib/blog-helpers';
import {textBlock} from '@lib/notion/renderers';
import getNotionUsers from '../../lib/notion/getNotionUsers';
import getBlogIndex from '../../lib/notion/getBlogIndex';
import {GetStaticProps} from 'next';

interface Post {
  Slug: string;
  Page: string;
  Published: string;
  Authors: string[];
  Date?: string;
  preview?: any[];
}

interface IndexProps {
  preview: boolean;
  posts: Post[];
}

export const getStaticProps: GetStaticProps = async ({preview = false}) => {
  const postsTable = await getBlogIndex();

  const authorsToGet: Set<string> = new Set();
  const posts: Post[] = Object.keys(postsTable)
      .map((slug) => {
        const post = postsTable[slug];
        // Remove draft posts in production
        if (!preview && !postIsPublished(post)) {
          return null;
        }
        post.Authors = post.Authors || [];
        for (const author of post.Authors) {
          authorsToGet.add(author);
        }
        return post;
      })
      .filter(Boolean) as Post[];

  const {users} = await getNotionUsers([...authorsToGet]);

  posts.forEach((post) => {
    post.Authors = post.Authors.map((id) => users[id]?.full_name || id);
  });

  return {
    props: {
      preview,
      posts,
    },
    revalidate: 10,
  };
};

const Index: React.FC<IndexProps> = ({posts = [], preview}) => {
  return (
      <>
        <Header titlePre="Blog"/>
        {preview && (
            <div className={blogStyles.previewAlertContainer}>
              <div className={blogStyles.previewAlert}>
                <b>Note:</b> Viewing in preview mode{' '}
                <Link href="/api/clear-preview">
                  <button className={blogStyles.escapePreview}>Exit Preview</button>
                </Link>
              </div>
            </div>
        )}
        <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
          <h1>My Notion Blog</h1>
          {posts.length === 0 ? (
              <p className={blogStyles.noPosts}>There are no posts yet</p>
          ) : (
              posts.map((post) => (
                  <div className={blogStyles.postPreview} key={post.Slug}>
                    <h3>
                <span className={blogStyles.titleContainer}>
                  {!post.Published && (
                      <span className={blogStyles.draftBadge}>Draft</span>
                  )}
                  <Link href={getBlogLink(post.Slug)}>{post.Page}</Link>
                </span>
                    </h3>
                    {post.Authors.length > 0 && (
                        <div className="authors">By: {post.Authors.join(' ')}</div>
                    )}
                    {post.Date && (
                        <div className="posted">Posted: {getDateStr(post.Date)}</div>
                    )}
                    <p>
                      {(!post.preview || post.preview.length === 0)
                          ? 'No preview available'
                          : post.preview.map((block, idx) =>
                              textBlock(block, true, `${post.Slug}${idx}`)
                          )}
                    </p>
                  </div>
              ))
          )}
        </div>
      </>
  );
};

export default Index;
