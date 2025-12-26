import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/sidebar.jsx";
import { Box, Plus, Edit2, X, Image as ImageIcon } from "lucide-react";
import { 
  listProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct as deleteProductApi 
} from "../api/productsApi.js";

const CATEGORIES = [
  "PC Case",
  "HDD",
  "SSD",
  "Fan",
  "Cooler",
  "RAM",
  "Motherboard",
  "Processor",
  "Graphics Card",
  "Power Supply Unit",
];

const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

function resolveImageUrl(src) {
  if (!src || typeof src !== "string") return null;
  if (src.startsWith("blob:") || src.startsWith("data:") || /^https?:\/\//i.test(src)) {
    return src;
  }
  return BACKEND ? `${BACKEND}${src}` : src;
}

function EmptyRow() {
  return (
    <div className="py-8 text-center text-sm text-slate-500">
      No products yet. Click <span className="font-semibold">Add Item</span> to create one.
    </div>
  );
}

function ProductRow({ p, onEdit, onDelete }) {
  const statusClass =
    p.inStock <= 0
      ? "text-red-600"
      : p.inStock <= 10
      ? "text-yellow-600"
      : "text-green-600";

  const imgSrc = resolveImageUrl(p.imageUrl);

  return (
    <div className="grid grid-cols-12 items-center gap-4 py-4 px-6 border-t border-gray-100 text-center">
      <div className="col-span-1 flex justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.name}
            className="w-12 h-12 object-cover rounded-md mx-auto"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mx-auto">
            <ImageIcon size={18} />
          </div>
        )}
      </div>

      <div className="col-span-2 flex flex-col justify-center">
        <div className="text-sm font-semibold text-slate-800">{p.name}</div>
      </div>

      <div className="col-span-1 flex items-center justify-center text-sm text-slate-800">{p.sku}</div>

      <div className="col-span-2 flex items-center justify-center">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {p.category}
        </span>
      </div>

      <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-slate-800">{p.stock}</div>

      <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-slate-800">{p.inStock}</div>

      <div className="col-span-2 flex items-center justify-center text-sm text-gray-700">
        ₱
        {Number(p.price || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      <div className="col-span-1 flex items-center justify-center text-sm">
        <span className={`${statusClass} font-semibold`}>
          {p.inStock <= 0
            ? "Out of stock"
            : p.inStock <= 10
            ? "Low stock"
            : "In stock"}
        </span>
      </div>

      <div className="col-span-1 flex justify-center gap-3 text-gray-500">
        <button
          onClick={() => onEdit(p)}
          title="Edit"
          className="hover:text-blue-600"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(p)}
          title="Delete"
          className="hover:text-red-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [filtered, setFiltered] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(
    async (limit = perPage) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listProducts({ limit });
        const normalized = (result.data || []).map((p) => ({
          ...p,
          imageUrl: p.imageUrl || (Array.isArray(p.images) && p.images.length ? p.images[0] : null),
        }));
        setProducts(normalized);
        setFiltered(normalized);
      } catch (err) {
        setError(err.message || "Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    },
    [perPage]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditing(p);
    setShowModal(true);
  };

  const requestDeleteProduct = (p) => setDeleteCandidate(p);

  const confirmDeleteProduct = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await deleteProductApi(deleteCandidate.id);
      setProducts((s) => s.filter((x) => x.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    } catch (err) {
      alert(`Delete failed: ${err?.message || err}`);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => setDeleteCandidate(null);

  const saveProduct = async (item, file) => {
    try {
      let updatedProduct;
      if (item.id) updatedProduct = await updateProduct(item.id, item, file);
      else updatedProduct = await createProduct(item, file);

      updatedProduct = {
        ...updatedProduct,
        imageUrl: updatedProduct.imageUrl || (Array.isArray(updatedProduct.images) && updatedProduct.images[0]) || null,
      };

      setProducts((prev) => {
        const idx = prev.findIndex((x) => x.id === updatedProduct.id);
        if (idx !== -1) return prev.map((x) => (x.id === updatedProduct.id ? updatedProduct : x));
        return [updatedProduct, ...prev];
      });
      setShowModal(false);
    } catch (err) {
      alert(`Error saving product: ${err?.message || err}`);
    }
  };

  useEffect(() => {
    setFiltered(products);
  }, [products]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-8 space-y-6">
        <Navbar />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3"><Box size={28} className="text-blue-500" />Products List ({products.length})</h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-md border px-3 py-2 text-center">
              <label className="text-sm text-gray-600 mr-2">Show</label>
              <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="text-sm outline-none">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <label className="text-sm text-gray-600 ml-2">entries</label>
            </div>

            <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md">
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        {error && <div className="text-center py-4 text-red-600 font-medium">{error}</div>}
        {loading && !error && <div className="text-center py-4 text-gray-500">Loading products...</div>}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider py-3 px-6 border-b text-center">
            <div className="col-span-1">Image</div>
            <div className="col-span-2">Product Name</div>
            <div className="col-span-1">SKU</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Stocks</div>
            <div className="col-span-1">In Stock</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 && !loading && !error ? <EmptyRow /> : filtered.slice(0, perPage).map((p) => (
              <ProductRow key={p.id} p={p} onEdit={openEditModal} onDelete={requestDeleteProduct} />
            ))}
          </div>
        </div>
      </div>

      {showModal && <AddEditModal onClose={() => setShowModal(false)} onSave={saveProduct} initial={editing} />}

      {deleteCandidate && (
        <DeleteConfirmModal 
            candidate={deleteCandidate} 
            onCancel={cancelDelete} 
            onConfirm={confirmDeleteProduct} 
            isDeleting={deleting} 
        />
      )}
    </div>
  );
}


// --- NEW DELETE MODAL COMPONENT ---

function DeleteConfirmModal({ candidate, onCancel, onConfirm, isDeleting }) {
    const [mounted, setMounted] = useState(false);

    // Entry animation control
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleConfirm = () => {
        setMounted(false); // Trigger exit animation
        setTimeout(onConfirm, 300); // Wait for animation to finish
    };

    const handleCancel = () => {
        setMounted(false); // Trigger exit animation
        setTimeout(onCancel, 300); // Wait for animation to finish
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* 1. Backdrop with blur and opacity transition */}
            <div 
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 backdrop-blur-sm ${mounted ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleCancel} 
            />

            {/* 2. Modal content with scale/opacity transition */}
            <div 
                className={`relative z-10 w-full max-w-md bg-white rounded-xl p-6 shadow-2xl transition-all duration-300 ease-in-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <h3 className="text-lg font-semibold mb-2">Delete "{candidate.name}" ?</h3>
                <p className="text-sm text-gray-600 mb-4">This action cannot be undone. The product will be permanently deleted.</p>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-md border" disabled={isDeleting}>Cancel</button>
                    <button type="button" onClick={handleConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white flex items-center gap-2" disabled={isDeleting}>
                        {isDeleting ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- ADD/EDIT MODAL ---
function AddEditModal({ onClose, onSave, initial = null }) {
  const [id] = useState(initial?.id ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [inStock, setInStock] = useState(initial?.inStock ?? 0);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl ? resolveImageUrl(initial.imageUrl) : null);
  const [errors, setErrors] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [mounted, setMounted] = useState(false); 

  const inputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
      // Control modal mount/unmount animation
      setMounted(true);
      return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      if (initial?.imageUrl) setPreviewUrl(resolveImageUrl(initial.imageUrl));
      return;
    }
    const u = URL.createObjectURL(selectedImage);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [selectedImage, initial]);

  const validate = () => {
    const e = {};
    if (!name || !String(name).trim()) e.name = "Product name is required.";
    if (!sku || !String(sku).trim()) e.sku = "SKU is required.";
    if (!category) e.category = "Category is required.";
    if (stock === "" || stock === null || isNaN(Number(stock))) e.stock = "Stock is required.";
    if (inStock === "" || inStock === null || isNaN(Number(inStock))) e.inStock = "In stock is required.";
    if (price === "" || price === null || isNaN(Number(price))) e.price = "Price is required.";
    if (!previewUrl) e.image = "Product image is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const resetForm = () => {
    setName("");
    setSku("");
    setCategory(CATEGORIES[0]);
    setStock(0);
    setInStock(0);
    setPrice(0);
    removeImage();
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const item = { id, sku, name: name || "Untitled", category, stock: Number(stock) || 0, inStock: Number(inStock) || 0, price: Number(price) || 0 };
    onSave(item, selectedImage);
  };

  const handleCancelClick = (e) => {
    e?.stopPropagation();
    setShowCancelConfirm(true);
  };

  const confirmCancel = (yes) => {
    setShowCancelConfirm(false);
    if (yes) resetAndClose();
  };

  const handleOverlayClick = () => setShowCancelConfirm(true);

  function resetAndClose() {
    resetForm();
    setMounted(false); 
    setTimeout(onClose, 300); 
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 1. Backdrop with blur and opacity transition */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 backdrop-blur-sm ${mounted ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleOverlayClick} 
      />
      
      {/* 2. Modal content with scale/opacity transition */}
      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-3xl bg-white rounded-xl p-6 shadow-2xl transition-all duration-300 ease-in-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{initial ? "Edit Product" : "Add Product"}</h3>
          <button type="button" onClick={handleCancelClick} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Row 1: Product Name | SKU */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Product Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.name ? "border-red-400" : ""}`} />
            {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">SKU</label>
            <input value={sku} disabled={!!id} onChange={(e) => setSku(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.sku ? "border-red-400" : ""}`} />
            {errors.sku && <div className="text-xs text-red-500 mt-1">{errors.sku}</div>}
          </div>
          
          {/* Row 2: Category | Stock (Warehouse) */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.category ? "border-red-400" : ""}`}>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            {errors.category && <div className="text-xs text-red-500 mt-1">{errors.category}</div>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Stock (Warehouse)</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.stock ? "border-red-400" : ""}`} />
            {errors.stock && <div className="text-xs text-red-500 mt-1">{errors.stock}</div>}
          </div>

          {/* Row 3: IN STOCK (col-span-1) | PRICE (col-span-1) */}
          <div className="grid grid-cols-2 gap-4 col-span-2"> 
            <div> 
                <label className="block text-sm text-gray-600 mb-1">In Stock (Store)</label>
                <input type="number" value={inStock} onChange={(e) => setInStock(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.inStock ? "border-red-400" : ""}`} />
                {errors.inStock && (<div className="text-xs text-red-500 mt-1">{errors.inStock}</div>)}
            </div>
            <div> 
                <label className="block text-sm text-gray-600 mb-1">Price</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full px-3 py-2 border rounded-md ${errors.price ? "border-red-400" : ""}`} />
                {errors.price && (<div className="text-xs text-red-500 mt-1">{errors.price}</div>)}
            </div>
          </div>

          {/* Row 4: Product Image (full width) */}
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Product Image</label>

            {/* Note: Simplified drag/drop handlers by moving logic inline to eliminate helper functions causing declaration conflicts */}
            <div ref={dropRef} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer?.files?.[0]; if (f) { const u = URL.createObjectURL(f); setPreviewUrl(u); setSelectedImage(f); } dropRef.current?.classList.remove("ring-2"); }} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); dropRef.current?.classList.add("ring-2"); }} onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); dropRef.current?.classList.remove("ring-2"); }} onClick={() => inputRef.current?.click()} className={`border border-dashed rounded-lg p-6 flex items-center justify-center cursor-pointer hover:border-gray-400 transition ${errors.image ? "border-red-400" : "border-gray-300"}`} style={{ width: 260, height: 180 }}>
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img src={previewUrl} alt="preview" className="max-h-full max-w-full object-contain rounded-md" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-500" title="Remove image">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="flex justify-center mb-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Drag & Drop Image here or <span className="text-blue-600 underline">Select</span></p>
                </div>
              )}
              <input ref={inputRef} id="singleImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const u = URL.createObjectURL(f); setPreviewUrl(u); setSelectedImage(f); } }} />
            </div>

            {errors.image && <div className="text-xs text-red-500 mt-1">{errors.image}</div>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={handleCancelClick} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Save</button>
        </div>

        {showCancelConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelConfirm(false)} />
            <div className="relative bg-white rounded-lg p-6 shadow-xl w-full max-w-sm z-30">
              <h4 className="text-lg font-semibold mb-3">Are you sure you want to cancel?</h4>
              <p className="text-sm text-gray-600 mb-4">Your changes will be lost.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 rounded-md border">No</button>
                <button onClick={() => confirmCancel(true)} className="px-4 py-2 rounded-md bg-red-600 text-white">Yes</button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}