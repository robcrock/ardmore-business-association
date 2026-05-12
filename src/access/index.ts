import type { Access } from 'payload'

export const anyone: Access = () => true
export const authenticated: Access = ({ req }) => Boolean(req.user)
export const publishedOnly: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
