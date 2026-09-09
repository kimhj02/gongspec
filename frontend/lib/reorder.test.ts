import { describe, expect, it } from 'vitest'
import { moveById, moveItem } from './reorder'

describe('reorder', () => {
  it('moves an item before another', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
    expect(moveById([{ id: 'a' }, { id: 'b' }, { id: 'c' }], 'c', 'a')).toEqual([{ id: 'c' }, { id: 'a' }, { id: 'b' }])
  })

  it('keeps the list when indexes are the same', () => {
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
  })
})
