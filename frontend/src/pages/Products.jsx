import Navbar from '../components/Navbar.jsx'; 
import Sidebar from "../components/sidebar.jsx"; 
import { Box, Plus, Edit2, X, AlertTriangle, Menu } from 'lucide-react';
// ... (rest of imports)

// --- Sample Product Data ---
const products = [
  {
    sku: '123123',
    name: 'asda',
    category: 'Keyboard',
    stock: 500,
    threshold: 10,
    price: 12312312.00,
    supplier: 'dasdasd',
    lowStock: false,
  },
  {
    sku: '456456',
    name: 'Wireless Mouse',
    category: 'Mouse',
    stock: 5,
    threshold: 20,
    price: 45.99,
    supplier: 'LogiTech Co.',
    lowStock: true,
  },
  {
    sku: '789789',
    name: '27-inch Monitor',
    category: 'Display',
    stock: 75,
    threshold: 5,
    price: 299.99,
    supplier: 'Visual Dynamics',
    lowStock: false,
  },
];

// --- Product Row Component ---
const ProductRow = ({ product }) => {
    // Determine stock text color based on threshold
    const stockClass = product.stock <= product.threshold 
        ? 'text-red-500 font-bold flex items-center gap-1' 
        : 'text-green-600 font-bold';

    return (
        <div className="grid grid-cols-6 items-center border-t border-gray-100 py-4 px-6 hover:bg-gray-50 transition-colors">
            {/* Name / SKU (Column 1) */}
            <div className="col-span-1 text-sm font-semibold text-gray-800 space-y-0.5">
                <div>{product.name}</div>
                <div className="text-xs text-gray-500">SKU: {product.sku}</div>
            </div>

            {/* Category (Column 2) */}
            <div className="col-span-1">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {product.category}
                </span>
            </div>

            {/* Stock (Column 3) */}
            <div className="col-span-1 text-sm">
                <div className={stockClass}>
                    {product.lowStock && <AlertTriangle size={14} />}
                    {product.stock}
                </div>
                {product.lowStock && (
                    <div className="text-xs text-gray-500">Threshold: {product.threshold}</div>
                )}
            </div>

            {/* Price (Column 4) */}
            <div className="col-span-1 text-sm text-gray-700">
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Supplier (Column 5) */}
            <div className="col-span-1 text-sm text-gray-700 truncate">
                {product.supplier}
            </div>

            {/* Actions (Column 6) */}
            <div className="col-span-1 flex justify-end gap-3 text-gray-500">
                <button title="Edit" className="hover:text-blue-600">
                    <Edit2 size={16} />
                </button>
                <button title="Delete" className="hover:text-red-600">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};


// --- Main Component ---
export default function Products() {
    const handleAddItem = () => {
        alert('Opening Add Item Modal...');
        // TODO: Implement modal or navigation for adding a new item
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            
            {/* Sidebar component */}
            <Sidebar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 p-4 sm:p-8 space-y-6">
                
                {/* FIX 1: Insert Navbar here */}
                <Navbar /> 
                
                {/* FIX 2: Move the original header content below the Navbar */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Box size={28} className="text-blue-500" />
                        Stock Items ({products.length})
                    </h2>
                    
                    <button
                        onClick={handleAddItem}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-md transition-colors"
                    >
                        <Plus size={18} />
                        Add Item
                    </button>
                </div>

                {/* Product Table Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-6 bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider py-3 px-6 border-b">
                        <div className="col-span-1">Name / SKU</div>
                        <div className="col-span-1">Category</div>
                        <div className="col-span-1">Stock</div>
                        <div className="col-span-1">Price</div>
                        <div className="col-span-1">Supplier</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <ProductRow key={product.sku} product={product} />
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
}