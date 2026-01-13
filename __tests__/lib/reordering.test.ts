import { reorder } from '@/lib/utils'

describe('reorder utility', () => {
  it('reorders an array correctly', () => {
    const list = ['a', 'b', 'c', 'd']
    const result = reorder(list, 1, 2) // Move 'b' (index 1) to index 2
    expect(result).toEqual(['a', 'c', 'b', 'd'])
  })

  it('moves item to the beginning', () => {
    const list = ['a', 'b', 'c']
    const result = reorder(list, 2, 0) // Move 'c' to index 0
    expect(result).toEqual(['c', 'a', 'b'])
  })

  it('moves item to the end', () => {
    const list = ['a', 'b', 'c']
    const result = reorder(list, 0, 2) // Move 'a' to index 2
    expect(result).toEqual(['b', 'c', 'a'])
  })
})
