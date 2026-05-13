import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { productAPI, categoryAPI, uploadAPI, orderAPI, shippingAPI } from "../utils/api";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const EMPTY_FORM = {
  name: "", description: "", price: "", comparePrice: "",
  categoryName: "", stock: "", fabric: "", occasion: "",
  color: "", length: "5.5 meters", blousePiece: true, isFeatured: false, tags: "",
};

// ── Tiny reusable upload helper (single image → Cloudinary URL)
const uploadSingleImage = async (file) => {
  const fd = new FormData();
  fd.append("images", file);
  const { data } = await uploadAPI.uploadImages(fd);
  return (data.images || [])[0] || "";
};

// ── Dedicated category image upload — uses /api/upload/category endpoint
// stored in saree-store/categories folder on Cloudinary with portrait crop
const uploadCategoryImage = async (file) => {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await uploadAPI.uploadCategoryImage(fd);
  return data.url || "";
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-saree-ivory flex items-center justify-center text-saree-gold text-xl">{icon}</div>
    <div>
      <p className="text-xs text-stone-400 tracking-wider uppercase">{label}</p>
      <p className="text-2xl font-display text-saree-deep mt-0.5">{value}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Category Image Upload Card
// Each category gets its own upload button that fires independently
// ─────────────────────────────────────────────────────────────
const CategoryImageCard = ({ category, onUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState(category.description || "");
  const [origin, setOrigin] = useState(category.origin || "");
  const [savingMeta, setSavingMeta] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(category.image || "");
  const fileRef = useRef();

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Local preview immediately
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadCategoryImage(file);
      await categoryAPI.update(category._id, { image: url });
      onUpdated();
    } catch (err) {
      alert("Image upload failed: " + err.message);
      setPreviewUrl(category.image || "");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    try {
      await categoryAPI.update(category._id, { description: desc, origin });
      onUpdated();
      setEditingDesc(false);
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
      {/* Image area */}
      <div className="relative aspect-[4/3] bg-stone-50 group">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">No image yet</p>
          </div>
        )}

        {/* Upload overlay */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-xs">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-white text-xs font-medium">{previewUrl ? "Change Image" : "Upload Image"}</span>
            </div>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleImageFile}
        />

        {/* Status badge */}
        {previewUrl && !uploading && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">
            ✓ Has Image
          </div>
        )}
        {uploading && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            Uploading…
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-base text-saree-deep leading-tight">{category.name}</h3>
          <button
            onClick={() => setEditingDesc(!editingDesc)}
            className="text-xs text-stone-400 hover:text-saree-gold ml-2 shrink-0 transition-colors"
          >
            {editingDesc ? "Cancel" : "Edit"}
          </button>
        </div>

        {editingDesc ? (
          <div className="space-y-2">
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origin (e.g. Varanasi, Tamil Nadu)"
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-saree-gold"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short description…"
              rows={2}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-saree-gold resize-none"
            />
            <button
              onClick={handleSaveMeta}
              disabled={savingMeta}
              className="w-full py-1.5 bg-saree-deep text-white text-xs rounded-lg hover:bg-saree-deep/90 disabled:opacity-50 transition-all"
            >
              {savingMeta ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <>
            {category.origin && (
              <p className="text-xs text-saree-gold mb-1">{category.origin}</p>
            )}
            <p className="text-xs text-stone-400 line-clamp-2">
              {category.description || <span className="italic">No description — click Edit to add</span>}
            </p>
          </>
        )}

        <div className="mt-3 pt-3 border-t border-stone-50">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-stone-200 rounded-lg text-xs text-stone-400 hover:border-saree-gold hover:text-saree-gold transition-colors disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? "Uploading…" : previewUrl ? "Replace Image" : "Upload Category Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const fileInputRef = useRef();

  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [triggeringId, setTriggeringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/login", { replace: true });
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await productAPI.getAll({ limit: 200 });
      setProducts(data.data || []);
    } catch { setProducts([]); }
    finally { setLoadingProducts(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAllAdmin();
      setCategories(data.data || []);
    } catch { setCategories([]); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await orderAPI.getAllOrders();
      setOrders(data.data || []);
    } catch { setOrders([]); }
    finally { setLoadingOrders(false); }
  };

  useEffect(() => { if (activeTab === "orders") fetchOrders(); }, [activeTab]);

  // ── Category autocomplete
  const handleCategoryInput = (value) => {
    setForm((prev) => ({ ...prev, categoryName: value }));
    setFormError("");
    if (value.trim()) {
      setCategorySuggestions(categories.filter((c) => c.name.toLowerCase().includes(value.toLowerCase())));
      setShowSuggestions(true);
    } else { setShowSuggestions(false); }
  };
  const selectSuggestion = (cat) => { setForm((prev) => ({ ...prev, categoryName: cat.name })); setShowSuggestions(false); };

  // ── Form
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxNew = 5 - existingImages.length;
    if (files.length > maxNew) { setFormError(`Max ${maxNew} new image(s) allowed (5 total)`); return; }
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    setFormError("");
  };

  const removeNewImage = (i) => {
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => { URL.revokeObjectURL(p[i]); return p.filter((_, idx) => idx !== i); });
  };
  const removeExistingImage = (i) => setExistingImages((p) => p.filter((_, idx) => idx !== i));

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "", description: product.description || "",
      price: product.price || "", comparePrice: product.comparePrice || "",
      categoryName: product.category?.name || "", stock: product.stock || "",
      fabric: product.fabric || "", occasion: product.occasion || "",
      color: product.color || "", length: product.length || "5.5 meters",
      blousePiece: product.blousePiece ?? true, isFeatured: product.isFeatured || false,
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    });
    setExistingImages(product.images || []);
    setImageFiles([]); setImagePreviews([]);
    setFormError(""); setFormSuccess("");
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFiles([]); setImagePreviews([]); setExistingImages([]);
    setEditingProduct(null); setFormError(""); setFormSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (!form.name.trim()) { setFormError("Product name is required"); return; }
    if (!form.price) { setFormError("Price is required"); return; }
    if (!form.stock) { setFormError("Stock is required"); return; }
    if (!form.categoryName.trim()) { setFormError("Category name is required"); return; }

    setSubmitting(true);
    try {
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        try {
          const { data: uploadData } = await uploadAPI.uploadImages(fd);
          newImageUrls = uploadData.images || [];
        } finally { setUploadingImages(false); }
      }

      const payload = {
        name: form.name.trim(), description: form.description.trim(),
        price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : 0,
        categoryName: form.categoryName.trim(), stock: Number(form.stock),
        fabric: form.fabric, occasion: form.occasion, color: form.color,
        length: form.length, blousePiece: form.blousePiece, isFeatured: form.isFeatured,
        images: [...existingImages, ...newImageUrls],
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        setFormSuccess("Product updated successfully!");
      } else {
        await productAPI.create(payload);
        setFormSuccess("Product created successfully!");
      }
      resetForm();
      fetchProducts(); fetchCategories();
      setTimeout(() => { setActiveTab("products"); setFormSuccess(""); }, 1800);
    } catch (err) {
      setFormError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await productAPI.delete(id);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) { alert(err.message); }
    finally { setDeletingId(null); }
  };

  const handleTriggerShipment = async (orderId) => {
    setTriggeringId(orderId);
    try {
      await shippingAPI.triggerShipment(orderId);
      await fetchOrders();
      alert("Shipment triggered!");
    } catch (err) { alert("Failed: " + err.message); }
    finally { setTriggeringId(null); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-saree-gold/40 focus:border-saree-gold transition-all";
  const labelClass = "block text-xs font-medium tracking-wider uppercase text-stone-500 mb-1.5";

  // Count how many categories have images
  const catsWithImage = categories.filter((c) => c.image).length;

  return (
    <div className="min-h-screen bg-saree-ivory">
      {/* Top Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-xl text-saree-deep">SweG</span>
            <span className="px-2 py-0.5 bg-saree-gold/10 text-saree-gold text-xs rounded-full font-medium tracking-wider">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500 hidden sm:block">{user?.name}</span>
            <button onClick={() => { logout(); navigate("/"); }} className="text-xs tracking-wider uppercase text-stone-400 hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Products" value={products.length} icon="🧵" />
          <StatCard label="Categories" value={categories.length} icon="📂" />
          <StatCard label="Category Images" value={`${catsWithImage}/${categories.length}`} icon="🖼️" />
          <StatCard label="In Stock" value={products.filter((p) => p.stock > 0).length} icon="✅" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-stone-100 p-1 w-fit mb-6 overflow-x-auto">
          {[
            ["products", "All Products"],
            ["categories", "Category Images"],
            ["orders", "Orders & Shipping"],
            ["add", editingProduct ? "Edit Product" : "Add Product"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => { if (tab !== "add") resetForm(); setActiveTab(tab); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? "bg-saree-deep text-white shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              {label}
              {tab === "categories" && catsWithImage < categories.length && categories.length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {categories.length - catsWithImage} missing
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Products Table ── */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-display text-lg text-saree-deep">Products</h2>
              <button onClick={() => { resetForm(); setActiveTab("add"); }}
                className="flex items-center gap-2 bg-saree-deep text-white text-xs tracking-wider uppercase px-4 py-2 rounded-lg hover:bg-saree-deep/90 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="p-12 text-center text-stone-400">Loading products…</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">🪡</div>
                <h3 className="font-display text-xl text-saree-deep mb-2">No products yet</h3>
                <p className="text-stone-400 text-sm mb-6">Add your first product to get started.</p>
                <button onClick={() => { resetForm(); setActiveTab("add"); }}
                  className="bg-saree-deep text-white text-xs tracking-wider uppercase px-6 py-3 rounded-xl hover:bg-saree-deep/90 transition-all">
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left">
                      {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-3 text-xs text-stone-400 uppercase tracking-wider font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-stone-100" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-300 text-lg">🧵</div>
                            )}
                            <div>
                              <p className="font-medium text-stone-800 leading-tight">{p.name}</p>
                              {p.isFeatured && <span className="text-[10px] text-saree-gold tracking-wider uppercase">Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 capitalize">{p.category?.name || "—"}</td>
                        <td className="px-6 py-4 text-stone-800 font-medium">{formatINR(p.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {p.stock > 0 ? `${p.stock} left` : "Out of stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleEdit(p)} className="text-saree-gold hover:text-saree-deep text-xs tracking-wider uppercase transition-colors">Edit</button>
                            <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                              className="text-red-400 hover:text-red-600 text-xs tracking-wider uppercase transition-colors disabled:opacity-40">
                              {deletingId === p._id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Category Images Tab ── */}
        {activeTab === "categories" && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl text-saree-deep">Category Images</h2>
                <p className="text-sm text-stone-400 mt-1">
                  Upload a representative image for each category. These appear on the homepage "Shop by Weave" section.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                {catsWithImage < categories.length && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-2 rounded-lg">
                    <span>⚠️</span>
                    <span>{categories.length - catsWithImage} categor{categories.length - catsWithImage === 1 ? "y" : "ies"} missing image</span>
                  </div>
                )}
                {catsWithImage === categories.length && categories.length > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-2 rounded-lg">
                    <span>✅</span>
                    <span>All categories have images</span>
                  </div>
                )}
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="font-display text-xl text-saree-deep mb-2">No categories yet</h3>
                <p className="text-stone-400 text-sm">Categories are created automatically when you add products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {categories.map((cat) => (
                  <CategoryImageCard
                    key={cat._id}
                    category={cat}
                    onUpdated={fetchCategories}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Orders & Shipping Tab ── */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-display text-xl text-saree-deep">Orders & Shipping</h2>
              <button onClick={fetchOrders} className="text-xs text-stone-400 hover:text-saree-burgundy flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            {loadingOrders ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-saree-burgundy border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left">
                      {["Order ID", "Customer", "Amount", "Payment", "Status", "Courier / AWB", "Delivery Status", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium text-stone-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statusColors = { created: "bg-amber-50 text-amber-700", processing: "bg-blue-50 text-blue-600", shipped: "bg-indigo-50 text-indigo-700", out_for_delivery: "bg-violet-50 text-violet-700", delivered: "bg-green-50 text-green-700", cancelled: "bg-stone-100 text-stone-500", rto: "bg-red-50 text-red-600" };
                      const statusLabels = { created: "Created", processing: "Processing", shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled", rto: "RTO" };
                      const canTrigger = order.paymentStatus === "paid" && !order.shipmentId;
                      return (
                        <tr key={order._id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-stone-400">#{order._id.slice(-8)}</td>
                          <td className="px-4 py-3">
                            <p className="text-stone-700 text-xs">{order.user?.name || "—"}</p>
                            <p className="text-stone-400 text-xs">{order.user?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3 text-stone-700 whitespace-nowrap">₹{order.totalAmount?.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "failed" ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-500"}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || "bg-stone-100 text-stone-500"}`}>
                              {statusLabels[order.orderStatus] || order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.courier ? (
                              <div>
                                <p className="text-xs text-stone-700">{order.courier}</p>
                                <p className="font-mono text-xs text-stone-400">{order.awbCode || "—"}</p>
                              </div>
                            ) : <span className="text-xs text-stone-300">—</span>}
                          </td>
                          <td className="px-4 py-3 max-w-[140px]">
                            <p className="text-xs text-stone-600 truncate">{order.deliveryStatus || "—"}</p>
                            {order.expectedDelivery && (
                              <p className="text-xs text-stone-400">EDD: {new Date(order.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {canTrigger && (
                                <button onClick={() => handleTriggerShipment(order._id)} disabled={triggeringId === order._id}
                                  className="px-3 py-1.5 rounded-lg bg-saree-burgundy text-white text-xs hover:bg-saree-deep disabled:opacity-50 transition-colors whitespace-nowrap">
                                  {triggeringId === order._id ? "Sending…" : "Ship Now"}
                                </button>
                              )}
                              {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs hover:border-stone-400 transition-colors whitespace-nowrap">
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

        {/* ── Add / Edit Product Form ── */}
        {activeTab === "add" && (
          <div className="bg-white rounded-2xl border border-stone-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl text-saree-deep">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                {editingProduct && <p className="text-xs text-stone-400 mt-1">Editing: {editingProduct.name}</p>}
              </div>
              {editingProduct && (
                <button onClick={resetForm} className="text-xs text-stone-400 hover:text-saree-burgundy tracking-wider uppercase">← Cancel Edit</button>
              )}
            </div>

            {uploadingImages && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm flex items-center gap-3">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full shrink-0" />
                <span>Uploading image(s) to Cloudinary — please wait…</span>
              </div>
            )}
            {formError && <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">{formError}</div>}
            {formSuccess && <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">{formSuccess}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>Product Images (up to 5 total)</label>
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {existingImages.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Image ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border border-stone-200" />
                        <button type="button" onClick={() => removeExistingImage(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        <span className="absolute bottom-1 left-1 text-[9px] bg-black/40 text-white px-1 rounded">Current</span>
                      </div>
                    ))}
                  </div>
                )}
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-saree-gold transition-colors">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" />
                  {imagePreviews.length === 0 ? (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-stone-400">{existingImages.length > 0 ? `Click to add more images (${5 - existingImages.length} slots remaining)` : "Click to upload product images"}</p>
                      <p className="text-xs text-stone-300 mt-1">JPEG, PNG, WEBP · Max 5MB each · Up to 5 images total</p>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt={`New ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border border-stone-200" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                          <span className="absolute bottom-1 left-1 text-[9px] bg-saree-gold/80 text-white px-1 rounded">New</span>
                        </div>
                      ))}
                      {(existingImages.length + imagePreviews.length) < 5 && (
                        <div className="w-24 h-24 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-300 text-2xl">+</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} required placeholder="Banarasi Silk Saree" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} required rows={3} placeholder="Describe the saree, its weave, heritage…" className={inputClass + " resize-none"} />
                </div>
                <div>
                  <label className={labelClass}>Price (₹) *</label>
                  <input type="number" name="price" value={form.price} onChange={handleFormChange} required min="0" placeholder="12500" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Compare Price (₹)</label>
                  <input type="number" name="comparePrice" value={form.comparePrice} onChange={handleFormChange} min="0" placeholder="15000" className={inputClass} />
                </div>

                {/* Dynamic Category Input */}
                <div className="relative">
                  <label className={labelClass}>
                    Category *
                    <span className="ml-2 text-saree-gold font-normal normal-case tracking-normal">(type to search or create new)</span>
                  </label>
                  <input
                    type="text" value={form.categoryName}
                    onChange={(e) => handleCategoryInput(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => { if (form.categoryName) handleCategoryInput(form.categoryName); }}
                    required placeholder="e.g. Kanjeevaram, Banarasi, Cotton Sarees…"
                    className={inputClass} autoComplete="off"
                  />
                  {showSuggestions && categorySuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
                      {categorySuggestions.map((cat) => (
                        <button key={cat._id} type="button" onMouseDown={() => selectSuggestion(cat)}
                          className="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-saree-ivory hover:text-saree-deep transition-colors flex items-center gap-3">
                          {cat.image && <img src={cat.image} alt={cat.name} className="w-7 h-7 rounded object-cover shrink-0" />}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {form.categoryName && !categorySuggestions.find((c) => c.name.toLowerCase() === form.categoryName.toLowerCase()) && (
                    <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                      <span>✨</span> New category "{form.categoryName}" will be created automatically
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Stock *</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleFormChange} required min="0" placeholder="10" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fabric</label>
                  <input name="fabric" value={form.fabric} onChange={handleFormChange} placeholder="Pure Silk" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Occasion</label>
                  <input name="occasion" value={form.occasion} onChange={handleFormChange} placeholder="Wedding, Festive…" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Color</label>
                  <input name="color" value={form.color} onChange={handleFormChange} placeholder="Royal Blue" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Length</label>
                  <input name="length" value={form.length} onChange={handleFormChange} placeholder="5.5 meters" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Tags (comma-separated)</label>
                  <input name="tags" value={form.tags} onChange={handleFormChange} placeholder="silk, bridal, traditional" className={inputClass} />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                {[["blousePiece", "Includes Blouse Piece"], ["isFeatured", "Featured Product"]].map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2.5 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" name={field} checked={form[field]} onChange={handleFormChange} className="sr-only" />
                      <div className={`w-10 h-6 rounded-full transition-colors ${form[field] ? "bg-saree-deep" : "bg-stone-200"}`} />
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form[field] ? "left-5" : "left-1"}`} />
                    </div>
                    <span className="text-sm text-stone-600">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-saree-deep text-white py-3.5 rounded-xl text-sm font-medium tracking-wider uppercase hover:bg-saree-deep/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {uploadingImages ? "Uploading images…" : submitting ? (editingProduct ? "Updating…" : "Creating…") : (editingProduct ? "Update Product" : "Create Product")}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3.5 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition-all">Reset</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
