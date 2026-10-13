/**
 * R2 Image reference encoding / decoding utilities.
 *
 * An R2 image reference is a compact, URL-safe base64 string that bundles
 * all the metadata needed to reconstruct the public URL of an image stored
 * in Cloudflare R2.
 *
 * Encoded payload shape:
 * {
 *   k: string   – object key (path inside the bucket, e.g. "uploads/hero.jpg")
 *   b?: string  – bucket name  (optional – falls back to runtime config)
 *   a?: string  – account ID   (optional – falls back to runtime config)
 *   d?: string  – custom domain (optional – e.g. "https://cdn.example.com")
 * }
 *
 * Usage:
 *   const ref = encodeR2Image({ key: 'uploads/hero.jpg', customDomain: 'https://cdn.example.com' })
 *   // ref → "eyJrIjoidXBsb2Fkcy9oZXJvLmpwZyIsImQiOiJodHRwczovL2Nkbi5leGFtcGxlLmNvbSJ9"
 *
 *   const info = decodeR2Image(ref)
 *   // info → { key: 'uploads/hero.jpg', customDomain: 'https://cdn.example.com' }
 *
 *   const url = buildR2ImageUrl(ref, { accountId: 'abc123', bucketName: 'my-bucket' })
 *   // url → "https://cdn.example.com/uploads/hero.jpg"
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface R2ImageInfo {
  /** Object key / path inside the R2 bucket. */
  key: string
  /** Bucket name – overrides the runtime fallback when present. */
  bucketName?: string
  /** Cloudflare account ID – overrides the runtime fallback when present. */
  accountId?: string
  /**
   * Custom public domain for the bucket (e.g. "https://cdn.example.com").
   * When set, the URL is built as `${customDomain}/${key}`.
   * When absent, the Cloudflare R2 public URL format is used:
   *   `https://pub-<accountId>.r2.dev/<key>`  (requires public bucket access)
   */
  customDomain?: string
}

/** Minimal runtime R2 config used as a fallback by `buildR2ImageUrl`. */
export interface R2FallbackConfig {
  accountId?: string
  bucketName?: string
  customDomain?: string
}

// ─── Internal wire format ─────────────────────────────────────────────────────

interface R2ImagePayload {
  k: string
  b?: string
  a?: string
  d?: string
}

// ─── Encode ───────────────────────────────────────────────────────────────────

/**
 * Encodes an `R2ImageInfo` into a compact URL-safe base64 reference string.
 * Store this value in a Firestore document field of type `image`.
 */
export function encodeR2Image(info: R2ImageInfo): string {
  if (!info.key.trim()) {
    throw new Error('R2 image key must not be empty.')
  }

  const payload: R2ImagePayload = { k: info.key.trim() }
  if (info.bucketName) payload.b = info.bucketName
  if (info.accountId) payload.a = info.accountId
  if (info.customDomain) payload.d = info.customDomain.replace(/\/$/, '') // strip trailing slash

  const json = JSON.stringify(payload)
  // btoa works with ASCII; use encodeURIComponent round-trip to handle unicode keys
  return btoa(encodeURIComponent(json))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// ─── Decode ───────────────────────────────────────────────────────────────────

/**
 * Decodes a base64 R2 image reference string back into `R2ImageInfo`.
 * Returns `null` if the string is not a valid R2 image reference.
 */
export function decodeR2Image(ref: string): R2ImageInfo | null {
  if (!ref || typeof ref !== 'string') return null

  try {
    // Restore standard base64 padding and characters
    const base64 = ref.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = decodeURIComponent(atob(padded))
    const payload = JSON.parse(json) as R2ImagePayload

    if (typeof payload.k !== 'string' || !payload.k) return null

    return {
      key: payload.k,
      ...(payload.b ? { bucketName: payload.b } : {}),
      ...(payload.a ? { accountId: payload.a } : {}),
      ...(payload.d ? { customDomain: payload.d } : {}),
    }
  } catch {
    return null
  }
}

/**
 * Returns `true` when the string looks like a valid R2 image reference
 * (i.e. it decodes successfully).
 */
export function isR2ImageRef(value: string): boolean {
  return decodeR2Image(value) !== null
}

// ─── Build public URL ─────────────────────────────────────────────────────────

/**
 * Builds the public URL for an R2 image reference.
 *
 * Priority for each piece of config:
 *   1. Value encoded inside the reference itself.
 *   2. Value from the `fallback` config object.
 *
 * Returns `null` when there is not enough information to construct a URL.
 */
export function buildR2ImageUrl(
  ref: string,
  fallback: R2FallbackConfig = {},
): string | null {
  const info = decodeR2Image(ref)
  if (!info) return null

  const customDomain = info.customDomain ?? fallback.customDomain
  const accountId = info.accountId ?? fallback.accountId

  if (customDomain) {
    return `${customDomain.replace(/\/$/, '')}/${info.key}`
  }

  if (accountId) {
    // Cloudflare R2 public bucket URL pattern
    return `https://pub-${accountId}.r2.dev/${info.key}`
  }

  return null
}
