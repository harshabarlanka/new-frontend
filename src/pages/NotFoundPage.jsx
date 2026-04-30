import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-saree-ivory">
      <div className="text-center px-4">
        <div className="font-display text-[10rem] leading-none text-stone-100 select-none">404</div>
        <div className="-mt-12 relative z-10">
          <h1 className="font-display text-4xl text-saree-deep mb-3">Page not found</h1>
          <p className="font-serif italic text-stone-400 mb-8">
            This saree seems to have slipped away...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/products" className="btn-outline">Browse Sarees</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
