const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-stone-200 skeleton" />
    <div className="pt-4 space-y-2">
      <div className="h-3 w-20 bg-stone-200 rounded" />
      <div className="h-5 w-3/4 bg-stone-200 rounded" />
      <div className="h-3 w-1/2 bg-stone-200 rounded" />
      <div className="h-4 w-1/3 bg-stone-200 rounded mt-3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-2 border-stone-200 border-t-saree-gold rounded-full animate-spin`} />
    </div>
  );
};

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <p className="font-sans text-stone-600 mb-4">{message || 'Something went wrong.'}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-outline text-xs">
        Try Again
      </button>
    )}
  </div>
);

export default ProductSkeleton;
