import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/sidebar.jsx";
import { TrendingDown, History } from "lucide-react";
import { listProducts } from "../api/productsApi.js";

export default function RecordSale() {
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    salePrice: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });
  
  const [products, setProducts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listProducts({ limit: 1000 });
        setProducts(result.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setFormData({ ...formData, product: productId });
    
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setMaxAvailable(selectedProduct.inStock || 0);
      setFormData(prev => ({ 
        ...prev, 
        product: productId,
        salePrice: selectedProduct.price || '' 
      }));
    } else {
      setMaxAvailable(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.product) {
      alert('Please select a product');
      return;
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    if (Number(formData.quantity) > maxAvailable) {
      alert(`Quantity exceeds available stock (${maxAvailable})`);
      return;
    }

    if (!formData.salePrice || formData.salePrice <= 0) {
      alert('Please enter a valid sale price');
      return;
    }
    
    const selectedProduct = products.find(p => p.id === formData.product);
    
    const saleRecord = {
      id: Date.now(),
      date: formData.transactionDate,
      productId: formData.product,
      productName: selectedProduct?.name || 'Unknown',
      sku: selectedProduct?.sku || 'N/A',
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.salePrice),
      totalSale: Number(formData.quantity) * Number(formData.salePrice)
    };
    
    console.log('Sale data:', saleRecord);
    setSalesHistory(prev => [saleRecord, ...prev]);
    alert('Sale recorded successfully!');
    
    setFormData({
      product: '',
      quantity: '',
      salePrice: '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setMaxAvailable(0);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 space-y-6">
          {/* Record Sale Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <TrendingDown size={24} className="text-red-500" />
              <h1 className="text-xl font-bold text-gray-800">Record New Sale</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-xs uppercase tracking-wide">
                      Product
                    </label>
                    <select
                      value={formData.product}
                      onChange={handleProductChange}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">
                        {loading ? 'Loading...' : 'Select a product'}
                      </option>
                      {products
                        .filter(p => p.inStock > 0)
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.sku} (Stock: {product.inStock})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-xs uppercase tracking-wide">
                      Transaction Date
                    </label>
                    <input
                      type="date"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-xs uppercase tracking-wide">
                      Quantity Sold
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max={maxAvailable}
                      disabled={!formData.product}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max: {maxAvailable}</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-xs uppercase tracking-wide">
                      Sale Price (Unit)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                      disabled={!formData.product}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>+</span>
                      Complete Sale
                    </button>
                  </div>
                </div>

                {formData.quantity && formData.salePrice && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₱{(Number(formData.quantity) * Number(formData.salePrice)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sales History Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <History size={24} className="text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">
                Sales History ({salesHistory.length})
              </h2>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider py-2 px-4 border-b">
                <div>Date</div>
                <div>Item</div>
                <div className="text-center">QTY</div>
                <div className="text-right">Total Sale</div>
              </div>

              <div className="divide-y divide-gray-100">
                {salesHistory.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No sales recorded yet.
                  </div>
                ) : (
                  salesHistory.map((sale) => (
                    <div key={sale.id} className="grid grid-cols-4 items-center gap-4 py-3 px-4 hover:bg-gray-50 transition-colors">
                      <div className="text-xs text-gray-700">
                        {new Date(sale.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{sale.productName}</div>
                        <div className="text-xs text-gray-500">
                          Unit: ₱{Number(sale.unitPrice).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <span className={`text-sm font-semibold ${sale.quantity < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                          {sale.quantity}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-base font-bold ${sale.totalSale < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₱{Number(sale.totalSale).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}