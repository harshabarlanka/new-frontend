import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingStates';

const CartPage = () => {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-saree-deep mb-4">Please sign in to view your cart</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 text-stone-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-saree-deep mb-2">Your cart is empty</h2>
          <p className="text-stone-500 mb-8 font-sans">Add some beautiful sarees to get started</p>
          <Link to="/products" className="btn-primary">Browse Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-saree-deep mb-2">Shopping Cart</h1>
        <p className="font-sans text-stone-500 mb-10">{items.length} item{items.length !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.productId;
              if (!product) return null;
              const image = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300';

              return (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm p-5 flex gap-5">
                  {/* Image */}
                  <Link to={`/products/${product.slug || product._id}`} className="flex-shrink-0">
                    <img
                      src={image}
                      alt={product.name}
                      className="w-24 h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product.slug || product._id}`}
                      className="font-display text-lg text-saree-deep hover:text-saree-burgundy transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="font-sans text-saree-gold font-semibold mt-1">
                      {formatPrice(product.price)}
                    </p>
                    {product.stock < 5 && (
                      <p className="font-sans text-xs text-amber-600 mt-1">Only {product.stock} left</p>
                    )}

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateItem(product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-sans text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product._id)}
                        className="text-xs font-sans text-red-400 hover:text-red-600 transition-colors ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-lg text-saree-deep">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
              <h2 className="font-display text-xl text-saree-deep mb-5">Order Summary</h2>

              <div className="space-y-3 font-sans text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-base text-saree-deep">
                  <span>Total</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full mt-6 py-3 text-center"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center font-sans text-xs text-stone-400 hover:text-saree-gold mt-4 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
