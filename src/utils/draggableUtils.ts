interface Item {
  id: number;
  order: number;
}

export function updateOrder<T extends Item>(
  items: T[],
  newOrder: Item
): T[] | null {
  const prevItemOrder = items.find((item) => item.id === newOrder.id)?.order;

  const newItemOrder = newOrder.order;
  const itemId = newOrder.id;

  if (!prevItemOrder || prevItemOrder === newItemOrder) return null;

  const didMoveUp = prevItemOrder < newItemOrder;

  const newOrderMap = items.map((item) => {
    let itemNewPosition;

    if (item.id === itemId) {
      itemNewPosition = newItemOrder;
    } else if (
      didMoveUp &&
      item.order > prevItemOrder &&
      item.order <= newItemOrder
    ) {
      itemNewPosition = item.order - 1;
    } else if (
      !didMoveUp &&
      item.order < prevItemOrder &&
      item.order >= newItemOrder
    ) {
      itemNewPosition = item.order + 1;
    } else {
      itemNewPosition = item.order;
    }

    return {
      ...item,
      order: itemNewPosition,
    };
  });

  return newOrderMap;
}
