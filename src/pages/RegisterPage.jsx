import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-saree-ivory flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="font-display text-4xl text-saree-deep tracking-wide">Aavaran</span>
            <p className="font-serif text-xs tracking-[0.25em] italic text-saree-gold mt-1">premium sarees</p>
          </Link>
          <h1 className="mt-8 font-display text-2xl text-saree-deep">Create Account</h1>
          <p className="mt-1 text-stone-500 text-sm">Join our community of saree lovers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Priya Sharma"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-saree-deep text-white py-3.5 rounded-xl text-sm font-medium tracking-wider uppercase hover:bg-saree-deep/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-saree-gold font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
