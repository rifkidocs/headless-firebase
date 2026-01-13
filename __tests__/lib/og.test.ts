import { getOgImageUrl } from '@/lib/og'
import { cloudinary } from '@/lib/cloudinary'

describe('getOgImageUrl', () => {
  beforeEach(() => {
    cloudinary.config({
      cloud_name: 'test-cloud'
    })
  })

  it('generates a basic OG image URL with title', () => {
    const url = getOgImageUrl('Hello World')
    expect(url).toContain('res.cloudinary.com/test-cloud/image/upload')
    expect(url).toContain('l_text:Arial_60_bold:Hello%20World')
  })

  it('generates an OG image URL with title and subtitle', () => {
    const url = getOgImageUrl('Hello World', 'Blog')
    expect(url).toContain('l_text:Arial_60_bold:Hello%20World')
    expect(url).toContain('l_text:Arial_30:Blog')
  })

  it('handles special characters in text', () => {
    const url = getOgImageUrl('Hello & World')
    // Cloudinary expects double encoding or specific handling for some chars, 
    // but at minimum it should be URI encoded
    expect(url).toContain('Hello%20%26%20World')
  })
})
