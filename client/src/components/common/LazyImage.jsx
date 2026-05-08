import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const LazyImage = ({ src, alt, className, width, height }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <LazyLoadImage
        alt={alt}
        src={src}
        effect="blur"
        width={width}
        height={height}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        wrapperClassName="w-full h-full"
      />
    </div>
  );
};

export default LazyImage;
