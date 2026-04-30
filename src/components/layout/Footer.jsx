import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-saree-deep text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-3xl text-white mb-2">SweG</h3>
            <p className="font-serif text-sm italic text-saree-gold mb-4">
              premium sarees
            </p>
            <p className="font-sans text-sm leading-relaxed text-stone-400">
              Celebrating India's rich textile heritage through hand-woven
              sarees crafted by master artisans.
            </p>
            <div className="flex gap-4 mt-6">
              {["Instagram", "Pinterest", "Facebook"].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 border border-stone-600 flex items-center justify-center text-stone-400 hover:border-saree-gold hover:text-saree-gold transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs font-sans">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-white mb-6">
              Collections
            </h4>
            <ul className="space-y-3">
              {[
                "Kanjeevaram",
                "Banarasi",
                "Pochampally",
                "Gadwal",
                "Uppada",
                "Bandhani",
                "Chanderi",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${cat.toLowerCase()}`}
                    className="font-sans text-sm text-stone-400 hover:text-saree-gold transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-white mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                "Our Story",
                "Artisans",
                "Sustainability",
                "Press",
                "Careers",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-sans text-sm text-stone-400 hover:text-saree-gold transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-white mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {[
                "Shipping Policy",
                "Returns & Exchange",
                "Care Instructions",
                "Size Guide",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="font-sans text-sm text-stone-400 hover:text-saree-gold transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="font-sans text-xs text-stone-500 mb-2">
                Need help?
              </p>
              <a
                href="mailto:hello@SweG.in"
                className="font-sans text-sm text-saree-gold hover:text-white transition-colors"
              >
                hello@SweG.in
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-stone-500">
            © {new Date().getFullYear()} SweG. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="font-sans text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="font-sans text-xs text-stone-500 hover:text-stone-300 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
