const testimonials = [
  {
    id: 1,
    name: "Priya Krishnamurthy",
    location: "Chennai",
    text: "I wore the Kanjeevaram from SweG at my sister's wedding and received compliments all evening. The quality is exceptional — you can feel the authenticity in every thread.",
    rating: 5,
    saree: "Royal Crimson Kanjeevaram",
  },
  {
    id: 2,
    name: "Anjali Mehta",
    location: "Mumbai",
    text: "The Banarasi silk arrived beautifully packaged. The zari work is breathtaking and the silk has that rich, heavy feel you only get with authentic handloom. Will definitely order again.",
    rating: 5,
    saree: "Midnight Blue Banarasi Brocade",
  },
  {
    id: 3,
    name: "Sudha Rao",
    location: "Hyderabad",
    text: "As someone who grew up in Telangana, I can vouch for the authenticity of their Pochampally ikat. The patterns are crisp and the colors don't bleed even after washing.",
    rating: 5,
    saree: "Turquoise Pochampally Ikat",
  },
  {
    id: 4,
    name: "Kavita Nair",
    location: "Kochi",
    text: "Ordered the Uppada silk for my anniversary dinner. It's incredibly lightweight yet looks so grand. My husband said I looked like a queen. That's the magic of a good saree!",
    rating: 5,
    saree: "Gold Uppada Jamdani Silk",
  },
];

const StarFill = () => (
  <svg className="w-4 h-4 text-saree-gold fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-saree-deep overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-serif text-sm italic text-saree-gold mb-3 tracking-wide">
            Real Stories
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-white font-normal mb-4">
            Loved by Women Across India
          </h2>
          <div className="divider-gold mb-4" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="bg-white/5 border border-white/10 p-6 animate-fade-in hover:bg-white/10 transition-colors duration-300"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <StarFill key={j} />
                ))}
              </div>

              {/* Quote */}
              <p className="font-serif text-sm leading-relaxed text-stone-300 italic mb-6">
                "{t.text}"
              </p>

              {/* Divider */}
              <div className="w-8 h-px bg-saree-gold/40 mb-4" />

              {/* Customer */}
              <div>
                <p className="font-sans font-medium text-sm text-white">
                  {t.name}
                </p>
                <p className="font-sans text-xs text-stone-400 mt-0.5">
                  {t.location}
                </p>
                <p className="font-serif text-xs italic text-saree-gold mt-2">
                  {t.saree}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
          {[
            { icon: "🧵", label: "Handwoven", desc: "By master artisans" },
            { icon: "✓", label: "Authentic", desc: "GI tagged fabrics" },
            {
              icon: "🚚",
              label: "Free Shipping",
              desc: "On orders above ₹5000",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-sans text-sm font-medium text-white">
                {item.label}
              </p>
              <p className="font-sans text-xs text-stone-400 mt-1">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
