import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import { getAllCategories, updateCategory, deleteCategory } from '../../services/admin';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id, newName) => {
        if (!newName.trim()) return;
        try {
            await updateCategory(id, { name: newName.trim() });
            setEditingId(null);
            await fetchCategories();
            alert('Category updated successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (confirm(`Delete category "${name}"? This will NOT delete products, but products will lose this category.`)) {
            try {
                await deleteCategory(id);
                await fetchCategories();
                alert('Category deleted successfully!');
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading categories...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold">Category Management</h2>
                <p className="text-sm text-gray-500">Vendors can create new categories when adding products</p>
            </div>

            {categories.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Package className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-500">No categories yet. They will appear when vendors create products.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        {editingId === cat._id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="input-field"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium">{cat.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(cat.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {editingId === cat._id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(cat._id, editName)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(cat._id);
                                                            setEditName(cat.name);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat._id, cat.name)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
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

export default CategoryManagement;