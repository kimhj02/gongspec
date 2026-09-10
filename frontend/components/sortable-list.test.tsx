/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SortableList, { SortableHandle } from '@/components/sortable-list'

afterEach(() => {
  cleanup()
})

function dataTransferMock() {
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn(),
    getData: vi.fn(() => ''),
    setDragImage: vi.fn(),
  }
}

describe('sortable list', () => {
  it('reorders with arrow keys from the drag handle', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    render(
      <SortableList
        items={['첫번째', '두번째', '세번째']}
        getId={(item) => item}
        onReorder={onReorder}
        renderItem={(item, bind) => {
          const { handle, ...itemBind } = bind
          return (
            <div {...itemBind}>
              <SortableHandle bind={handle} />
              {item}
            </div>
          )
        }}
      />,
    )

    screen.getAllByLabelText('끌어 순서를 바꿉니다. 위아래 화살표로도 이동합니다.')[1].focus()
    await user.keyboard('{ArrowUp}')
    expect(onReorder).toHaveBeenCalledWith(['두번째', '첫번째', '세번째'])
  })

  it('starts a drag from the handle, not the rest of the card', () => {
    const onReorder = vi.fn()
    render(
      <SortableList
        items={['첫번째', '두번째']}
        getId={(item) => item}
        onReorder={onReorder}
        renderItem={(item, bind) => {
          const { handle, ...itemBind } = bind
          return (
            <div {...itemBind} data-testid={`item-${item}`}>
              <SortableHandle bind={handle} />
              <p>{item}</p>
            </div>
          )
        }}
      />,
    )

    expect(screen.getByTestId('item-첫번째').getAttribute('draggable')).toBeNull()
    const handle = screen.getAllByLabelText('끌어 순서를 바꿉니다. 위아래 화살표로도 이동합니다.')[0]
    expect(handle.getAttribute('draggable')).toBe('true')
    fireEvent.dragStart(handle, { dataTransfer: dataTransferMock() })
    expect(screen.getByTestId('item-첫번째').className).toContain('is-dragging')
  })
})
