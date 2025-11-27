// src/components/Seo.jsx
import React from "react";
import { Helmet } from "react-helmet";

export default function Seo({
  title = "MEDIAZION · Centro de Mediación y Resolución de Conflictos",
  description = "Soluciones profesionales, sin conflicto. Mediación civil, mercantil, familiar y empresarial en España.",
  canonical = "https://mediazion.eu",
  image = "https://mediazion.eu/logo.png",
}) {
  return (
    <Helmet>
      {/* Meta básicos */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MEDIAZION" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
