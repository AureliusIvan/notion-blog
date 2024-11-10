import { ParseError, renderToString } from 'katex';
import React from 'react';

interface EquationProps {
  children: string;
  displayMode?: boolean;
}

function renderExpression(expression: string, displayMode: boolean): string {
  try {
    return renderToString(expression, { displayMode });
  } catch (e) {
    if (e instanceof ParseError) {
      // Return the error message as a fallback result
      return e.message;
    }
    // Log unexpected errors in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.error(e);
    }
    return ''; // Return an empty string if an unexpected error occurs
  }
}

const Equation: React.FC<EquationProps> = ({ children, displayMode = true }) => {
  return (
      <span
          dangerouslySetInnerHTML={{
            __html: renderExpression(children, displayMode),
          }}
      />
  );
};

export default Equation;
