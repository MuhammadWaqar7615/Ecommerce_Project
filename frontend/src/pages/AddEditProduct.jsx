import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Star, Trash2, GripVertical } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { addProduct, updateProduct, getProductById, getVendorCategories } from '../services/vendor';

// Sortable Image Component
const SortableImage = ({ image, index, isPrimary, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${isPrimary ? 'border-primary shadow-lg' : 'border-gray-200'
        }`}
    >
      <PhotoView src={image}>
        <div className="w-full aspect-video sm:aspect-square cursor-pointer">
          <img
            src={image}
            alt={`Product ${index + 1}`}
            className="w-full h-full object-cover pointer-events-none"
            draggable="false"
          />
        </div>
      </PhotoView>

      <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition duration-200">
        <GripVertical size={14} className="text-white" />
      </div>

      {isPrimary && (
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={12} /> <span className="hidden sm:inline">Primary</span>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="absolute bottom-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg transition duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    images: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await getVendorCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const data = await getProductById(id);
      const product = data.product;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        price: product.price || '',
        stock: product.stock || '',
        images: product.images || [],
      });
    } catch (error) {
      console.error(error);
      toast.error('Product not found');
      navigate('/vendor/products');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload image files only');
        continue;
      }

      setUploading(true);
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/vendor/upload-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataImg,
        });
        const result = await response.json();

        if (result.success) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.data.imageUrl],
          }));
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      setFormData((prev) => {
        const oldIndex = active.id;
        const newIndex = over.id;
        const newImages = arrayMove(prev.images, oldIndex, newIndex);
        return { ...prev, images: newImages };
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (isEditMode) {
        await updateProduct(id, productData);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(productData);
        toast.success('Product added successfully!');
      }
      navigate('/vendor/products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '', price: '', stock: '', images: [] });
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the image being dragged
  const draggedImage = activeId !== null ? formData.images[activeId] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-dark px-4 sm:px-8 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              {isEditMode ? 'Update your product information' : 'Fill in the details to add a new product to your store'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:gap-8">
              {/* Left Column */}
              <div className="lg:flex-1 lg:pr-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Product Information
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Handmade Leather Sandals"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your product in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:flex-[2] lg:pl-6 mt-8 lg:mt-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    Product Images
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Drag to reorder. First image is the primary (cover) image</p>
                </div>

                <PhotoProvider>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                  >
                    <SortableContext
                      items={formData.images.map((_, idx) => idx)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {formData.images.map((img, index) => (
                          <SortableImage
                            key={index}
                            image={img}
                            index={index}
                            isPrimary={index === 0}
                            onDelete={removeImage}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <DragOverlay
                      dropAnimation={{
                        duration: 200,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                      }}
                    >
                      {draggedImage ? (
                        <div className="w-32 h-32 rounded-lg overflow-hidden shadow-2xl border-2 border-primary bg-white">
                          <img
                            src={draggedImage}
                            alt="Dragging"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </PhotoProvider>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-primary transition duration-200">
                  <label className="cursor-pointer block">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">
                      {uploading ? 'Uploading...' : 'Click or drag to upload images'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 5MB each</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.images.length === 0 && (
                  <p className="text-xs text-amber-600 mt-3">No images uploaded yet. Add at least one image.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 text-base">
                {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  navigate('/vendor/products');
                }}
                className="flex-1 btn-outline py-3 text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AddEditProduct;