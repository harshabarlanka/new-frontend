import { Link } from "react-router-dom";
import { useState } from "react";
import { formatPrice, getDiscountPercent } from "../../utils/helpers";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${
          i < Math.round(rating) ? "text-saree-gold" : "text-stone-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);

  const discount = getDiscountPercent(product.price, product.comparePrice);

  const images = product.images || [];
  const primary = images[0];
  const secondary = images[1] || images[0];

  return (
    <div className="group h-full flex flex-col">
      {/* IMAGE BLOCK */}
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-100">
        {/* Clickable Image Area */}
        <Link to={`/products/${product.slug || product._id}`}>
          {/* Primary Image */}
          <img
            src={primary}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          {/* Secondary Image (hover) */}
          <img
            src={secondary}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </Link>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlisted(!wishlisted);
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 shadow hover:scale-110 transition"
        >
          <svg
            className={`w-4 h-4 ${
              wishlisted ? "text-red-500 fill-red-500" : "text-stone-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 
              7.78l1.06 1.06L12 21.23l7.78-7.78 
              1.06-1.06a5.5 5.5 0 000-7.78z"
            />
          </svg>
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-saree-burgundy text-white text-xs px-2 py-1">
            {discount}% OFF
          </div>
        )}

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur translate-y-full group-hover:translate-y-0 transition duration-300">
          <button className="w-full text-xs font-medium tracking-wide bg-saree-deep text-white py-2">
            QUICK ADD
          </button>
        </div>
      </div>

      {/* INFO */}
      <div className="pt-3 pb-2 flex flex-col flex-1">
        {/* Category */}
        {product.category?.name && (
          <p className="text-xs uppercase tracking-widest text-saree-gold mb-1">
            {product.category.name}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-saree-deep line-clamp-2 min-h-[2.8rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-saree-burgundy">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice > product.price && (
            <span className="text-xs line-through text-stone-400">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-1 h-4 flex items-center">
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} />
              <span className="text-xs text-stone-400">
                ({product.numReviews})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
