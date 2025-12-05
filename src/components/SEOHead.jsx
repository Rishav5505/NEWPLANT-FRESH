import React from "react";
import { Helmet } from "react-helmet";

const SEOHead = ({ 
  title = "Plants Store - Buy Indoor & Outdoor Plants Online",
  description = "Shop healthy, hand-picked plants for your home. Indoor plants, outdoor plants, flowering plants, care kits, and planters. Free delivery!",
  image = "https://plants-store.com/og-image.jpg",
  url = "https://plants-store.com",
  type = "website"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional */}
      <meta name="keywords" content="plants, indoor plants, outdoor plants, gardening, plant store, online plants" />
      <meta name="author" content="Plants Store Team" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHead;
