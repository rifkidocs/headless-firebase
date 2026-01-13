import { getOgImageUrl } from '@/lib/og'

describe('getOgImageUrl', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV, NEXT_PUBLIC_APP_URL: 'https://example.com' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('generates a basic OG image URL with title', () => {
    const url = getOgImageUrl('Hello World')
    expect(url).toBe('https://example.com/api/og?title=Hello+World')
  })

  it('generates an OG image URL with title and subtitle', () => {
    const url = getOgImageUrl('Hello World', 'Blog')
    expect(url).toBe('https://example.com/api/og?title=Hello+World&subtitle=Blog')
  })

  it('handles special characters in text', () => {
    const url = getOgImageUrl('Hello & World')
    expect(url).toContain('title=Hello+%26+World')
  })
})