/**
 * Image Optimization Utility
 * Handles lazy loading, compression, and responsive images
 */

export const OptimizedImage = ({ src, alt, className = "", width, height, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      loading="lazy"
      width={width}
      height={height}
      onError={(e) => {
        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23333' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E";
      }}
      {...props}
    />
  );
};

export const getImageSrcSet = (basePath, name, ext = "jpg") => {
  return `${basePath}/${name}-sm.${ext} 480w, ${basePath}/${name}-md.${ext} 768w, ${basePath}/${name}-lg.${ext} 1200w`;
};

export const optimizeImageUrl = (url, width = 400, quality = 80) => {
  // If using a CDN, add optimization params
  if (url.includes("cloudinary") || url.includes("imgix")) {
    return `${url}?w=${width}&q=${quality}&auto=format`;
  }
  return url;
};

// Preload critical images
export const preloadImage = (src) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
};
