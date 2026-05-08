export const getCloudinaryUrl = (publicId, width, quality = 'auto') => {
  if (!publicId) return '';
  // If it's already a full URL, just return it
  if (publicId.startsWith('http')) return publicId;
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality},f_auto/${publicId}`;
};
