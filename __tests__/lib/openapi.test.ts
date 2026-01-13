import { generateOpenApiSpec } from '@/lib/openapi'
import { CollectionConfig } from '@/lib/types'

const mockCollections: CollectionConfig[] = [
  {
    slug: 'posts',
    label: 'Posts',
    kind: 'collectionType',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'content', label: 'Content', type: 'richtext', required: false },
    ],
  },
]

describe('OpenApi Generator', () => {
  it('generates a valid basic OpenAPI 3.0 structure', () => {
    const spec = generateOpenApiSpec(mockCollections)
    
    expect(spec.openapi).toBe('3.0.0')
    expect(spec.info.title).toBe('Headless Firebase API')
    expect(spec.paths).toBeDefined()
  })

  it('generates paths for a collection', () => {
    const spec = generateOpenApiSpec(mockCollections)
    
    expect(spec.paths['/api/posts']).toBeDefined()
    expect(spec.paths['/api/posts'].get).toBeDefined()
    expect(spec.paths['/api/posts'].post).toBeDefined()
    
    expect(spec.paths['/api/posts/{id}']).toBeDefined()
    expect(spec.paths['/api/posts/{id}'].get).toBeDefined()
    expect(spec.paths['/api/posts/{id}'].patch).toBeDefined()
    expect(spec.paths['/api/posts/{id}'].delete).toBeDefined()
  })

  it('generates correct schema for collection fields', () => {
    const spec = generateOpenApiSpec(mockCollections)
    const postSchema = spec.components.schemas.Posts

    expect(postSchema.type).toBe('object')
    expect(postSchema.properties.title.type).toBe('string')
    expect(postSchema.required).toContain('title')
    expect(postSchema.required).not.toContain('content')
  })
})
