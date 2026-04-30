import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  productAPI,
  categoryAPI,
  uploadAPI,
  orderAPI,
  shippingAPI,
} from "../utils/api";

// ─── Helpers ────────────────────────────────────────────────────────────────
const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  stock: "",
  fabric: "",
  occasion: "",
  color: "",
  length: "5.5 meters",
  blousePiece: true,
  isFeatured: false,
  tags: "",
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-saree-ivory flex items-center justify-center text-saree-gold text-xl">
      {icon}
    </div>
    <div>
      <p className="text-xs text-stone-400 tracking-wider uppercase">{label}</p>
      <p className="text-2xl font-display text-saree-deep mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();

  // Tab
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'orders' | 'add'

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [triggeringId, setTriggeringId] = useState(null);
  const [trackingData, setTrackingData] = useState({});

  // Delete
  const [deletingId, setDeletingId] = useState(null);

  // ── Auth guard
  useEffect(() => {
    if (!isAdmin) navigate("/login", { replace: true });
  }, [isAdmin, navigate]);

  // ── Fetch data
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await productAPI.getAll({ limit: 100 });
      setProducts(data.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    categoryAPI.getAll().then(({ data }) => setCategories(data.data || []));
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await orderAPI.getAllOrders();
      setOrders(data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const handleTriggerShipment = async (orderId) => {
    setTriggeringId(orderId);
    try {
      await shippingAPI.triggerShipment(orderId);
      await fetchOrders();
      alert("Shipment triggered successfully!");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setTriggeringId(null);
    }
  };

  // ── Form handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFormError("Maximum 5 images allowed");
      return;
    }
    setImageFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
    setFormError("");
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.name || !form.price || !form.category || !form.stock) {
      setFormError("Name, price, category and stock are required");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload images first (if any)
      let uploadedPaths = [];
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        const { data: uploadData } = await uploadAPI.uploadImages(fd);
        uploadedPaths = uploadData.images || [];
      }

      // 2. Create product
      const payload = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : 0,
        stock: Number(form.stock),
        images: uploadedPaths,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      await productAPI.create(payload);
      setFormSuccess("Product created successfully!");
      setForm(EMPTY_FORM);
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchProducts();
      setTimeout(() => {
        setActiveTab("products");
        setFormSuccess("");
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setDeletingId(id);
    try {
      await productAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all";
  const labelClass =
    "block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5";

  return (
    <div className="min-h-screen bg-saree-ivory">
      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl text-saree-deep">SweG</span>
            <span className="px-2 py-0.5 bg-saree-gold/10 text-saree-gold text-xs rounded-full font-medium tracking-wider">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-xs tracking-wider uppercase text-stone-400 hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Products" value={products.length} icon="🧵" />
          <StatCard label="Categories" value={categories.length} icon="📂" />
          <StatCard
            label="In Stock"
            value={products.filter((p) => p.stock > 0).length}
            icon="✅"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-stone-100 p-1 w-fit mb-6">
          {[
            ["products", "All Products"],
            ["orders", "Orders & Shipping"],
            ["add", "Add Product"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-saree-deep text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Products Table ── */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-display text-lg text-saree-deep">Products</h2>
              <button
                onClick={() => setActiveTab("add")}
                className="flex items-center gap-2 bg-saree-deep text-white text-xs tracking-wider uppercase px-4 py-2 rounded-lg hover:bg-saree-deep/90 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="p-12 text-center text-stone-400">
                Loading products…
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-stone-400">
                No products yet. Add your first one!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left">
                      <th className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Product
                      </th>
                      <th className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Category
                      </th>
                      <th className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Price
                      </th>
                      <th className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {products.map((p) => (
                      <tr
                        key={p._id}
                        className="hover:bg-stone-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img
                                src={
                                  p.images[0].startsWith("http")
                                    ? p.images[0]
                                    : `${API_BASE}${p.images[0]}`
                                }
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-300 text-lg">
                                🧵
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-stone-800 leading-tight">
                                {p.name}
                              </p>
                              {p.isFeatured && (
                                <span className="text-[10px] text-saree-gold tracking-wider uppercase">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 capitalize">
                          {p.category?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-800 font-medium">
                          {formatINR(p.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.stock > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            className="text-red-400 hover:text-red-600 text-xs tracking-wider uppercase transition-colors disabled:opacity-40"
                          >
                            {deletingId === p._id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Orders & Shipping Tab ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-display text-xl text-saree-deep">
                Orders & Shipping
              </h2>
              <button
                onClick={fetchOrders}
                className="text-xs font-sans text-stone-400 hover:text-saree-burgundy flex items-center gap-1"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-saree-burgundy border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-sans text-sm">
                No orders found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left">
                      {[
                        "Order ID",
                        "Customer",
                        "Amount",
                        "Payment",
                        "Status",
                        "Courier / AWB",
                        "Delivery Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statusColors = {
                        created: "bg-amber-50 text-amber-700",
                        processing: "bg-blue-50 text-blue-600",
                        shipped: "bg-indigo-50 text-indigo-700",
                        out_for_delivery: "bg-violet-50 text-violet-700",
                        delivered: "bg-green-50 text-green-700",
                        cancelled: "bg-stone-100 text-stone-500",
                        rto: "bg-red-50 text-red-600",
                      };
                      const statusLabels = {
                        created: "Created",
                        processing: "Processing",
                        shipped: "Shipped",
                        out_for_delivery: "Out for Delivery",
                        delivered: "Delivered",
                        cancelled: "Cancelled",
                        rto: "RTO",
                      };
                      const canTrigger =
                        order.paymentStatus === "paid" && !order.shipmentId;

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-stone-400">
                            #{order._id.slice(-8)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-sans text-stone-700 text-xs">
                              {order.user?.name || "—"}
                            </p>
                            <p className="font-sans text-stone-400 text-xs">
                              {order.user?.email || ""}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-sans text-stone-700 whitespace-nowrap">
                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : order.paymentStatus === "failed"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || "bg-stone-100 text-stone-500"}`}
                            >
                              {statusLabels[order.orderStatus] ||
                                order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.courier ? (
                              <div>
                                <p className="font-sans text-xs text-stone-700">
                                  {order.courier}
                                </p>
                                <p className="font-mono text-xs text-stone-400">
                                  {order.awbCode || "—"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[140px]">
                            <p className="font-sans text-xs text-stone-600 truncate">
                              {order.deliveryStatus || "—"}
                            </p>
                            {order.expectedDelivery && (
                              <p className="font-sans text-xs text-stone-400">
                                EDD:{" "}
                                {new Date(
                                  order.expectedDelivery,
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {canTrigger && (
                                <button
                                  onClick={() =>
                                    handleTriggerShipment(order._id)
                                  }
                                  disabled={triggeringId === order._id}
                                  className="px-3 py-1.5 rounded-lg bg-saree-burgundy text-white text-xs font-sans hover:bg-saree-deep disabled:opacity-50 transition-colors whitespace-nowrap"
                                >
                                  {triggeringId === order._id
                                    ? "Sending…"
                                    : "Ship Now"}
                                </button>
                              )}
                              {order.trackingUrl && (
                                <a
                                  href={order.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-sans hover:border-stone-400 transition-colors whitespace-nowrap"
                                >
                                  Track
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Add Product Form ── */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl border border-stone-100 p-8">
            <h2 className="font-display text-xl text-saree-deep mb-6">
              Add New Product
            </h2>

            {formError && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>Product Images (up to 5)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-saree-gold transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                  />
                  {imagePreviews.length === 0 ? (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-stone-400">
                        Click to upload product images
                      </p>
                      <p className="text-xs text-stone-300 mt-1">
                        JPEG, PNG, WEBP · Max 5MB each · Up to 5 images
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-xl border border-stone-200"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(i);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className="w-24 h-24 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-300 text-2xl">
                        +
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Banarasi Silk Saree"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    required
                    rows={3}
                    placeholder="Describe the saree, its weave, heritage…"
                    className={inputClass + " resize-none"}
                  />
                </div>

                <div>
                  <label className={labelClass}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    placeholder="12500"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Compare Price (₹)</label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={form.comparePrice}
                    onChange={handleFormChange}
                    min="0"
                    placeholder="15000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleFormChange}
                    required
                    min="0"
                    placeholder="10"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Fabric</label>
                  <input
                    name="fabric"
                    value={form.fabric}
                    onChange={handleFormChange}
                    placeholder="Pure Silk"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Occasion</label>
                  <input
                    name="occasion"
                    value={form.occasion}
                    onChange={handleFormChange}
                    placeholder="Wedding, Festive…"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Color</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleFormChange}
                    placeholder="Royal Blue"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Length</label>
                  <input
                    name="length"
                    value={form.length}
                    onChange={handleFormChange}
                    placeholder="5.5 meters"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Tags (comma-separated)</label>
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleFormChange}
                    placeholder="silk, bridal, traditional"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                {[
                  ["blousePiece", "Includes Blouse Piece"],
                  ["isFeatured", "Featured Product"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        name={field}
                        checked={form[field]}
                        onChange={handleFormChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${form[field] ? "bg-saree-deep" : "bg-stone-200"}`}
                      />
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form[field] ? "left-5" : "left-1"}`}
                      />
                    </div>
                    <span className="text-sm text-stone-600">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-saree-deep text-white py-3.5 rounded-xl text-sm font-medium tracking-wider uppercase hover:bg-saree-deep/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating product…" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setImageFiles([]);
                    setImagePreviews([]);
                    setFormError("");
                  }}
                  className="px-6 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
