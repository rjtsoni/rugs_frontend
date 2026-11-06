import { t } from '../i18n';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProductCard from './ProductCard';
import './CollectionProducts.css';
export default function CollectionProducts({
  products,
  category,
  wishlist,
  onToggleWish,
  onQuickView,
  onViewMore
}) {
  return <div className="collection-results"><div className="collection-results-heading"><span>{t("Showing ")}{t(Math.min(4, products.length))}{t(" of ")}{t(products.length)}{t(" pieces ")}<small>{t("/ ")}{t(category)}</small></span></div><div className="product-grid collection-preview-grid">{t(products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} saved={wishlist.includes(p.id)} onToggleWish={onToggleWish} onQuickView={onQuickView} />))}</div>{t(!products.length && <p className="empty">{t("No rugs found.")}</p>)}<div className="collection-more"><span>{t("There’s more to fall in love with.")}</span><button className="button olive" onClick={onViewMore}>{t("View more · ")}{t(category)}<ArrowUpRight size={18} /></button></div></div>;
}
