import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'

interface CodeProps {
  children: string;
  language?: string;
}

const Code = ({children, language = 'javascript'}: CodeProps) => {
  return (
      <>
      <pre>
        <code
            dangerouslySetInnerHTML={{
              __html: Prism.highlight(
                  children,
                  Prism.languages[language.toLowerCase()] ||
                  Prism.languages.javascript,
                  language,
              ),
            }}
        />
      </pre>

        <style jsx>{`
            pre {
                tab-size: 2;
            }

            code {
                overflow: auto;
                display: block;
                padding: 0.8rem;
                line-height: 1.5;
                background: #f5f5f5;
                font-size: 0.75rem;
                border-radius: var(--radius);
            }
        `}</style>
      </>
  )
}

export default Code
