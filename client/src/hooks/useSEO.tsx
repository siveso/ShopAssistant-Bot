import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  structuredData: any;
}

export function useSEO(type: 'catalog' | 'product', productId?: string, language: 'uz' | 'ru' = 'uz') {
  const { data: seoData } = useQuery<SEOData>({
    queryKey: ['/api/seo', type, productId, language],
    queryFn: async () => {
      let url = '';
      if (type === 'catalog') {
        url = `/api/seo/catalog?lang=${language}`;
      } else if (type === 'product' && productId) {
        url = `/api/seo/product/${productId}?lang=${language}`;
      }
      
      if (!url) throw new Error('Invalid SEO request');
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch SEO data');
      }
      return response.json();
    },
    enabled: type === 'catalog' || (type === 'product' && !!productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!seoData) return;

    // Update document title
    document.title = seoData.title;

    // Update or create meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords.join(', '));
    
    // Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle, 'property');
    updateMetaTag('og:description', seoData.ogDescription, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', window.location.href, 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.ogTitle);
    updateMetaTag('twitter:description', seoData.ogDescription);

    // Structured data
    if (seoData.structuredData) {
      updateStructuredData(seoData.structuredData);
    }

  }, [seoData]);

  return seoData;
}

function updateMetaTag(name: string, content: string, attributeName: string = 'name') {
  const selector = `meta[${attributeName}="${name}"]`;
  let element = document.querySelector(selector);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attributeName, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

function updateStructuredData(data: any) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}