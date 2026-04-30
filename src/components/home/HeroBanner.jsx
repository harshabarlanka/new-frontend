import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    // ✅ FIXED: Use svh for mobile viewport height (avoids browser-chrome overflow)
    <section className="relative h-svh min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=90"
          alt="Saree Collection Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-saree-deep/80 via-saree-deep/50 to-transparent" />
      </div>

      {/* Decorative vertical text */}
      <div className="absolute right-0 pr-6 top-1/2 -translate-y-1/2 hidden lg:block overflow-hidden">
        <span
          className="font-serif text-xs tracking-[0.4em] text-white/40 uppercase"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Handwoven Heritage
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl animate-slide-up">
          <p className="font-serif text-sm italic text-saree-gold mb-4 tracking-wider">
            New Collection 2025
          </p>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-none mb-6">
            Drape Yourself
            <br />
            <span className="italic text-saree-gold">in Tradition</span>
          </h1>

          {/* <p className="font-sans text-base text-white/75 leading-relaxed mb-10 max-w-md">
            Handcrafted by India's finest weavers — each saree carries centuries of artistry, culture, and soul.
          </p> */}

          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="btn-primary">
              Explore Collection
            </Link>
            <Link
              to="/products?featured=true"
              className="inline-flex items-center gap-2 font-sans text-sm tracking-wider uppercase text-white border-b border-white/40 pb-0.5 hover:border-saree-gold hover:text-saree-gold transition-colors duration-300"
            >
              Featured Picks
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
        </div>

        {/* Stats */}
        {/* <div className="absolute bottom-12 left-4 sm:left-6 lg:left-8 flex gap-8 md:gap-12">
          {[
            { value: '500+', label: 'Sarees' },
            { value: '7', label: 'Categories' },
            { value: '1000+', label: 'Happy Customers' },
          ].map((stat) => (
            <div key={stat.label} className="text-white">
              <div className="font-display text-2xl md:text-3xl">{stat.value}</div>
              <div className="font-sans text-xs tracking-widest uppercase text-white/60">{stat.label}</div>
            </div>
          ))}
        </div> */}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-1/2 translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/40" />
        <span className="font-sans text-xs tracking-widest uppercase text-white/40">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default HeroBanner;
