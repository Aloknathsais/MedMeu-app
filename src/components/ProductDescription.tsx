import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import './ProductDescription.css';

function cleanDescription(html: string): string {
  // Strip inline styles and fixed sizes: these cause most of the desktop layout problems.
  const safe = DOMPurify.sanitize(html, {
    FORBID_ATTR: ['style', 'width', 'height', 'bgcolor', 'align', 'valign'],
    FORBID_TAGS: ['style', 'script', 'form', 'input', 'button'],
  });

  const doc = new DOMParser().parseFromString(safe, 'text/html');

  // Wrap each table in a horizontally scrollable container.
  doc.querySelectorAll('table').forEach((table) => {
    const wrap = doc.createElement('div');
    wrap.className = 'pd-table-scroll';
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Make images lazy and keep external links safe.
  doc.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));
  doc.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  return doc.body.innerHTML;
}

const ProductDescription: React.FC<{ html: string }> = ({ html }) => {
  const cleaned = useMemo(() => cleanDescription(html), [html]);
  if (!cleaned.trim()) return null;
  return <div className="product-desc" dangerouslySetInnerHTML={{ __html: cleaned }} />;
};

export default ProductDescription;