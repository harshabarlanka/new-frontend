import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useData";
import { LoadingSpinner } from "../common/LoadingStates";

const categoryImages = {
  kanjeevaram:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  banarasi:
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
  pochampally:
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
  gadwal:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  uppada:
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
  bandhani:
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
  chanderi:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
};

const CategoryCard = ({ category }) => {
  const image = categoryImages[category.slug] || category.image;

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative overflow-hidden aspect-[3/4] block w-full"
    >
      <img
        src={image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-saree-deep/80 via-saree-deep/20 to-transparent" />

      {/* Origin tag */}
      {category.origin && (
        <div className="absolute top-3 right-3">
          <span className="font-sans text-xs tracking-wider text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1">
            {category.origin}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-display text-xl text-white mb-1">
          {category.name}
        </h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-sans text-xs tracking-widest uppercase text-saree-gold">
            Explore
          </span>
          <svg
            className="w-3 h-3 text-saree-gold"
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
    </Link>
  );
};

const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <div
                key={cat._id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-outline">
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
