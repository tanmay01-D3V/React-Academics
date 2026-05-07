async function extractImageUrl(obj) {
  if (!obj || typeof obj !== 'object') return null
  // direct url fields
  const urlKeys = ['image', 'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'url', 'src']
  for (const k of urlKeys) if (obj[k] && typeof obj[k] === 'string' && /^https?:\/\//.test(obj[k])) return obj[k]

  // scan arrays and nested objects
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) {
      for (const item of v) {
        const found = await extractImageUrl(item)
        if (found) return found
      }
    } else if (v && typeof v === 'object') {
      const found = await extractImageUrl(v)
      if (found) return found
    } else if (typeof v === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)/i.test(v)) {
      return v
    }
  }

  return null
}

export async function searchImages(query) {
  const key = import.meta.env.VITE_IMAGE_SEARCH_KEY
  const host = import.meta.env.VITE_IMAGE_SEARCH_HOST || 'google-search-master-mega.p.rapidapi.com'
  if (!key) return null

  const params = new URLSearchParams({ q: query, gl: 'us', hl: 'en', autocorrect: 'true', num: '1', page: '1' })
  const url = `https://${host}/images?${params.toString()}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json',
      },
    })

    let data
    try { data = await res.json() } catch { data = await res.text().then((t) => { try { return JSON.parse(t) } catch { return { text: t } } }) }

    const found = await extractImageUrl(data)
    return found
  } catch (e) {
    console.error('Image search failed:', e)
    return null
  }
}

export default { searchImages }
