import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Video, Upload, X, Crop, Star, LayoutGrid, LayoutList,
  ChevronLeft, ChevronRight, CheckCircle, Trash2, Maximize2, Move, Eye, EyeOff, Edit3
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '../../lib/api';
import EditCollectionModal from '../gallery/EditCollectionModal';
import Swal from 'sweetalert2';

const PortfolioController = () => {
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [coverIndex, setCoverIndex] = useState(null);
  const [layoutStyle, setLayoutStyle] = useState('grid');
  const [mediaSize, setMediaSize] = useState({ width: 300, height: 400 });
  const [croppingIndex, setCroppingIndex] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const onFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedMedia.length > 10) {
      Swal.fire({ title: 'Info', text: 'You can only upload up to 10 items at a time.', icon: 'info' });
      return;
    }

    const newMedia = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      preview: URL.createObjectURL(file),
      title: '',
      category: '',
      description: '',
      isFeatured: false
    }));

    setSelectedMedia([...selectedMedia, ...newMedia]);
  };

  const removeMedia = (index) => {
    const newMedia = [...selectedMedia];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setSelectedMedia(newMedia);
    if (coverIndex === index) setCoverIndex(null);
    else if (coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const saveCrop = async () => {
    setCroppingIndex(null);
  };

  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [galleries, setGalleries] = useState([]);
  const [editingGallery, setEditingGallery] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchGalleries();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await api.get('/galleries');
      setGalleries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      await api.put(`/galleries/${id}`, { visibility: !currentVisibility });
      fetchGalleries();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to update visibility', icon: 'error' });
    }
  };

  const deleteGallery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection and all its media? This cannot be undone.')) return;
    try {
      await api.delete(`/galleries/${id}`);
      fetchGalleries();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to delete collection', icon: 'error' });
    }
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Error adding category', icon: 'error' });
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const updateMediaInfo = (index, field, value) => {
    const newMedia = [...selectedMedia];
    newMedia[index][field] = value;
    setSelectedMedia(newMedia);
  };

  const [galleryInfo, setGalleryInfo] = useState({
    title: '',
    category: '',
    description: '',
    cardSize: 'medium',
    isFeatured: false
  });

  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      if (selectedMedia.length === 0) {
        Swal.fire({ title: 'Error', text: 'Please select media to upload.', icon: 'error' });
        return;
      }

      if (!galleryInfo.title || !galleryInfo.category) {
        Swal.fire({ title: 'Error', text: 'Please provide a Collection Title and Category.', icon: 'error' });
        return;
      }

      const formData = new FormData();
      formData.append('title', galleryInfo.title);
      formData.append('category', galleryInfo.category.toLowerCase());
      formData.append('description', galleryInfo.description);
      formData.append('featured', galleryInfo.isFeatured);
      formData.append('cardSize', galleryInfo.cardSize);
      formData.append('coverIndex', coverIndex !== null ? coverIndex : 0);

      selectedMedia.forEach(media => {
        formData.append('media', media.file);
      });

      setUploading(true);

      await api.post('/galleries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({ title: 'Success', text: 'Collection uploaded successfully!', icon: 'success' });
      setSelectedMedia([]);
      setGalleryInfo({ title: '', category: '', description: '', cardSize: 'medium', isFeatured: false });
      setCoverIndex(null);
      fetchGalleries();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Upload failed.', icon: 'error' });
    } finally {
      setUploading(false);
    }
  };

