import React, { ReactNode } from 'react';
import components from '../../components/dynamic';

type Tag = [string, string?];
type Tags = Tag[];
type ChildNode = ReactNode | string | null;

function applyTags(tags: Tags = [], children: ChildNode, noPTag: boolean = false, key: number): ReactNode {
  let child = children;

  for (const tag of tags) {
    const props: { [key: string]: any } = { key };
    let tagName: string | React.ElementType = tag[0];

    // Define special cases for tag replacements
    if (noPTag && tagName === 'p') tagName = React.Fragment;
    else if (tagName === 'c') tagName = 'code';
    else if (tagName === '_') {
      tagName = 'span';
      props.className = 'underline';
    } else if (tagName === 'a' && tag[1]) {
      props.href = tag[1];
    } else if (tagName === 'e') {
      tagName = components.Equation;
      props.displayMode = false;
      child = tag[1] || ''; // Set `child` to the content if it's a math equation
    }

    child = React.createElement(components[tagName as keyof typeof components] || tagName, props, child);
  }
  return child;
}

interface TextBlockProps {
  text?: [string | ChildNode, Tags?][];
  noPTag?: boolean;
  mainKey?: React.Key;
}

export function textBlock(text: TextBlockProps['text'] = [], noPTag: boolean = false, mainKey?: React.Key): ReactNode {
  const children: ReactNode[] = [];
  let key = 0;

  for (const textItem of text) {
    key++;
    if (typeof textItem[0] === 'string' && textItem.length === 1) {
      // Directly push plain text items
      children.push(textItem[0]);
    } else if (textItem[1]) {
      // Apply tags if available
      children.push(applyTags(textItem[1], textItem[0], noPTag, key));
    }
  }

  return React.createElement(
      noPTag ? React.Fragment : components.p || 'p', // Default to <p> if components.p is undefined
      { key: mainKey },
      ...children
  );
}
