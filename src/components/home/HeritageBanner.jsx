import { Link } from 'react-router-dom';

const HeritageBanner = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden">
          {/* Image */}
          <div className="relative h-80 md:h-auto min-h-[400px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=85"
              alt="Heritage weaving"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-saree-burgundy/20" />
          </div>

          {/* Content */}
          <div className="bg-saree-silk flex items-center p-10 md:p-12 lg:p-16">
            <div>
              <p className="font-serif text-sm italic text-saree-gold mb-4 tracking-wide">
                Est. 2020 · Hyderabad
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-saree-deep leading-tight mb-6">
                Weaving Stories,
                <br />
                <span className="italic">One Saree at a Time</span>
              </h2>
              <div className="w-12 h-px bg-saree-gold mb-6" />
              <p className="font-sans text-sm leading-loose text-stone-600 mb-4">
                We work directly with weaving families across seven states, ensuring fair wages, authentic techniques, and that each saree carries the stories of the hands that made it.
              </p>
              <p className="font-sans text-sm leading-loose text-stone-600 mb-8">
                From the silk looms of Kanchipuram to the cotton fields of Chanderi — we source only the finest, most authentic handlooms India has to offer.
              </p>
              <Link to="/products" className="btn-secondary">
                Discover Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeritageBanner;
