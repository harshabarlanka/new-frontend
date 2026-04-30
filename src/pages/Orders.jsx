import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI, shippingAPI } from '../utils/api';
import { formatPrice } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingStates';

// ─── Status badge helpers ─────────────────────────────────────────────────────
const orderStatusConfig = {
  created:          { label: 'Order Placed',      color: 'bg-amber-100 text-amber-700' },
  processing:       { label: 'Processing',         color: 'bg-blue-50 text-blue-600' },
  shipped:          { label: 'Shipped',            color: 'bg-indigo-100 text-indigo-700' },
  out_for_delivery: { label: 'Out for Delivery',   color: 'bg-violet-100 text-violet-700' },
  delivered:        { label: 'Delivered',          color: 'bg-green-100 text-green-700' },
  cancelled:        { label: 'Cancelled',          color: 'bg-stone-100 text-stone-500' },
  rto:              { label: 'Returned (RTO)',      color: 'bg-red-100 text-red-600' },
};

const paymentColors = {
  pending: 'bg-stone-100 text-stone-600',
  paid:    'bg-green-100 text-green-700',
  failed:  'bg-red-100 text-red-600',
};

// ─── Tracking Modal ────────────────────────────────────────────────────────────
const TrackingModal = ({ orderId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [data, setData]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await shippingAPI.trackOrder(orderId);
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-display text-xl text-saree-deep">Track Shipment</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              {/* Status summary */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-stone-400 uppercase tracking-wide">Status</span>
                  <span className="font-sans text-sm font-medium text-saree-deep">
                    {data.deliveryStatus || 'Processing'}
                  </span>
                </div>
                {data.courier && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-stone-400 uppercase tracking-wide">Courier</span>
                    <span className="font-sans text-sm text-stone-600">{data.courier}</span>
                  </div>
                )}
                {data.awbCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-stone-400 uppercase tracking-wide">AWB</span>
                    <span className="font-mono text-xs text-stone-500">{data.awbCode}</span>
                  </div>
                )}
                {data.currentLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-stone-400 uppercase tracking-wide">Location</span>
                    <span className="font-sans text-sm text-stone-600">{data.currentLocation}</span>
                  </div>
                )}
                {data.expectedDelivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-stone-400 uppercase tracking-wide">EDD</span>
                    <span className="font-sans text-sm font-medium text-saree-gold">
                      {new Date(data.expectedDelivery).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* External tracking link */}
              {data.trackingUrl && (
                <a
                  href={data.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-saree-burgundy text-saree-burgundy text-sm font-sans hover:bg-saree-burgundy hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Track on Shiprocket
                </a>
              )}

              {/* Activity timeline */}
              {data.activities && data.activities.length > 0 && (
                <div>
                  <p className="text-xs font-sans text-stone-400 uppercase tracking-wider mb-3">Activity</p>
                  <div className="space-y-3">
                    {data.activities.map((act, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-saree-burgundy' : 'bg-stone-300'}`} />
                          {i < data.activities.length - 1 && (
                            <div className="w-px bg-stone-200 flex-1 mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="font-sans text-sm text-stone-700">{act.activity}</p>
                          {act.location && (
                            <p className="font-sans text-xs text-stone-400">{act.location}</p>
                          )}
                          <p className="font-sans text-xs text-stone-400 mt-0.5">{act.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!data.awbCode && (
                <p className="text-sm font-sans text-stone-500 text-center py-4">
                  Tracking details will appear once the shipment is picked up by the courier.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await orderAPI.getMyOrders();
        setOrders(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-saree-deep mb-4">Please sign in to view orders</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-stone-50">
      {trackingOrderId && (
        <TrackingModal orderId={trackingOrderId} onClose={() => setTrackingOrderId(null)} />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-saree-deep mb-2">My Orders</h1>
        <p className="font-sans text-stone-500 mb-10">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 text-stone-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-display text-2xl text-saree-deep mb-3">No orders yet</p>
            <p className="font-sans text-stone-500 mb-8">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary">Explore Collections</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = orderStatusConfig[order.orderStatus] || orderStatusConfig.created;
              const canTrack = order.paymentStatus === 'paid';

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-sans text-xs text-stone-400 mb-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                      <p className="font-mono text-xs text-stone-400">#{order._id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${paymentColors[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-sans ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Shipping info strip */}
                  {(order.courier || order.deliveryStatus) && (
                    <div className="px-6 py-2 bg-indigo-50 border-y border-indigo-100 flex items-center gap-3 flex-wrap">
                      {order.courier && (
                        <span className="font-sans text-xs text-indigo-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                          </svg>
                          {order.courier}
                        </span>
                      )}
                      {order.deliveryStatus && (
                        <span className="font-sans text-xs text-indigo-500">{order.deliveryStatus}</span>
                      )}
                      {order.expectedDelivery && (
                        <span className="font-sans text-xs text-indigo-500 ml-auto">
                          EDD: {new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Items preview */}
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item._id} className="flex items-center gap-2">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80'}
                            alt={item.name}
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-16 rounded-lg bg-stone-100 flex items-center justify-center text-xs text-stone-500 font-sans">
                          +{order.items.length - 3}
                        </div>
                      )}
                      <div className="ml-2 flex-1">
                        <p className="font-sans text-sm text-stone-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-display text-lg text-saree-deep">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>

                      {/* Track Order button */}
                      {canTrack && (
                        <button
                          onClick={() => setTrackingOrderId(order._id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saree-burgundy text-white text-xs font-sans hover:bg-saree-deep transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Track Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    className="w-full px-6 py-3 border-t border-stone-100 text-xs font-sans text-stone-400 hover:text-saree-burgundy hover:bg-stone-50 transition-colors flex items-center justify-center gap-1"
                  >
                    {expanded === order._id ? 'Hide details' : 'View details'}
                    <svg
                      className={`w-3 h-3 transition-transform ${expanded === order._id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded details */}
                  {expanded === order._id && (
                    <div className="px-6 pb-6 border-t border-stone-100 pt-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-4">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80'}
                            alt={item.name}
                            className="w-14 h-18 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="font-sans text-sm text-saree-deep">{item.name}</p>
                            <p className="font-sans text-xs text-stone-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-sans text-sm font-medium text-saree-gold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}

                      {order.shippingAddress?.address && (
                        <div className="mt-4 pt-4 border-t border-stone-100">
                          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-1">Shipped to</p>
                          <p className="font-sans text-sm text-stone-600">
                            {order.shippingAddress.name} · {order.shippingAddress.address},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                        </div>
                      )}

                      {order.awbCode && (
                        <div className="mt-2 pt-4 border-t border-stone-100">
                          <p className="font-sans text-xs text-stone-400 uppercase tracking-wider mb-1">Tracking</p>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-xs text-stone-500">AWB: {order.awbCode}</p>
                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-sans text-saree-burgundy hover:underline"
                              >
                                Track on Shiprocket →
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
