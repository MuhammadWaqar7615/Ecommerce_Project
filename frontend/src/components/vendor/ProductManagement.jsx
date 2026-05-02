import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Upload, X, Image } from 'lucide-react';
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
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Check file size (max 5MB)
        // if (file.size > 5 * 1024 * 1024) {
        //   alert('Image size should be less than 5MB');
        //   return;
        // }

        setUploading(true);
        const formDataImg = new FormData();
        formDataImg.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/vendor/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataImg
            });
            const result = await response.json();

            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, result.data.imageUrl]
                }));
                alert('Image uploaded successfully!');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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

    //   const handleEdit = (product) => {
    //     setEditingProduct(product);
    //     setFormData({
    //       name: product.name,
    //       description: product.description,
    //       category: product.category?._id || product.category,
    //       price: product.price,
    //       stock: product.stock,
    //       images: product.images || [],
    //     });
    //     setShowModal(true);
    //   };

    const handleEdit = (product) => {
        navigate(`/vendor/products/edit/${product._id}`);
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
                <button onClick={() => navigate('/vendor/products/add')} className="btn-primary flex items-center gap-2">
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
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
                                        {product.images && product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                <Image size={20} className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
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

        </div>
    );
};

export default ProductManagement;