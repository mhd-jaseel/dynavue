import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, DollarSign, List, Edit3, GripVertical, Eye, EyeOff, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    features: '',
    price: '',
    order: 0,
    featuredOnHome: false,
    visibility: true
  });
  const [file, setFile] = useState(null);
  
  const [editingService, setEditingService] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editFile, setEditFile] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data.data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [name]: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({ title: 'Error', text: 'Please select a cover image', icon: 'error' });
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('description', formData.description);
    const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
    data.append('features', JSON.stringify(featuresArray));
    data.append('price', formData.price);
    data.append('order', services.length);
    data.append('featuredOnHome', formData.featuredOnHome);
    data.append('visibility', formData.visibility);

    try {
      await api.post('/services', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      setFormData({ title: '', subtitle: '', description: '', features: '', price: '', order: 0, featuredOnHome: false, visibility: true });
      document.getElementById('service-file-input').value = '';
      Swal.fire({ title: 'Success', text: 'Service created successfully!', icon: 'success' });
      fetchServices();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to create service.', icon: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const data = new FormData();
    if (editFile) data.append('image', editFile);
    
    data.append('title', editFormData.title);
    data.append('subtitle', editFormData.subtitle || '');
    data.append('description', editFormData.description);
    const featuresArray = typeof editFormData.features === 'string' 
      ? editFormData.features.split(',').map(f => f.trim()).filter(f => f)
      : editFormData.features;
    data.append('features', JSON.stringify(featuresArray));
    data.append('price', editFormData.price);
    data.append('featuredOnHome', editFormData.featuredOnHome);
    data.append('visibility', editFormData.visibility);

    try {
      await api.put(`/services/${editingService._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingService(null);
      setEditFile(null);
      Swal.fire({ title: 'Success', text: 'Service updated successfully!', icon: 'success' });
      fetchServices();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to update service.', icon: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this service!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/services/${id}`);
      fetchServices();
      Swal.fire({ title: 'Success', text: 'Service deleted successfully!', icon: 'success' });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to delete service.', icon: 'error' });
    }
  };

  const toggleVisibility = async (service) => {
    try {
      await api.put(`/services/${service._id}`, { visibility: !service.visibility });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeatured = async (service) => {
    try {
      await api.put(`/services/${service._id}`, { featuredOnHome: !service.featuredOnHome });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const onDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newList = [...services];
    const itemToMove = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, itemToMove);
    setDraggedItemIndex(index);
    setServices(newList);
  };

  const onDragEnd = async (e) => {
    e.target.style.opacity = '1';
    setDraggedItemIndex(null);
    // Save new order to backend
    try {
      const updates = services.map((s, idx) => api.put(`/services/${s._id}`, { order: idx }));
      await Promise.all(updates);
    } catch (err) {
      console.error('Failed to update order', err);
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setEditFormData({
      ...service,
      features: service.features.join(', ')
    });
  };

  return (
    <div className="space-y-16 relative">
      {/* Add New Service Section */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-black/5 shadow-sm">
        <header className="mb-10">
          <h2 className="text-2xl font-heading mb-2">Create New Service</h2>
          <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Define your offerings and pricing</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Service Title</label>
              <input type="text" name="title" value={formData.title} onChange={(e) => handleInputChange(e)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Subtitle / Tagline</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={(e) => handleInputChange(e)} className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Pricing</label>
               <input type="text" name="price" placeholder="e.g. Starting from $2000" value={formData.price} onChange={(e) => handleInputChange(e)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Features (Comma Separated)</label>
               <input type="text" name="features" value={formData.features} onChange={(e) => handleInputChange(e)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Detailed Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={(e) => handleInputChange(e)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4 border-t border-black/5">
            <div className="flex items-center gap-6">
              <input id="service-file-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
              <label htmlFor="service-file-input" className="px-6 py-3 border border-black/5 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-light cursor-pointer transition-colors">
                {file ? file.name : 'Select Cover Image'}
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" name="featuredOnHome" checked={formData.featuredOnHome} onChange={(e) => handleInputChange(e)} className="accent-primary" />
                Feature on Homepage
              </label>
            </div>

            <button type="submit" disabled={uploading} className="px-10 py-3 bg-primary text-on-primary text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all disabled:opacity-50 rounded-xl shadow-lg shadow-primary/20">
              {uploading ? 'Processing...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>

      {/* Active Services List */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading mb-1">Manage Services</h2>
            <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Drag to reorder on frontend</p>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <div 
              key={service._id} 
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragEnter={(e) => onDragEnter(e, index)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-white rounded-2xl border border-black/5 shadow-sm p-4 flex items-center gap-6 cursor-move hover:shadow-md transition-all ${draggedItemIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="text-secondary/30">
                <GripVertical size={20} />
              </div>
              
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-light">
                <img src={service.image?.url || service.coverImage} alt={service.title || service.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-heading text-lg truncate">{service.title || service.name}</h3>
                  {service.featuredOnHome && <span className="bg-primary/10 text-primary text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-bold">Featured</span>}
                  {!service.visibility && <span className="bg-red-100 text-red-500 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-bold">Hidden</span>}
                </div>
                <p className="text-xs text-secondary/60 line-clamp-1 mb-2">{service.description}</p>
                <p className="text-[10px] font-bold tracking-widest text-primary">{service.price || service.startingPrice}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleFeatured(service)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${service.featuredOnHome ? 'bg-primary text-on-primary' : 'bg-light hover:bg-black/5'}`} title="Toggle Featured on Home">
                  <Star size={14} fill={service.featuredOnHome ? "currentColor" : "none"} />
                </button>
                <button onClick={() => openEditModal(service)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-light hover:bg-black/5 transition-colors" title="Edit Service">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => toggleVisibility(service)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${service.visibility ? 'bg-light hover:bg-black/5' : 'bg-red-50 text-red-500 hover:bg-red-100'}`} title="Toggle Visibility">
                  {service.visibility ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => handleDelete(service._id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete Service">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-black/5 bg-light flex justify-between items-center">
                <h3 className="font-heading text-xl">Edit Service</h3>
                <button onClick={() => setEditingService(null)} className="text-secondary/50 hover:text-dark">✕</button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form id="edit-service-form" onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Service Title</label>
                      <input type="text" name="title" value={editFormData.title || editFormData.name} onChange={(e) => handleInputChange(e, true)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Subtitle</label>
                      <input type="text" name="subtitle" value={editFormData.subtitle || ''} onChange={(e) => handleInputChange(e, true)} className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Pricing</label>
                      <input type="text" name="price" value={editFormData.price || editFormData.startingPrice} onChange={(e) => handleInputChange(e, true)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Features (Comma Separated)</label>
                      <input type="text" name="features" value={editFormData.features} onChange={(e) => handleInputChange(e, true)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Description</label>
                    <textarea name="description" rows="3" value={editFormData.description} onChange={(e) => handleInputChange(e, true)} required className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none" />
                  </div>

                  <div className="flex gap-6 items-center pt-4 border-t border-black/5">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Replace Cover Image</label>
                      <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files[0])} className="text-sm" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" name="featuredOnHome" checked={editFormData.featuredOnHome} onChange={(e) => handleInputChange(e, true)} className="accent-primary" />
                      Feature on Homepage
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" name="visibility" checked={editFormData.visibility} onChange={(e) => handleInputChange(e, true)} className="accent-primary" />
                      Public Visibility
                    </label>
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-black/5 bg-light flex justify-end gap-4">
                <button onClick={() => setEditingService(null)} className="px-6 py-2 rounded-xl text-xs uppercase tracking-widest font-bold text-secondary hover:bg-black/5">Cancel</button>
                <button type="submit" form="edit-service-form" disabled={uploading} className="px-8 py-2 rounded-xl bg-primary text-on-primary text-xs uppercase tracking-widest font-bold hover:bg-primary/90 disabled:opacity-50 shadow-md">
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManager;
