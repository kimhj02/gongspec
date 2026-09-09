/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SortableList from '@/components/sortable-list'

afterEach(() => {
  cleanup()
})

describe('sortable list', () => {
  it('reorders with arrow keys from the focused item', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(
      <SortableList
        items={['첫번째', '두번째', '세번째']}
        getId={(item) => item}
        onReorder={onReorder}
        renderItem={(item, bind) => <div {...bind}>{item}</div>}
      />,
    )

    screen.getByText('두번째').focus()
    await user.keyboard('{ArrowUp}')
    expect(onReorder).toHaveBeenCalledWith(['두번째', '첫번째', '세번째'])
  })
})
