import { t } from '../i18n';
import React, { useEffect, useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import Rug from './Rug';
import { discountedPrice, discountPercent, featuredSize } from '../pricing';
export default function ProductCard({
  product,
  saved,
  onToggleWish,
  onQuickView
}) {
  const p = product;
  const size = featuredSize(p);
  const displayImage = size?.images?.[0] || p.image || p.images?.[0];
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [p.id, displayImage]);
  const priceProduct = size ? { price: size.price ?? p.price, discountPercentage: size.discountPercentage ?? p.discountPercentage } : p;
  const discount = discountPercent(priceProduct);
  const salePrice = discountedPrice(priceProduct);
  return <article className="product-card premium-product-card">
    <div className="product-image">
      <button className="product-open" onClick={() => onQuickView(p)} aria-label={`View ${p.name}`}>
        {displayImage && !imageFailed ? <img className="catalog-product-image" src={displayImage} alt={p.name} loading="lazy" onError={() => setImageFailed(true)} /> : <Rug design={p.design} />}
      </button>
      <button className={`wish ${saved ? 'saved' : ''}`} aria-label={`${saved ? 'Remove' : 'Save'} ${p.name}`} onClick={() => onToggleWish(p.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className="quick-view" onClick={() => onQuickView(p)}>{t('Quick view')}<Plus size={15} /></button>
    </div>
    <div className="premium-product-info">
      <div className="premium-product-kicker"><span>{t(p.category || p.type || 'Handcrafted rug')}</span><div className="swatches">{t((p.palette || []).slice(0, 4).map((color, index) => <span key={`${color}-${index}`} style={{ background: color }} />))}</div></div>
      <div className="product-details"><button onClick={() => onQuickView(p)} title={p.name}>{t(p.name)}</button><span className="product-prices">{discount > 0 && <del>₹{t(Number(priceProduct.price || 0).toLocaleString('en-IN'))}</del>}<b>₹{t(salePrice.toLocaleString('en-IN'))}</b></span>{discount > 0 && <span className="product-card-discount">{discount}% OFF</span>}</div>
      {p.tag && <span className="premium-product-tag-below-price">{t(p.tag)}</span>}
      {size?.label && <span className="premium-product-size-label">{t(size.label)}</span>}
      {size?.label && <p className="premium-product-size">Price shown for {t(size.label)}</p>}
    </div>
  </article>;
}
