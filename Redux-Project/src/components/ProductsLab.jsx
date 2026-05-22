import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { fetchProducts, resetProducts } from '../features/products/productsSlice';

export default function ProductsLab() {
  const dispatch = useDispatch();
  const { error, items, status } = useSelector((state) => state.products);

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Slice 4</p>
          <h2>Async products thunk</h2>
        </div>
        <span className="status-pill">{status}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="primary-button"
          type="button"
          disabled={status === 'loading'}
          onClick={() => dispatch(fetchProducts())}
        >
          {status === 'loading' ? 'Loading...' : 'Fetch products'}
        </button>
        <button className="secondary-button" type="button" onClick={() => dispatch(resetProducts())}>
          Reset
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      <div className="mt-4 grid gap-3">
        {items.map((product) => (
          <article className="product-row" key={product.id}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3>{product.name}</h3>
                <span>{product.category}</span>
              </div>
              <p>{product.description}</p>
              <strong>${product.price}</strong>
            </div>
            <button className="secondary-button" type="button" onClick={() => dispatch(addToCart(product))}>
              Add
            </button>
          </article>
        ))}

        {items.length === 0 && status !== 'loading' && (
          <p className="empty-state">Fetch the mock catalog to practice pending and fulfilled states.</p>
        )}
      </div>
    </section>
  );
}
