import { Link } from "react-router-dom";
import { useFeaturedProducts } from "../../hooks/useData";
import ProductCard from "../common/ProductCard";
import { ProductGridSkeleton, ErrorMessage } from "../common/LoadingStates";

const FeaturedSection = () => {
  const { products, loading, error } = useFeaturedProducts();

  return (
    <section className="py-20 md:py-28 bg-saree-silk/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-serif text-sm italic text-saree-gold mb-3 tracking-wide">
              Handpicked for you
            </p>
            <h2 className="section-title">Featured Sarees</h2>
            <div
              className="divider-gold mt-4 ml-0"
              style={{ margin: "16px 0 0 0" }}
            />
          </div>
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-2 font-sans text-sm tracking-wider uppercase text-saree-burgundy hover:text-saree-gold transition-colors self-start md:self-auto"
          >
            View All
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-stone-400 italic">
              No featured products at the moment.
            </p>
          </div>
        ) : (
          // ✅ FIXED grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.slice(0, 8).map((product, i) => (
              <div
                key={product._id}
                className="min-w-0 animate-slide-up" // ← ADD min-w-0
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
