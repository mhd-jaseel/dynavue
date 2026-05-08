import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, Edit2, UploadCloud, X, Check, Search, GripVertical, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const PhotographerManager = () => {
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    experience: '',
    instagram: '',
    facebook: '',
    website: '',
    active: true,
  });
  
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Cropping State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/photographers');
      setPhotographers(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch photographers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageToCrop(url);
      setIsCropping(true);
      // Reset previous crop
      setCroppedFile(null);
      setPreviewUrl(null);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels
      );
      
      const file = new File([croppedImageBlob], "profile.jpg", { type: "image/jpeg" });
      setCroppedFile(file);
      setPreviewUrl(URL.createObjectURL(croppedImageBlob));
      setIsCropping(false);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      toast.error('Error cropping image');
    }
  };

  const openModal = (photographer = null) => {
    if (photographer) {
      setEditingId(photographer._id);
      setFormData({
        name: photographer.name,
        role: photographer.role,
        bio: photographer.bio || '',
        experience: photographer.experience || '',
        instagram: photographer.instagram || '',
        facebook: photographer.facebook || '',
        website: photographer.website || '',
        active: photographer.active,
      });
      setPreviewUrl(photographer.image);
    } else {
      setEditingId(null);
      setFormData({
        name: '', role: '', bio: '', experience: '', instagram: '', facebook: '', website: '', active: true
      });
      setPreviewUrl(null);
    }
    setCroppedFile(null);
    setImageToCrop(null);
    setIsCropping(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setPreviewUrl(null);
    setCroppedFile(null);
    setImageToCrop(null);
    setIsCropping(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    if (croppedFile) {
      submitData.append('image', croppedFile);
    }

    try {
      const toastId = toast.loading(editingId ? 'Updating...' : 'Adding...');
      if (editingId) {
        await api.put(`/photographers/${editingId}`, submitData);
        toast.success('Photographer updated successfully', { id: toastId });
      } else {
        await api.post('/photographers', submitData);
        toast.success('Photographer added successfully', { id: toastId });
      }
      closeModal();
      fetchPhotographers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving photographer');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this photographer?')) {
      try {
        const toastId = toast.loading('Deleting...');
        await api.delete(`/photographers/${id}`);
        toast.success('Photographer deleted', { id: toastId });
        fetchPhotographers();
      } catch (err) {
        toast.error('Error deleting photographer');
      }
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await api.put(`/photographers/${id}`, { active: !currentActive });
      fetchPhotographers();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleReorder = async (newOrder) => {
    setPhotographers(newOrder); // Optimistic UI update
    
    // Only reorder if not searching
    if (searchTerm) return;

    try {
      const orderedIds = newOrder.map(p => p._id);
      await api.put('/photographers/reorder', { orderedIds });
      toast.success('Order saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save order');
      fetchPhotographers(); // Revert on failure
    }
  };

  const filteredPhotographers = photographers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={16} />
          <input 
            type="text" 
            placeholder="Search team..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-black/10 rounded-full focus:outline-none focus:border-primary"
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-black/5" />
          ))}
        </div>
      ) : (
        <Reorder.Group 
          axis="y" 
          values={filteredPhotographers} 
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredPhotographers.map(photographer => (
              <Reorder.Item 
                key={photographer._id}
                value={photographer}
                className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm group hover:shadow-md transition-all relative list-none"
              >
                {/* Drag Handle */}
                <div className="absolute top-4 left-4 z-20 cursor-grab active:cursor-grabbing p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-md text-primary transition-colors shadow-sm">
                  <GripVertical size={14} />
                </div>

                <div className="aspect-[4/3] relative overflow-hidden bg-light">
                  {photographer.image ? (
                    <img 
                      src={photographer.image} 
                      alt={photographer.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary/30 pointer-events-none">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={() => toggleActive(photographer._id, photographer.active)}
                      className={`p-2 rounded-full backdrop-blur-md text-white transition-colors ${photographer.active ? 'bg-green-500/80 hover:bg-green-600' : 'bg-black/40 hover:bg-black/60'}`}
                      title={photographer.active ? "Active" : "Inactive"}
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => openModal(photographer)}
                      className="p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-md text-primary transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(photographer._id)}
                      className="p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-md text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading mb-1">{photographer.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">{photographer.role}</p>
                  <p className="text-sm text-secondary/60 line-clamp-2">{photographer.bio}</p>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Form / Cropper Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            
            {isCropping ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-2xl relative z-[101] p-6 flex flex-col h-[80vh]"
              >
                <h3 className="text-2xl font-heading mb-4">Crop Profile Image</h3>
                <div className="relative flex-grow bg-black rounded-2xl overflow-hidden mb-6">
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 5} // Matching the aspect ratio in the About page (4/5)
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium">Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button onClick={() => { setIsCropping(false); setImageToCrop(null); }} className="px-6 py-2 text-sm uppercase tracking-widest font-bold text-secondary/60 hover:text-primary">Cancel</button>
                  <button onClick={showCroppedImage} className="px-6 py-2 bg-primary text-white rounded-full text-sm uppercase tracking-widest font-bold">Apply Crop</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[101] p-8"
              >
                <button onClick={closeModal} className="absolute top-6 right-6 p-2 text-secondary/40 hover:text-primary transition-colors">
                  <X size={24} />
                </button>
                
                <h2 className="text-3xl font-heading mb-8">{editingId ? 'Edit' : 'Add'} Photographer</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Name *</label>
                        <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Role *</label>
                        <input required type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Experience (e.g., &quot;5 Years&quot;)</label>
                        <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Short Bio</label>
                        <textarea name="bio" rows="4" value={formData.bio} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"></textarea>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Profile Image {editingId ? '' : '*'}</label>
                        <div className="relative border-2 border-dashed border-black/10 rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors aspect-[4/5] bg-light/30">
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required={!editingId && !previewUrl} />
                          {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary/40 group-hover:text-primary transition-colors">
                              <UploadCloud size={32} className="mb-2" />
                              <span className="text-xs font-medium">Click to upload image</span>
                              <span className="text-[10px] mt-1">4:5 Aspect Ratio Recommended</span>
                            </div>
                          )}
                          {previewUrl && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white pointer-events-none">
                              <span className="text-sm font-bold">Change Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Instagram URL</label>
                          <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Facebook URL</label>
                          <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase tracking-widest text-secondary/60 font-bold mb-2">Website URL</label>
                          <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 bg-light/50 border border-black/5 rounded-xl text-sm focus:outline-none focus:border-primary" />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleInputChange} className="w-4 h-4 accent-primary" />
                        <label htmlFor="active" className="text-sm text-secondary/80 cursor-pointer">Active / Visible on site</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-black/5 mt-8">
                    <button type="button" onClick={closeModal} className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-secondary/60 hover:text-primary transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-8 py-3 bg-primary text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-colors">
                      {editingId ? 'Update' : 'Save'} Photographer
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotographerManager;
