// frontend/src/components/vendor/ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { getVendorProducts, addProduct, updateProduct, deleteProduct } from '../../services/vendor';
import { formatPrice } from '../../utils/formatPrice';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    images: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getVendorProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vendor/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
        alert('Product updated successfully!');
      } else {
        await addProduct(productData);
        alert('Product added successfully!');
      }

      setShowModal(false);
      resetForm();
      await fetchProducts();
      await fetchCategories();
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', category: '', price: '', stock: '', images: [] });
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category?._id || product.category,
      price: product.price,
      stock: product.stock,
      images: product.images || [],
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (product) => {
    const action = product.isVisible ? 'hide' : 'show';
    if (confirm(`Are you sure you want to ${action} this product?`)) {
      try {
        await updateProduct(product._id, { isVisible: !product.isVisible });
        alert(`Product ${action}n successfully!`);
        await fetchProducts();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  console.log('Products:', products);

  const handleDelete = async (productId, productName) => {
    if (confirm(`Are you sure you want to PERMANENTLY DELETE "${productName}"? This action cannot be undone!`)) {
      try {
        await deleteProduct(productId);
        alert('Product deleted permanently!');
        await fetchProducts();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Products</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <Package className="mx-auto mb-4" size={48} />
          <p>No products yet. Click "Add Product" to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.description?.substring(0, 50)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {product.category?.name || product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock <= 10 ? 'text-red-500 font-semibold' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.isVisible ? 'badge-success' : 'badge-danger'}`}>
                      {product.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleToggleVisibility(product)} className="text-yellow-500 hover:text-yellow-700" title={product.isVisible ? 'Hide' : 'Show'}>
                        {product.isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => handleDelete(product._id, product.name)} className="text-red-500 hover:text-red-700" title="Delete Permanently">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="input-field"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Category *</label>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      name="category"
                      required
                      className="input-field flex-1"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap"
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category name"
                      className="input-field flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCategoryName.trim()) {
                          setFormData({ ...formData, category: newCategoryName.trim() });
                          setShowNewCategory(false);
                          setNewCategoryName('');
                        }
                      }}
                      className="px-3 py-2 bg-primary text-white rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 py-2 bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {showNewCategory ? 'New category will be available to all vendors' : 'Select existing or click "New" to create'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    className="input-field"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    className="input-field"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;