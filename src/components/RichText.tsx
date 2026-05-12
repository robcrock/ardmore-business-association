/* Minimal Lexical-state renderer with a markdown fallback for legacy paragraph text. */
import React from 'react'

type Node = {
  type?: string
  children?: Node[]
  text?: string
  tag?: string
  url?: string
  format?: number
}

type SerializedEditorState = { root: { children: Node[] } }

// --- Inline markdown: **bold**, _italic_, `code`, [text](url) ---
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) {
      tokens.push(<strong key={`${keyPrefix}-${i++}`}>{t.slice(2, -2)}</strong>)
    } else if (t.startsWith('_')) {
      tokens.push(<em key={`${keyPrefix}-${i++}`}>{t.slice(1, -1)}</em>)
    } else if (t.startsWith('`')) {
      tokens.push(<code key={`${keyPrefix}-${i++}`}>{t.slice(1, -1)}</code>)
    } else if (t.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t)
      if (linkMatch) {
        tokens.push(
          <a key={`${keyPrefix}-${i++}`} href={linkMatch[2]}>
            {linkMatch[1]}
          </a>,
        )
      } else {
        tokens.push(t)
      }
    }
    last = m.index + t.length
  }
  if (last < text.length) tokens.push(text.slice(last))
  return tokens
}

// Render a Lexical paragraph node — if its raw text is actually markdown
// (e.g. starts with `# `, `- `, `> `), promote to the right element.
function renderParagraph(node: Node, i: number): React.ReactNode {
  const onlyText =
    node.children?.length === 1 && node.children[0].type === 'text'
      ? (node.children[0].text ?? '')
      : null

  if (onlyText !== null) {
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(onlyText.trim())
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6)
      const Tag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
      return <Tag key={i}>{renderInline(headingMatch[2], `h-${i}`)}</Tag>
    }
    if (/^>\s+/.test(onlyText.trim())) {
      return (
        <blockquote key={i}>
          {renderInline(onlyText.trim().replace(/^>\s+/, ''), `q-${i}`)}
        </blockquote>
      )
    }
    if (/^([-*])\s+/m.test(onlyText)) {
      const lines = onlyText.split(/\n/).filter((l) => l.trim())
      const allItems = lines.every((l) => /^([-*])\s+/.test(l.trim()))
      if (allItems) {
        return (
          <ul key={i}>
            {lines.map((l, j) => (
              <li key={j}>
                {renderInline(l.trim().replace(/^([-*])\s+/, ''), `l-${i}-${j}`)}
              </li>
            ))}
          </ul>
        )
      }
    }
    return <p key={i}>{renderInline(onlyText, `p-${i}`)}</p>
  }

  return <p key={i}>{(node.children ?? []).map(renderNode)}</p>
}

const renderNode = (node: Node, i: number): React.ReactNode => {
  if (node.type === 'text') {
    let el: React.ReactNode = node.text ?? ''
    const f = node.format ?? 0
    if (f & 1) el = <strong key={i}>{el}</strong>
    if (f & 2) el = <em key={i}>{el}</em>
    if (f & 8) el = <u key={i}>{el}</u>
    return el
  }
  if (node.type === 'paragraph') return renderParagraph(node, i)
  const children = (node.children ?? []).map(renderNode)
  switch (node.type) {
    case 'heading':
      return React.createElement(node.tag ?? 'h2', { key: i }, children)
    case 'list':
      return node.tag === 'ol' ? <ol key={i}>{children}</ol> : <ul key={i}>{children}</ul>
    case 'listitem':
      return <li key={i}>{children}</li>
    case 'link':
      return (
        <a key={i} href={node.url}>
          {children}
        </a>
      )
    case 'quote':
      return <blockquote key={i}>{children}</blockquote>
    default:
      return <span key={i}>{children}</span>
  }
}

export function RichText({ data }: { data: unknown }) {
  const root = (data as SerializedEditorState | null | undefined)?.root
  if (!root?.children) return null
  return <>{root.children.map((n, i) => renderNode(n, i))}</>
}
