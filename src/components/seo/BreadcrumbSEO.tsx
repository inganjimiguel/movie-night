import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSEOProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSEO({ items }: BreadcrumbSEOProps) {
  useEffect(() => {
    const breadcrumbId = 'breadcrumb-jsonld';
    let script = document.querySelector(`script#${breadcrumbId}`) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = breadcrumbId;
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    script.textContent = JSON.stringify(structuredData);

    return () => {
      const existing = document.querySelector(`script#${breadcrumbId}`);
      if (existing) existing.remove();
    };
  }, [items]);

  return null;
}
