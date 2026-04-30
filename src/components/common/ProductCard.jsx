import { Link } from 'react-router-dom';
import { formatPrice, getDiscountPercent } from '../../utils/helpers';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? 'text-saree-gold' : 'text-stone-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600';

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block">
      <div className="card-hover">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-stone-100">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="badge bg-saree-burgundy text-white">
                {discount}% Off
              </span>
            )}
            {product.isFeatured && (
              <span className="badge bg-saree-gold text-white">
                Featured
              </span>
            )}
          </div>

          {/* Quick action overlay */}
          <div className="absolute inset-0 bg-saree-deep/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <button className="btn-primary text-xs py-2 px-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              View Details
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-4 pb-2">
          {product.category?.name && (
            <p className="font-sans text-xs tracking-widest uppercase text-saree-gold mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="font-display text-lg text-saree-deep leading-snug group-hover:text-saree-burgundy transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>

          {product.fabric && (
            <p className="font-sans text-xs text-stone-400 mt-1">{product.fabric}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="price-tag text-base">{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <span className="original-price">{formatPrice(product.comparePrice)}</span>
              )}
            </div>

            {product.numReviews > 0 && (
              <div className="flex items-center gap-1">
                <StarRating rating={product.rating} />
                <span className="font-sans text-xs text-stone-400">({product.numReviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
