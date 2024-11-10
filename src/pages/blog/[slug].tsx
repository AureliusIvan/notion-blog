import Link from 'next/link';
import {useRouter} from 'next/router';
import Header from '../../components/header';
import Heading from '../../components/heading';
import blogStyles from '../../styles/blog.module.css';
import {textBlock} from '@lib/notion/renderers';
import getPageData from '../../lib/notion/getPageData';
import React, {useEffect, useState} from 'react';
import getBlogIndex from '../../lib/notion/getBlogIndex';
import getNotionUsers from '../../lib/notion/getNotionUsers';
import {getBlogLink, getDateStr} from '@lib/blog-helpers';
import Image from "next/image";
import {GetStaticPaths, GetStaticProps} from 'next';

interface Post {
  Page: string;
  Published: string;
  Slug: string;
  Date?: string;
  Authors?: string[];
  content?: Block[];
  hasTweet?: boolean;
}

interface Block {
  id: string;
  type: string;
  properties?: any;
  value: any;
}

interface RenderPostProps {
  post?: Post;
  redirect?: string;
  preview?: boolean;
}

export const getStaticProps: GetStaticProps = async ({params, preview}) => {
  const slug = params?.slug as string;
  const postsTable = await getBlogIndex();
  const post = postsTable[slug];

  if (!post || (post.Published !== 'Yes' && !preview)) {
    return {
      props: {
        redirect: '/blog',
        preview: false,
      },
      revalidate: 5,
    };
  }

  const postData = await getPageData(post.id);
  post.content = postData.blocks;

  const {users} = await getNotionUsers(post.Authors || []);
  post.Authors = Object.keys(users).map((id) => users[id].full_name);

  return {
    props: {
      post,
      preview: !!preview,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const postsTable = await getBlogIndex();
  return {
    paths: Object.keys(postsTable)
        .filter((post) => postsTable[post].Published === 'Yes')
        .map((slug) => getBlogLink(slug)),
    fallback: true,
  };
};

const listTypes = new Set(['bulleted_list', 'numbered_list']);

const RenderPost: React.FC<RenderPostProps> = ({post, redirect, preview}) => {
  const router = useRouter();
  const [listMap, setListMap] = useState<{ [id: string]: any }>({});
  const [listTagName, setListTagName] = useState<string | null>(null);
  const [listLastId, setListLastId] = useState<string | null>(null);

  useEffect(() => {
    if (post && post.hasTweet) {
      const twitterSrc = 'https://platform.twitter.com/widgets.js';
      if ((window as any)?.twttr?.widgets) {
        (window as any).twttr.widgets.load();
      } else if (!document.querySelector(`script[src="${twitterSrc}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = twitterSrc;
        document.body.appendChild(script);
      }
    }
  }, [post]);

  useEffect(() => {
    if (redirect && !post) {
      router.replace(redirect);
    }
  }, [redirect, post, router]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return (
        <div className={blogStyles.post}>
          <p>Whoops! We couldn't find that post, redirecting to the blog index...</p>
        </div>
    );
  }

  const renderBookmark = ({link, title, description, format}: any) => {
    const {bookmark_icon: icon, bookmark_cover: cover} = format;
    return (
        <div className={blogStyles.bookmark}>
          <a
              target="_blank"
              rel="noopener noreferrer"
              href={link}
              className={blogStyles.bookmarkContentsWrapper}
          >
            <div className={blogStyles.bookmarkContents}>
              <div className={blogStyles.bookmarkInfo}>
                <div className={blogStyles.bookmarkTitle}>{title}</div>
                <div className={blogStyles.bookmarkDescription}>{description}</div>
                <div className={blogStyles.bookmarkLinkWrapper}>
                  <Image src={icon} className={blogStyles.bookmarkLinkIcon} alt={title}/>
                  <div className={blogStyles.bookmarkLink}>{link}</div>
                </div>
              </div>
              {cover && (
                  <div className={blogStyles.bookmarkCoverWrapper}>
                    <Image src={cover} alt={title} className={blogStyles.bookmarkCover}/>
                  </div>
              )}
            </div>
          </a>
        </div>
    );
  };

  const renderHeading = (Type: React.ElementType, content: any, id: string) => (
      <Heading key={id}>
        <Type>{textBlock(content, true, id)}</Type>
      </Heading>
  );

  return (
      <>
        <Header titlePre={post.Page}/>
        {preview && (
            <div className={blogStyles.previewAlertContainer}>
              <div className={blogStyles.previewAlert}>
                <b>Note:</b> Viewing in preview mode{' '}
                <Link href={`/api/clear-preview?slug=${post.Slug}`}>
                  <button className={blogStyles.escapePreview}>Exit Preview</button>
                </Link>
              </div>
            </div>
        )}
        <div className={blogStyles.post}>
          <h1>{post.Page}</h1>
          {post.Authors && <div className="authors">By: {post.Authors.join(', ')}</div>}
          {post.Date && <div className="posted">Posted: {getDateStr(post.Date)}</div>}
          <hr/>
          {!post.content || post.content.length === 0 ? (
              <p>This post has no content.</p>
          ) : (
              post.content.map((block, blockIdx) => {
                const {value} = block;
                const {type, properties, id} = value;
                let toRender: React.ReactNode[] = [];

                switch (type) {
                  case 'text':
                    if (properties) toRender.push(textBlock(properties.title, false, id));
                    break;
                  case 'image':
                    toRender.push(<Image key={id} src={properties.source[0][0]} alt={post.Page}/>);
                    break;
                  case 'header':
                    toRender.push(renderHeading('h1', properties.title, id));
                    break;
                  case 'sub_header':
                    toRender.push(renderHeading('h2', properties.title, id));
                    break;
                  case 'bookmark':
                    toRender.push(renderBookmark(properties));
                    break;
                  default:
                    break;
                }
                return toRender;
              })
          )}
        </div>
      </>
  );
};

export default RenderPost;
