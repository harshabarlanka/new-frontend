import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI } from "../utils/api";
import { formatPrice } from "../utils/helpers";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [step, setStep] = useState("address"); // 'address' | 'processing' | 'success'
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-saree-deep mb-4">
            Please sign in to checkout
          </p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-saree-deep mb-4">
            Your cart is empty
          </p>
          <Link to="/products" className="btn-primary">
            Browse Collections
          </Link>
        </div>
      </div>
    );
  }

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const required = ["name", "phone", "address", "city", "state", "pincode"];
    for (const f of required) {
      if (!form[f].trim()) {
        setError(`Please fill in ${f}`);
        return;
      }
    }

    try {
      setStep("processing");

      // Step 1: Create internal order
      const { data: orderRes } = await orderAPI.createOrder(form);
      const order = orderRes.data;

      // Step 2: Create Razorpay order
      const { data: payRes } = await paymentAPI.createRazorpayOrder(order._id);
      const { razorpayOrderId, amount, currency, keyId } = payRes.data;

      // Step 3: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error(
          "Failed to load Razorpay. Check your internet connection.",
        );
      }

      // Step 4: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        name: "SweG — Premium Sarees",
        description: `Order #${order._id}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
          email: user.email,
        },
        theme: {
          color: "#8B1A4A",
        },
        handler: async (response) => {
          // Step 5: Verify payment
          try {
            await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });

            setPlacedOrder(order);
            await fetchCart();
            setStep("success");
          } catch (err) {
            setError("Payment verification failed: " + err.message);
            setStep("address");
          }
        },
        modal: {
          ondismiss: () => {
            setStep("address");
            setError("Payment was cancelled.");
          },
        },
      });

      rzp.open();
    } catch (err) {
      setError(err.message || "Something went wrong");
      setStep("address");
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-stone-50">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-saree-deep mb-2">
            Order Placed!
          </h2>
          <p className="font-sans text-stone-500 mb-2">
            Thank you for your purchase.
          </p>
          <p className="font-sans text-xs text-stone-400 mb-8">
            Order ID: <span className="font-mono">{placedOrder?._id}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/orders")} className="btn-primary">
              View My Orders
            </button>
            <Link to="/products" className="btn-outline text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-saree-deep mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-display text-xl text-saree-deep mb-6">
                Shipping Address
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-sans rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInput}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInput}
                    rows={2}
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors resize-none"
                    placeholder="Street, building, area"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInput}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleInput}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-stone-500 uppercase tracking-wider mb-1.5">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleInput}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 font-sans text-sm text-saree-deep focus:outline-none focus:border-saree-burgundy transition-colors"
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={step === "processing"}
                  className="btn-primary w-full py-3 mt-2 disabled:opacity-60"
                >
                  {step === "processing" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatPrice(cart.totalAmount)} with Razorpay`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
              <h2 className="font-display text-xl text-saree-deep mb-5">
                Your Order
              </h2>
              <div className="space-y-4 mb-5">
                {items.map((item) => {
                  const p = item.productId;
                  if (!p) return null;
                  return (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={
                          p.images?.[0] ||
                          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80"
                        }
                        alt={p.name}
                        className="w-14 h-18 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm text-saree-deep line-clamp-2">
                          {p.name}
                        </p>
                        <p className="font-sans text-xs text-stone-400 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                        <p className="font-sans text-sm font-semibold text-saree-gold mt-1">
                          {formatPrice(p.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-stone-100 pt-4 flex justify-between font-display text-lg text-saree-deep">
                <span>Total</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <p className="font-sans text-xs text-stone-400 text-center mt-3">
                Free shipping · Test mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
