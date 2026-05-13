import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useData";
import { LoadingSpinner } from "../common/LoadingStates";

// Fallback gradients — rendered only when admin has NOT uploaded a category image yet
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

// Single category card — used on both desktop grid and mobile scroll
const CategoryCard = ({ category, index }) => {
  // category.image is the dedicated Cloudinary URL uploaded by admin via admin panel
  // It is NEVER auto-derived from product images
  const categoryImage = category.image || "";
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative block w-full overflow-hidden"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {/* ── Dedicated category image uploaded by admin ── */}
        {categoryImage ? (
          <img
            src={categoryImage}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              // Image URL broken — show gradient instead
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "block";
            }}
          />
        ) : null}

        {/* ── Gradient fallback (shown when no image uploaded yet) ── */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradient}`}
          style={{ display: categoryImage ? "none" : "block" }}
        />

        {/* Darkening scrim so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Origin badge — e.g. "Varanasi", "Tamil Nadu" */}
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

        {/* Category name + explore label */}
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

  // Don't render the section at all if DB has no categories yet
  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-16 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <p className="font-serif text-sm italic text-saree-gold mb-3 tracking-wide">
            Across India
          </p>
          <h2 className="section-title mb-4">Shop by Weave</h2>
          <div className="divider-gold mb-4" />
          <p className="section-subtitle max-w-xl mx-auto">
            Each region of India holds a unique weaving tradition — explore them
            all
          </p>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : (
          <>
            {/* ── Mobile: horizontally scrollable row of cards ── */}
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

              {/* Scroll hint dots */}
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

            {/* ── Desktop: auto-column grid, max 7 columns ── */}
            <div
              className="hidden md:grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(categories.length, 7)}, minmax(0, 1fr))`,
              }}
            >
              {categories.map((cat, i) => (
                <div
                  key={cat._id}
                  className="animate-fade-in min-w-0"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CategoryCard category={cat} index={i} />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && categories.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/products" className="btn-outline">
              View All Collections
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
