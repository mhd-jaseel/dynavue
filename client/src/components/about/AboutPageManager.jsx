import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Plus, Trash2, CheckCircle, Save } from 'lucide-react';
import api from '../../lib/api';
import Swal from 'sweetalert2';

const AboutPageManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    hero: { title: '', image: '' },
    bio: { title: '', paragraphs: [], image: '' },
    philosophy: { quote: '' },
    stats: [],
    gear: { cameras: [], lenses: [] }
  });

  const [heroFile, setHeroFile] = useState(null);
  const [bioFile, setBioFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [bioPreview, setBioPreview] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await api.get('/about');
      if (res.data.success) {
        setContent(res.data.data);
        setHeroPreview(res.data.data.hero?.image || '');
        setBioPreview(res.data.data.bio?.image || '');
      }
    } catch (err) {
      console.error('Failed to fetch about content', err);
      Swal.fire({ title: 'Error', text: 'Failed to load content', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (field === 'hero') {
      setHeroFile(file);
      setHeroPreview(previewUrl);
    } else {
      setBioFile(file);
      setBioPreview(previewUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      if (heroFile) formData.append('heroImage', heroFile);
      if (bioFile) formData.append('bioImage', bioFile);

      formData.append('heroTitle', content.hero.title);
      formData.append('bioTitle', content.bio.title);
      formData.append('bioParagraphs', JSON.stringify(content.bio.paragraphs));
      formData.append('philosophyQuote', content.philosophy.quote);
      formData.append('stats', JSON.stringify(content.stats));
      formData.append('cameras', JSON.stringify(content.gear.cameras));
      formData.append('lenses', JSON.stringify(content.gear.lenses));

      const res = await api.put('/about', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        Swal.fire({ title: 'Success', text: 'About page updated successfully!', icon: 'success' });
        setContent(res.data.data);
        setHeroFile(null);
        setBioFile(null);
      }
    } catch (err) {
      console.error('Failed to save about content', err);
      Swal.fire({ title: 'Error', text: 'Failed to save changes', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateParagraph = (index, val) => {
    const p = [...content.bio.paragraphs];
    p[index] = val;
    setContent({ ...content, bio: { ...content.bio, paragraphs: p } });
  };

  const addParagraph = () => {
    setContent({ ...content, bio: { ...content.bio, paragraphs: [...content.bio.paragraphs, ''] } });
  };

  const removeParagraph = (index) => {
    const p = [...content.bio.paragraphs];
    p.splice(index, 1);
    setContent({ ...content, bio: { ...content.bio, paragraphs: p } });
  };

  const updateStat = (index, field, val) => {
    const s = [...content.stats];
    s[index][field] = val;
    setContent({ ...content, stats: s });
  };

  const addStat = () => {
    setContent({ ...content, stats: [...content.stats, { num: '', label: '' }] });
  };

  const removeStat = (index) => {
    const s = [...content.stats];
    s.splice(index, 1);
    setContent({ ...content, stats: s });
  };

  const updateGear = (type, index, val) => {
    const g = [...content.gear[type]];
    g[index] = val;
    setContent({ ...content, gear: { ...content.gear, [type]: g } });
  };

  const addGear = (type) => {
    setContent({ ...content, gear: { ...content.gear, [type]: [...content.gear[type], ''] } });
  };

  const removeGear = (type, index) => {
    const g = [...content.gear[type]];
    g.splice(index, 1);
    setContent({ ...content, gear: { ...content.gear, [type]: g } });
  };

  if (loading) {
    return <div className="p-8 text-center opacity-50">Loading...</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-sm uppercase tracking-widest font-bold">About Page Manager</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-on-primary px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">Hero Section</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Hero Title</label>
            <input
              type="text"
              value={content.hero?.title}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
              className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Hero Image</label>
            <div className="flex items-center gap-4">
              {heroPreview && (
                <img src={heroPreview} alt="Hero" className="w-20 h-20 object-cover rounded-xl border border-black/5" />
              )}
              <label className="cursor-pointer bg-light px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all flex items-center gap-2">
                <Upload size={14} /> Upload Image
                <input type="file" hidden onChange={(e) => handleFileChange(e, 'hero')} accept="image/*" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">Bio Section</h3>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Bio Title</label>
            <input
              type="text"
              value={content.bio?.title}
              onChange={(e) => setContent({ ...content, bio: { ...content.bio, title: e.target.value } })}
              className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Bio Image</label>
            <div className="flex items-center gap-4">
              {bioPreview && (
                <img src={bioPreview} alt="Bio" className="w-20 h-20 object-cover rounded-xl border border-black/5" />
              )}
              <label className="cursor-pointer bg-light px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all flex items-center gap-2">
                <Upload size={14} /> Upload Image
                <input type="file" hidden onChange={(e) => handleFileChange(e, 'bio')} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Bio Paragraphs</label>
            <button onClick={addParagraph} className="text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-1">
              <Plus size={12} /> Add Paragraph
            </button>
          </div>
          {content.bio?.paragraphs.map((p, index) => (
            <div key={index} className="flex gap-4">
              <textarea
                value={p}
                onChange={(e) => updateParagraph(index, e.target.value)}
                className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 h-24 resize-none"
              />
              <button onClick={() => removeParagraph(index)} className="p-2 text-red-500 hover:opacity-70">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">Philosophy Quote</h3>
        <div className="space-y-4">
          <textarea
            value={content.philosophy?.quote}
            onChange={(e) => setContent({ ...content, philosophy: { quote: e.target.value } })}
            className="w-full bg-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 h-24 resize-none"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading">Stats / Numbers</h3>
          <button onClick={addStat} className="text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-1">
            <Plus size={12} /> Add Stat
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.stats?.map((stat, index) => (
            <div key={index} className="bg-light p-4 rounded-xl space-y-3 relative">
              <button onClick={() => removeStat(index)} className="absolute top-2 right-2 text-red-500 hover:opacity-70">
                <X size={14} />
              </button>
              <div>
                <label className="text-[9px] uppercase tracking-widest font-bold text-secondary/40">Number</label>
                <input
                  type="text"
                  value={stat.num}
                  onChange={(e) => updateStat(index, 'num', e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="e.500+"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest font-bold text-secondary/40">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                  placeholder="Weddings"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gear Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
        <h3 className="text-xl font-heading mb-6">Gear Management</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Cameras */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Cameras</label>
              <button onClick={() => addGear('cameras')} className="text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {content.gear?.cameras.map((cam, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={cam}
                  onChange={(e) => updateGear('cameras', index, e.target.value)}
                  className="w-full bg-light rounded-xl px-4 py-2 text-sm focus:outline-none"
                />
                <button onClick={() => removeGear('cameras', index)} className="text-red-500 hover:opacity-70">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Lenses */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-secondary/40">Lenses</label>
              <button onClick={() => addGear('lenses')} className="text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {content.gear?.lenses.map((lens, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={lens}
                  onChange={(e) => updateGear('lenses', index, e.target.value)}
                  className="w-full bg-light rounded-xl px-4 py-2 text-sm focus:outline-none"
                />
                <button onClick={() => removeGear('lenses', index)} className="text-red-500 hover:opacity-70">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPageManager;
