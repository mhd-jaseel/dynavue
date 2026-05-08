import { useState, useEffect } from 'react';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const PhotoManager = () => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'wedding',
    featured: false
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/photos');
      setPhotos(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire({ title: 'Error', text: 'Please select a file', icon: 'error' });
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('featured', formData.featured);

    try {
      await api.post('/photos', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      setFormData({ title: '', description: '', category: 'wedding', featured: false });
      document.getElementById('file-input').value = '';
      fetchPhotos();
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Upload failed', icon: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this photo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    });
    if (!result.isConfirmed) return;
    
    try {
      await api.delete(`/photos/${id}`);
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-16">
      {/* Upload Form Section */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-black/5 shadow-sm">
        <header className="mb-10">
          <h2 className="text-2xl font-heading mb-2">Upload Content</h2>
          <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">Add new masterpieces to your portfolio</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">Photo Title</label>
              <input
                type="text"
                name="title"
                placeholder="Give your photo a name..."
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm appearance-none cursor-pointer"
              >
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="portrait">Portrait</option>
                <option value="events">Events</option>
                <option value="candid">Candid</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary/30">Description</label>
            <textarea
              name="description"
              rows="2"
              placeholder="Tell the story behind this shot..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-transparent border-b border-black/5 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-black/10 text-primary focus:ring-primary accent-primary transition-all"
                />
                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary/60 group-hover:text-primary transition-colors">Feature on Home</span>
              </label>
              
              <div className="relative">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label 
                  htmlFor="file-input" 
                  className="px-6 py-2 border border-black/5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-light cursor-pointer transition-colors"
                >
                  {file ? file.name : 'Select Image File'}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-10 py-4 bg-primary text-on-primary text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all disabled:opacity-50 rounded-full shadow-lg shadow-primary/20"
            >
              {uploading ? 'Processing...' : 'Upload To Gallery'}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Gallery Grid */}
      <div>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-heading mb-1">Portfolio Library</h2>
            <p className="text-[10px] uppercase tracking-widest text-secondary/40 font-bold">{photos.length} Total Items</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {photos.map(photo => (
            <div key={photo._id} className="group bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-square overflow-hidden relative">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button onClick={() => handleDelete(photo._id)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors">
                      <Trash2 size={18} />
                   </button>
                </div>
                {photo.featured && <div className="absolute top-4 left-4 bg-primary text-on-primary text-[9px] px-3 py-1 uppercase tracking-widest font-bold rounded-full">Featured</div>}
              </div>
              <div className="p-5">
                <p className="text-xs font-bold mb-1 truncate">{photo.title || 'Untitled'}</p>
                <p className="text-[10px] text-secondary/40 uppercase tracking-widest font-bold">{photo.category}</p>
              </div>
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-black/10">
            <ImageIcon size={48} className="mx-auto text-black/10 mb-4" />
            <p className="text-secondary/40 font-light tracking-widest uppercase text-xs">Your gallery is waiting for its first story...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoManager;
