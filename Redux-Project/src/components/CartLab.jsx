import { useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  decreaseQuantity,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
} from '../features/cart/cartSlice';

export default function CartLab() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Slice 5</p>
          <h2>Cart selectors and reducers</h2>
        </div>
        <strong className="text-xl">${total}</strong>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <article className="cart-row" key={item.id}>
            <div>
              <h3>{item.name}</h3>
              <p>
                ${item.price} x {item.quantity}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => dispatch(decreaseQuantity(item.id))}>
                -
              </button>
              <button type="button" onClick={() => dispatch(removeFromCart(item.id))}>
                Remove
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && <p className="empty-state">Add products to see cart state update.</p>}
      </div>

      <button className="secondary-button mt-4" type="button" onClick={() => dispatch(clearCart())}>
        Clear cart
      </button>
    </section>
  );
}
