/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import InstTypeFilters from '@/components/inst-type-filters'
import type { InstTypeFilter } from '@/lib/api'

afterEach(() => {
  cleanup()
})

function Filters() {
  const [value, setValue] = useState<InstTypeFilter | ''>('')
  return <InstTypeFilters value={value} onChange={setValue} />
}

describe('institution type filters', () => {
  it('toggles a legal type on and off', async () => {
    const user = userEvent.setup()
    render(<Filters />)

    const enterprise = screen.getByRole('button', { name: '공기업' })
    const all = screen.getByRole('button', { name: '전체' })
    expect(all.getAttribute('aria-pressed')).toBe('true')

    await user.click(enterprise)
    expect(enterprise.getAttribute('aria-pressed')).toBe('true')
    expect(all.getAttribute('aria-pressed')).toBe('false')

    await user.click(enterprise)
    expect(enterprise.getAttribute('aria-pressed')).toBe('false')
    expect(all.getAttribute('aria-pressed')).toBe('true')
  })
})
