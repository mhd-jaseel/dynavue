import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const HomeHighlightManager = () => {
  const [data, setData] = useState({
    smallHeading: 'Featured Highlights',
    mainTitlePart1: 'The Art of',
    mainTitleItalic: 'Storytelling',
    buttonText: 'Explore Portfolio',
    buttonLink: '/portfolio',
    ctaBgImage: '',
    photos: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newPhotos, setNewPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const ctaFileInputRef = useRef(null);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  
  const [ctaFile, setCtaFile] = useState(null);
  const [ctaPreview, setCtaPreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/home-highlights');
      if (res.data?.data) {
        setData(res.data.data);
        setCtaPreview(res.data.data.ctaBgImage || '');
      }
    } catch (err) {
      console.error('Failed to fetch home highlights', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handlePhotoCategoryChange = (index, value) => {
    const newPhotosArray = [...data.photos];
    newPhotosArray[index].category = value;
    setData({ ...data, photos: newPhotosArray });
  };

  // Drag and Drop Logic
  const onDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const onDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newList = [...data.photos];
    const itemToMove = newList[draggedItemIndex];
    newList.splice(draggedItemIndex, 1);
    newList.splice(index, 0, itemToMove);
    
    setDraggedItemIndex(index);
    setData({ ...data, photos: newList });
  };

  const onDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItemIndex(null);
  };

  const removeExistingPhoto = (index) => {
    const newList = [...data.photos];
    newList.splice(index, 1);
    setData({ ...data, photos: newList });
  };

  const onFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const mappedFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      category: 'New Photo'
    }));
    setNewPhotos([...newPhotos, ...mappedFiles]);
  };

  const handleCtaFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCtaFile(file);
    setCtaPreview(URL.createObjectURL(file));
  };

  const removeNewPhoto = (index) => {
    const newList = [...newPhotos];
    URL.revokeObjectURL(newList[index].preview);
    newList.splice(index, 1);
    setNewPhotos(newList);
  };

  const updateNewPhotoCategory = (index, value) => {
    const newList = [...newPhotos];
    newList[index].category = value;
    setNewPhotos(newList);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Re-map existing photo order
      const orderedPhotos = data.photos.map((p, idx) => ({ ...p, order: idx }));

      // 1. Update existing texts and current ordered photos
      await api.put('/home-highlights', {
        smallHeading: data.smallHeading,
        mainTitlePart1: data.mainTitlePart1,
        mainTitleItalic: data.mainTitleItalic,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        photos: orderedPhotos
      });

      // 2. Upload new photos if any
      if (newPhotos.length > 0) {
        const formData = new FormData();
        const metadata = newPhotos.map(p => ({ alt: 'Featured Highlight', category: p.category }));
        formData.append('metadata', JSON.stringify(metadata));
        
        newPhotos.forEach(p => {
          formData.append('images', p.file);
        });

        await api.post('/home-highlights/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setNewPhotos([]);
      }

      // 3. Upload CTA image if any
      if (ctaFile) {
        const formData = new FormData();
        formData.append('ctaImage', ctaFile);
        await api.put('/home-highlights/cta-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCtaFile(null);
      }

      Swal.fire({ title: 'Success', text: 'Homepage Highlights updated successfully!', icon: 'success' });
      fetchData(); // re-fetch to get accurate cloud IDs
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Failed to save changes.', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-12">
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">Text & Links Configuration</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Small Overheading</label>
            <input 
              type="text" name="smallHeading" value={data.smallHeading} onChange={handleChange}
              className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Main Title (Regular Part)</label>
            <input 
              type="text" name="mainTitlePart1" value={data.mainTitlePart1} onChange={handleChange}
              className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Main Title (Italic Highlight)</label>
            <input 
              type="text" name="mainTitleItalic" value={data.mainTitleItalic} onChange={handleChange}
              className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-widest font-bold text-secondary/40 mb-2">Button Text</label>
            <input 
              type="text" name="buttonText" value={data.buttonText} onChange={handleChange}
              className="w-full bg-light border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* CTA Banner Configuration */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">CTA Banner Configuration</h3>
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Background Image</label>
          <div className="flex items-center gap-4">
            {ctaPreview && (
              <img src={ctaPreview} alt="CTA Background" className="w-40 h-20 object-cover rounded-xl border border-black/5" />
            )}
            <label className="cursor-pointer bg-light px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all flex items-center gap-2">
              <Upload size={14} /> Upload Image
              <input type="file" hidden ref={ctaFileInputRef} onChange={handleCtaFileChange} accept="image/*" />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading">Gallery Management</h3>
          <span className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Drag to Reorder</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {data.photos.map((photo, index) => (
            <div 
              key={photo._id || index}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragEnter={(e) => onDragEnter(e, index)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`relative bg-light rounded-2xl overflow-hidden border border-black/5 aspect-[4/5] group cursor-move ${draggedItemIndex === index ? 'opacity-50' : ''}`}
            >
              <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <div className="text-white/80"><GripVertical size={16} /></div>
                  <button onClick={() => removeExistingPhoto(index)} className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <input 
                    type="text" 
                    value={photo.category} 
                    onChange={(e) => handlePhotoCategoryChange(index, e.target.value)}
                    placeholder="Category..."
                    className="w-full bg-white/20 backdrop-blur-md border border-white/20 text-white placeholder-white/50 text-[10px] px-3 py-2 rounded-lg outline-none uppercase tracking-widest"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Photos Button Area */}
          <div 
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-black/10 rounded-2xl aspect-[4/5] flex flex-col items-center justify-center text-secondary/40 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer bg-light/50 group"
          >
            <input type="file" multiple hidden ref={fileInputRef} onChange={onFileSelect} accept="image/*" />
            <Upload size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Add Images</span>
          </div>
        </div>

        {/* Pending New Uploads Section */}
        {newPhotos.length > 0 && (
          <div className="mt-8 pt-8 border-t border-black/5">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary mb-4">Pending Uploads ({newPhotos.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newPhotos.map((photo, index) => (
                <div key={index} className="relative bg-light rounded-xl overflow-hidden aspect-[4/5] border border-black/5 group">
                  <img src={photo.preview} alt="New" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button onClick={() => removeNewPhoto(index)} className="w-6 h-6 rounded-full bg-white text-red-500 flex items-center justify-center">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={photo.category} 
                      onChange={(e) => updateNewPhotoCategory(index, e.target.value)}
                      className="w-full bg-white/20 backdrop-blur-md text-white text-[9px] px-2 py-1.5 rounded outline-none uppercase tracking-widest"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary text-on-primary px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default HomeHighlightManager;
