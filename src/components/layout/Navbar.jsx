import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Collections", path: "/products" },
    { label: "Kanjeevaram", path: "/products?category=kanjeevaram" },
    { label: "Banarasi", path: "/products?category=banarasi" },
    { label: "Our Story", path: "#story" },
  ];

  const isTransparent = isHome && !scrolled && !menuOpen;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-saree-ivory/95 backdrop-blur-sm shadow-sm border-b border-stone-200/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span
              className={`font-display text-2xl md:text-3xl tracking-wide transition-colors duration-300 ${
                isTransparent ? "text-white" : "text-saree-deep"
              }`}
            >
              SweG
            </span>
            <span
              className={`font-serif text-xs tracking-[0.25em] italic transition-colors duration-300 ${
                isTransparent ? "text-white/70" : "text-saree-gold"
              }`}
            >
              premium sarees
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`font-sans text-sm tracking-wider uppercase transition-colors duration-300 hover:text-saree-gold ${
                  isTransparent ? "text-white/90" : "text-stone-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Search icon */}
            <button
              className={`transition-colors duration-300 hover:text-saree-gold ${
                isTransparent ? "text-white" : "text-stone-700"
              }`}
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart icon */}
            <Link
              to="/cart"
              className={`relative transition-colors duration-300 hover:text-saree-gold ${
                isTransparent ? "text-white" : "text-stone-700"
              }`}
              aria-label="Cart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-saree-burgundy text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth: desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`text-xs tracking-wider uppercase font-medium transition-colors hover:text-saree-gold ${
                        isTransparent ? "text-white/90" : "text-stone-700"
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className={`text-xs tracking-wider uppercase font-medium transition-colors hover:text-saree-gold ${
                      isTransparent ? "text-white/90" : "text-stone-700"
                    }`}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`text-xs tracking-wider uppercase transition-colors hover:text-saree-gold ${
                      isTransparent ? "text-white/70" : "text-stone-500"
                    }`}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`text-xs tracking-wider uppercase font-medium transition-colors hover:text-saree-gold ${
                    isTransparent ? "text-white/90" : "text-stone-700"
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden transition-colors duration-300 ${
                isTransparent ? "text-white" : "text-stone-700"
              }`}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-saree-ivory border-t border-stone-200 animate-fade-in">
          <nav className="px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="font-sans text-sm tracking-wider uppercase text-stone-700 hover:text-saree-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-stone-200 flex flex-col gap-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm tracking-wider uppercase text-stone-700 hover:text-saree-gold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm tracking-wider uppercase text-stone-500 text-left hover:text-red-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm tracking-wider uppercase text-stone-700 hover:text-saree-gold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm tracking-wider uppercase text-saree-gold"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
