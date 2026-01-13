import { constructMetadata } from '@/lib/metadata-utils'

describe('constructMetadata', () => {
  it('returns default metadata when no options provided', () => {
    const metadata = constructMetadata()
    expect(metadata.title).toBe('Headless Firebase CMS')
    expect(metadata.openGraph?.title).toBe('Headless Firebase CMS')
    expect(metadata.openGraph?.images).toHaveLength(1)
  })

  it('returns custom metadata when options provided', () => {
    const metadata = constructMetadata({
      title: 'Custom Title',
      description: 'Custom Description',
    })
    expect(metadata.title).toBe('Custom Title')
    expect(metadata.description).toBe('Custom Description')
    expect(metadata.openGraph?.title).toBe('Custom Title')
    expect(metadata.openGraph?.description).toBe('Custom Description')
  })

  it('includes OG image with dynamic title', () => {
    const metadata = constructMetadata({
      title: 'Post Title',
    })
    const ogImage = (metadata.openGraph?.images as any)[0]
    expect(ogImage.url).toContain('/api/og?title=Post+Title')
  })

  it('includes robots: noindex when noIndex is true', () => {
    const metadata = constructMetadata({
      noIndex: true,
    })
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    })
  })
})
