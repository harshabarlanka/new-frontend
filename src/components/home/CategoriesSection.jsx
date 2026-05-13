import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useData";
import { LoadingSpinner } from "../common/LoadingStates";

// Fallback gradients — shown only when admin has NOT uploaded a category image yet
const FALLBACK_GRADIENTS = [
  "from-amber-950 via-amber-900 to-amber-800",
  "from-rose-950 via-rose-900 to-rose-800",
  "from-emerald-950 via-emerald-900 to-emerald-800",
  "from-violet-950 via-violet-900 to-violet-800",
  "from-sky-950 via-sky-900 to-sky-800",
  "from-orange-950 via-orange-900 to-orange-800",
  "from-teal-950 via-teal-900 to-teal-800",
  "from-indigo-950 via-indigo-900 to-indigo-800",
];

// Single category card — aspect-[3/4] matches ProductCard proportions
const CategoryCard = ({ category, index }) => {
  const categoryImage = category.image || "";
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative block w-full overflow-hidden min-w-0"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
        {/* Dedicated category image uploaded by admin — never a product image */}
        {categoryImage ? (
          <img
            src={categoryImage}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "block";
            }}
          />
        ) : null}

        {/* Gradient fallback — visible when no image uploaded yet */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradient}`}
          style={{ display: categoryImage ? "none" : "block" }}
        />

        {/* Scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Origin badge */}
        {category.origin && (
          <div className="absolute top-3 right-3 z-10">
            <span className="font-sans text-[10px] tracking-widest uppercase text-white/80 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-sm">
              {category.origin}
            </span>
          </div>
        )}

        {/* Placeholder icon when no image */}
        {!categoryImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
              className="w-10 h-10 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Category name + explore arrow */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-display text-base md:text-lg text-white leading-tight mb-1">
            {category.name}
          </h3>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-sans text-[10px] tracking-widest uppercase text-saree-gold">
              Explore
            </span>
            <svg
              className="w-2.5 h-2.5 text-saree-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-saree-silk/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — mirrors FeaturedSection exactly */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="font-serif text-sm italic text-saree-gold mb-3 tracking-wide">
              Across India
            </p>
            <h2 className="section-title">Shop by Weave</h2>
            <div
              className="divider-gold mt-4 ml-0"
              style={{ margin: "16px 0 0 0" }}
            />
          </div>
          <Link
            to="/products"
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

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : (
          <>
            {/* Mobile: horizontally scrollable row */}
            <div className="md:hidden -mx-4 px-4">
              <div
                className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {categories.map((cat, i) => (
                  <div
                    key={cat._id}
                    className="snap-start shrink-0 w-36 sm:w-44"
                  >
                    <CategoryCard category={cat} index={i} />
                  </div>
                ))}
              </div>

              {categories.length > 3 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {Array.from({ length: Math.min(categories.length, 7) }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === 0 ? "bg-saree-gold" : "bg-stone-200"
                        }`}
                      />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Desktop: same grid as FeaturedSection */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {categories.map((cat, i) => (
                <div
                  key={cat._id}
                  className="min-w-0 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CategoryCard category={cat} index={i} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
