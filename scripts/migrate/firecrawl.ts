const API = 'https://api.firecrawl.dev/v2'

type ScrapeOpts = {
  formats?: Array<'markdown' | 'html' | 'links' | 'screenshot' | 'rawHtml'>
  onlyMainContent?: boolean
  waitFor?: number
}

const key = () => {
  const k = process.env.FIRECRAWL_API_KEY
  if (!k) throw new Error('FIRECRAWL_API_KEY is required')
  return k
}

export async function scrape(url: string, opts: ScrapeOpts = {}) {
  const res = await fetch(`${API}/scrape`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key()}` },
    body: JSON.stringify({
      url,
      formats: opts.formats ?? ['markdown', 'links'],
      onlyMainContent: opts.onlyMainContent ?? true,
      waitFor: opts.waitFor,
    }),
  })
  if (!res.ok) throw new Error(`scrape ${url}: ${res.status} ${await res.text()}`)
  return (await res.json()) as {
    success: boolean
    data: {
      markdown?: string
      html?: string
      links?: string[]
      screenshot?: string
      metadata?: Record<string, unknown>
    }
  }
}

export async function map(url: string, opts: { limit?: number; search?: string } = {}) {
  const res = await fetch(`${API}/map`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key()}` },
    body: JSON.stringify({ url, limit: opts.limit ?? 1000, search: opts.search }),
  })
  if (!res.ok) throw new Error(`map ${url}: ${res.status} ${await res.text()}`)
  return (await res.json()) as { success: boolean; data: { links: Array<string | { url: string }> } }
}
