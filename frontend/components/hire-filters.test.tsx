/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import HireFilters from '@/components/hire-filters'
import type { HireTypeFilter } from '@/lib/api'

afterEach(() => {
  cleanup()
})

function Filters() {
  const [value, setValue] = useState<HireTypeFilter | ''>('')
  return <HireFilters value={value} onChange={setValue} />
}

describe('hire filters', () => {
  it('toggles a hire type on and off', async () => {
    const user = userEvent.setup()
    render(<Filters />)

    const regular = screen.getByRole('button', { name: '정규직' })
    const all = screen.getByRole('button', { name: '전체' })
    expect(all.getAttribute('aria-pressed')).toBe('true')

    await user.click(regular)
    expect(regular.getAttribute('aria-pressed')).toBe('true')
    expect(all.getAttribute('aria-pressed')).toBe('false')

    await user.click(regular)
    expect(regular.getAttribute('aria-pressed')).toBe('false')
    expect(all.getAttribute('aria-pressed')).toBe('true')
  })
})