return (
  <div className="space-y-12">
    {/* Category Management */}
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
      <h3 className="text-xl font-heading mb-6">Manage Categories</h3>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="New Category Name..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className="flex-grow bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
        <button
          onClick={addCategory}
          className="bg-primary text-on-primary px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-primary/90 transition-all"
        >
          Add Category
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <div key={cat._id} className="flex items-center gap-2 bg-light px-4 py-2 rounded-full border border-black/5">
            <span className="text-[11px] uppercase tracking-[0.1em]">{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat._id)}
              className="w-5 h-5 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
              title="Delete Category"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Upload Section */}
    <div
      onClick={() => fileInputRef.current.click()}
      className="group relative border-2 border-dashed border-black/5 rounded-[2.5rem] p-12 text-center hover:border-primary/20 transition-all cursor-pointer bg-white"
    >
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*,video/*"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/30 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
          <Upload size={24} />
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-widest font-bold mb-2">Upload to Portfolio</h3>
          <p className="text-secondary/40 text-[10px] uppercase tracking-widest font-medium">Drag & drop or click to select (Max 10 images/videos)</p>
        </div>
      </div>
    </div>

    {/* Control Bar */}
    <AnimatePresence>
      {selectedMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-black/5 shadow-sm"
        >
          <div className="flex items-center gap-8">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-secondary/40">Layout Style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutStyle('grid')}
                  className={`p-2 rounded-lg transition-all ${layoutStyle === 'grid' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-light text-secondary/40'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setLayoutStyle('card')}
                  className={`p-2 rounded-lg transition-all ${layoutStyle === 'card' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-light text-secondary/40'}`}
                >
                  <LayoutList size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-secondary/40">Media Size</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min="200" max="500" value={mediaSize.width}
                  onChange={(e) => setMediaSize({ ...mediaSize, width: parseInt(e.target.value) })}
                  className="w-24 accent-primary"
                />
                <span className="text-[10px] font-bold text-secondary/60 w-8">{mediaSize.width}px</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`bg-primary text-on-primary px-10 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              'Process & Save Portfolio'
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Gallery Information Form (Applies to the entire batch of images and videos) */}
    <AnimatePresence>
      {selectedMedia.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm"
        >
          <h3 className="text-xl font-heading mb-6">Collection Details</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <input
              type="text"
              placeholder="Collection Title..."
              value={galleryInfo.title}
              onChange={(e) => setGalleryInfo({ ...galleryInfo, title: e.target.value })}
              className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <select
              value={galleryInfo.category}
              onChange={(e) => setGalleryInfo({ ...galleryInfo, category: e.target.value })}
              className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="" disabled>Select a Category...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              value={galleryInfo.cardSize}
              onChange={(e) => setGalleryInfo({ ...galleryInfo, cardSize: e.target.value })}
              className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="small">Small Card</option>
              <option value="medium">Medium Card</option>
              <option value="large">Large Card</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <textarea
            placeholder="Collection Description (Optional)..."
            value={galleryInfo.description}
            onChange={(e) => setGalleryInfo({ ...galleryInfo, description: e.target.value })}
            className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 h-24 resize-none mb-4"
          />
          <label className="flex items-center gap-2 cursor-pointer w-max">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-black/10 text-primary focus:ring-primary"
              checked={galleryInfo.isFeatured}
              onChange={(e) => setGalleryInfo({ ...galleryInfo, isFeatured: e.target.checked })}
            />
            <span className="text-sm font-medium">Feature this collection on homepage</span>
          </label>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Media Grid */}
    <div className={`grid gap-8 ${layoutStyle === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      <AnimatePresence>
        {selectedMedia.map((media, index) => (
          <motion.div
            key={media.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-[2.5rem] overflow-hidden border border-black/5 group shadow-sm flex ${layoutStyle === 'card' ? 'flex-row h-72' : 'flex-col'}`}
          >
            {/* Media Preview Container */}
            <div
              className="relative overflow-hidden bg-light"
              style={{
                width: layoutStyle === 'card' ? `${mediaSize.width}px` : '100%',
                height: layoutStyle === 'card' ? '100%' : `${mediaSize.height}px`
              }}
            >
              {media.type === 'image' ? (
                <img src={media.preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <video src={media.preview} className="w-full h-full object-cover" />
              )}

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                {media.type === 'image' && (
                  <button
                    onClick={() => setCroppingIndex(index)}
                    className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform"
                    title="Crop Image"
                  >
                    <Crop size={18} />
                  </button>
                )}
                <button
                  onClick={() => setCoverIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${coverIndex === index ? 'bg-primary text-on-primary' : 'bg-white text-primary'}`}
                  title="Set as Cover"
                >
                  <Star size={18} fill={coverIndex === index ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => removeMedia(index)}
                  className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {coverIndex === index && (
                <div className="absolute top-6 left-6 bg-primary text-on-primary px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold shadow-lg">
                  Cover Image
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-8 flex-grow space-y-4">
              <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-center">Part of Collection</p>
                <p className="text-xs text-center">{galleryInfo.title || 'Untitled Collection'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

    {/* Cropping Modal */}
    <AnimatePresence>
      {croppingIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/95 backdrop-blur-xl"
        >
          <div className="relative w-full max-w-4xl h-[70vh] bg-white rounded-[3rem] border border-black/5 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-heading">Refine Composition</h3>
                <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold mt-1">Adjust framing for {selectedMedia[croppingIndex].title || 'item'}</p>
              </div>
              <button
                onClick={() => setCroppingIndex(null)}
                className="w-12 h-12 rounded-full bg-light flex items-center justify-center text-secondary/40 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-grow bg-black/5">
              <Cropper
                image={selectedMedia[croppingIndex].preview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 border-t border-black/5 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Move size={14} className="text-secondary/30" />
                  <input
                    type="range" min="1" max="3" step="0.1" value={zoom}
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-32 accent-primary"
                  />
                </div>
                <div className="flex gap-2">
                  {[1, 1.5, 2, 2.5, 3].map(val => (
                    <button
                      key={val}
                      onClick={() => setZoom(val)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${zoom === val ? 'bg-primary text-on-primary' : 'bg-light text-secondary/40'}`}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={saveCrop}
                className="bg-primary text-on-primary px-10 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center gap-2"
              >
                Apply Crop <CheckCircle size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Empty State */}
    {selectedMedia.length === 0 && (
      <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
        <ImageIcon size={64} className="mb-6 stroke-[1]" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">No media selected for upload</p>
      </div>
    )}
    {/* Existing Collections Management */}
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm mt-12">
      <h3 className="text-xl font-heading mb-6">Manage Uploaded Collections</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map(gallery => {
          const mediaCount = (gallery.images?.length || 0) + (gallery.videos?.length || 0);
          return (
            <div key={gallery._id} className="border border-black/5 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-500 bg-light flex flex-col">
              <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100">
                <img
                  src={gallery.coverImage?.url || gallery.thumbnailUrl || gallery.url}
                  alt={gallery.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  {gallery.featured && (
                    <span className="bg-primary text-on-primary text-[9px] uppercase tracking-widest px-2 py-1 rounded-md font-bold shadow-sm backdrop-blur-md bg-opacity-90">
                      Featured
                    </span>
                  )}
                  {!gallery.visibility && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[9px] uppercase tracking-widest px-2 py-1 rounded-md font-bold shadow-sm">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h4 className="font-heading text-lg truncate mb-1">{gallery.title}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] uppercase tracking-widest text-secondary/60 font-bold">{gallery.category}</span>
                  <span className="text-[10px] font-bold text-secondary/40">{mediaCount} items</span>
                </div>
                <div className="flex-grow"></div>
                <div className="flex items-center justify-between gap-2 mt-6 pt-6 border-t border-black/5">
                  <button
                    onClick={() => setEditingGallery(gallery)}
                    className="flex-1 bg-white border border-black/5 text-[10px] uppercase tracking-widest py-3 rounded-lg hover:border-primary hover:text-primary transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toggleVisibility(gallery._id, gallery.visibility)}
                    className={`w-12 h-12 flex items-center justify-center border rounded-lg transition-colors ${gallery.visibility ? 'bg-white border-black/5 hover:bg-light' : 'bg-red-50 border-red-100 text-red-500'}`}
                    title={gallery.visibility ? "Hide Collection" : "Show Collection"}
                  >
                    {gallery.visibility ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => deleteGallery(gallery._id)}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {galleries.length === 0 && (
        <div className="py-20 text-center opacity-40">
          <LayoutGrid size={48} className="mx-auto mb-4 stroke-[1]" />
          <p className="text-[10px] uppercase tracking-widest font-bold">No collections uploaded yet</p>
        </div>
      )}
    </div>

    {/* Edit Collection Modal */}
    <AnimatePresence>
      {editingGallery && (
        <EditCollectionModal
          gallery={editingGallery}
          categories={categories}
          onClose={() => setEditingGallery(null)}
          onUpdate={fetchGalleries}
        />
      )}
    </AnimatePresence>

  </div>
  );
};

export default PortfolioController;
