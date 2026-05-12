import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'

let cached: ReturnType<typeof getPayload> | null = null

export const getPayloadClient = async () => {
  if (!cached) cached = getPayload({ config })
  return cached
}
