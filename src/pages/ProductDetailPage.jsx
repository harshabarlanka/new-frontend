import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useData';
import ProductCard from '../components/common/ProductCard';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingStates';
import { formatPrice, getDiscountPercent, getStarArray } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ rating, numReviews }) => {
  const stars = getStarArray(rating);
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {stars.map((type, i) => (
          <svg key={i} className={`w-4 h-4 ${type === 'empty' ? 'text-stone-300' : 'text-saree-gold'}`} fill={type === 'empty' ? 'none' : 'currentColor'} stroke="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-sans text-sm text-stone-400">({numReviews} reviews)</span>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Related products
  const relatedParams = product?.category?.slug
    ? { category: product.category.slug, limit: 4 }
    : { limit: 4 };
  const { products: relatedProducts } = useProducts(relatedParams);

  const discount = product ? getDiscountPercent(product.price, product.comparePrice) : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <ErrorMessage message={error || 'Product not found'} />
          <div className="text-center mt-6">
            <Link to="/products" className="btn-outline">Back to Collections</Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'];

  const details = [
    { label: 'Fabric', value: product.fabric },
    { label: 'Occasion', value: product.occasion },
    { label: 'Color', value: product.color },
    { label: 'Length', value: product.length },
    { label: 'Blouse Piece', value: product.blousePiece ? 'Included' : 'Not included' },
    { label: 'Origin', value: product.category?.origin },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400">
            <Link to="/" className="hover:text-saree-gold">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-saree-gold">Collections</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-saree-gold">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3 w-20 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-saree-gold' : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative aspect-[3/4] overflow-hidden bg-stone-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-saree-burgundy text-white">{discount}% Off</span>
                </div>
              )}
              {/* Wishlist button */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-4 right-4 w-10 h-10 bg-white shadow-md flex items-center justify-center hover:bg-saree-silk transition-colors"
                aria-label="Add to wishlist"
              >
                <svg
                  className={`w-5 h-5 transition-colors ${wishlist ? 'text-saree-burgundy fill-current' : 'text-stone-400'}`}
                  fill={wishlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="font-sans text-xs tracking-widest uppercase text-saree-gold hover:text-saree-burgundy transition-colors mb-3"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl md:text-4xl text-saree-deep leading-tight mb-4">
              {product.name}
            </h1>

            {product.numReviews > 0 && (
              <div className="mb-5">
                <StarRating rating={product.rating} numReviews={product.numReviews} />
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-end gap-4 mb-6">
              <span className="font-display text-4xl text-saree-burgundy">{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <>
                  <span className="original-price text-lg mb-1">{formatPrice(product.comparePrice)}</span>
                  <span className="badge bg-green-50 text-green-700 text-xs mb-1">Save {discount}%</span>
                </>
              )}
            </div>

            <div className="w-full h-px bg-stone-100 mb-6" />

            {/* Description */}
            <p className="font-sans text-sm leading-relaxed text-stone-600 mb-8">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-sans text-sm text-stone-500">
                {product.stock > 10
                  ? 'In Stock'
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <label className="font-sans text-xs tracking-widest uppercase text-stone-400">Qty</label>
                <div className="flex items-center border border-stone-200">
                  <button
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-sans text-sm">{selectedQty}</span>
                  <button
                    onClick={() => setSelectedQty(Math.min(product.stock, selectedQty + 1))}
                    className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            {cartMsg && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-sans rounded-lg px-4 py-2">
                {cartMsg}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                disabled={product.stock === 0 || cartLoading}
                onClick={async () => {
                  if (!user) { navigate('/login'); return; }
                  try {
                    setCartLoading(true);
                    await addToCart(product._id, selectedQty);
                    setCartMsg('Added to cart!');
                    setTimeout(() => setCartMsg(''), 2500);
                  } catch (e) {
                    setCartMsg(e.message || 'Failed to add to cart');
                  } finally {
                    setCartLoading(false);
                  }
                }}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartLoading ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                disabled={product.stock === 0}
                onClick={async () => {
                  if (!user) { navigate('/login'); return; }
                  try {
                    setCartLoading(true);
                    await addToCart(product._id, selectedQty);
                    navigate('/checkout');
                  } catch (e) {
                    setCartMsg(e.message || 'Error');
                    setCartLoading(false);
                  }
                }}
                className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Product Details */}
            {details.length > 0 && (
              <div className="border border-stone-100 p-5 bg-saree-silk/30">
                <h3 className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-4">Product Details</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {details.map((d) => (
                    <div key={d.label}>
                      <dt className="font-sans text-xs text-stone-400">{d.label}</dt>
                      <dd className="font-sans text-sm text-stone-700 mt-0.5">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-stone-100">
              {[
                { icon: '🔒', text: 'Secure Payment' },
                { icon: '↩', text: 'Easy Returns' },
                { icon: '🚚', text: 'Free Shipping' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-1.5">
                  <span className="text-sm">{badge.icon}</span>
                  <span className="font-sans text-xs text-stone-500">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-saree-deep mb-2">Customer Reviews</h2>
            <div className="divider-gold mt-3 mb-8 ml-0" style={{ margin: '12px 0 32px 0' }} />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white border border-stone-100 p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <svg key={j} className="w-3.5 h-3.5 text-saree-gold fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-serif text-sm italic text-stone-600 leading-relaxed mb-4">"{review.comment}"</p>
                  <p className="font-sans text-xs font-medium text-stone-700">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.filter((p) => p._id !== product._id).length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-saree-deep mb-2">You May Also Like</h2>
            <div className="divider-gold mt-3 mb-8 ml-0" style={{ margin: '12px 0 32px 0' }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts
                .filter((p) => p._id !== product._id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
