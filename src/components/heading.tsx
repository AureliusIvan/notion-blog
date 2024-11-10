import React, { ReactNode, ReactElement } from 'react';

function collectText(el: ReactNode, acc: string[] = []): string {
  if (typeof el === 'string') {
    acc.push(el);
  } else if (Array.isArray(el)) {
    el.forEach((item) => collectText(item, acc));
  } else if (React.isValidElement(el)) {
    collectText(el.props.children, acc);
  }
  return acc.join('').trim();
}

interface HeadingProps {
  children: ReactElement;
  id?: string;
}

const Heading: React.FC<HeadingProps> = ({ children: component, id }) => {
  const text = component.props.children || '';

  // Generate ID if not provided
  if (!id) {
    id = collectText(text)
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[?!:]/g, ''); // Remove unwanted punctuation
  }

  return (
      <a href={`#${id}`} id={id} style={{ color: 'inherit' }}>
        {component}
      </a>
  );
};

export default Heading;
