import { t } from '../i18n';
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Rug from './Rug';
import RichContent from './RichContent';
import { discountedPrice, discountPercent, featuredSize } from '../pricing';
export function DesignRibbon({ content = {} }) {
  const phrases = [content.ribbon1, content.ribbon2, content.ribbon3, content.ribbon4];
  if (!phrases.some(phrase => typeof phrase === 'string' && phrase.trim())) return null;
  return <div className="design-ribbon" aria-label={t(phrases.filter(Boolean).join(' '))}>{phrases.map((phrase, i) => <React.Fragment key={i}><span className={i === 3 ? 'ribbon-last' : ''}>{phrase?.trim() ? t(phrase) : <i className="home-skeleton-block ribbon-phrase-skeleton" />}</span>{i < 3 && <b>{t('✳')}</b>}</React.Fragment>)}</div>;
}
export default function SignatureEdit({
  products,
  onSelect,
  content = {}
}) {
  const [active, setActive] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const curatedProducts = (content.signatureProducts || []).map(item => {
    const product = products.find(candidate => String(candidate._id || candidate.id) === String(item.productId));
    return product ? { ...product, signatureImages: item.images || [] } : null;
  }).filter(Boolean);
  const featuredProducts = curatedProducts.length ? curatedProducts : products.slice(0, 3);
  const selectedProduct = featuredProducts[active] || featuredProducts[0];
  const hasProduct = Boolean(selectedProduct);
  const product = selectedProduct || { id: 'signature-product-placeholder', name: '', type: '', price: 0, design: 'sandstone' };
  const featuredVariant = featuredSize(product);
  const priceProduct = featuredVariant ? { ...product, price: featuredVariant.price ?? product.price, discountPercentage: featuredVariant.discountPercentage ?? product.discountPercentage } : product;
  const salePrice = discountedPrice(priceProduct);
  const discount = discountPercent(priceProduct);
  const productImages = hasProduct ? [...(featuredVariant?.images || []), ...(product.signatureImages || []), ...(product.images || []), product.image].filter((image, index, all) => Boolean(image) && all.indexOf(image) === index) : [];
  const activeImage = productImages.length ? productImages[imageIndex % productImages.length] : '';
  function chooseProduct(index) { setActive(index); setImageIndex(0); }
  useEffect(() => {
    if (featuredProducts.length < 2 && productImages.length < 2) return undefined;
    const timer = window.setTimeout(() => {
      if (imageIndex + 1 < productImages.length) setImageIndex(imageIndex + 1);
      else { setActive(index => (index + 1) % featuredProducts.length); setImageIndex(0); }
    }, 4800);
    return () => window.clearTimeout(timer);
  }, [active, featuredProducts.length, imageIndex, productImages.length]);
  return <section className="signature-edit" aria-label={t("The statement collection")}>
    <div className="signature-top"><span className="eyebrow">{content.signatureEyebrow?.trim() ? t(content.signatureEyebrow) : <i className="home-skeleton-block signature-copy-skeleton eyebrow" />}</span><span>{content.signatureKicker?.trim() ? t(content.signatureKicker) : <i className="home-skeleton-block signature-copy-skeleton kicker" />}</span></div>
    <div className="signature-layout">
      <div className="signature-copy">
        {/* <span className="signature-index">{t("N° 0")}{t(active + 1)}</span> */}
        <h2>{content.signatureTitle?.trim() ? t(content.signatureTitle) : <i className="home-skeleton-block signature-copy-skeleton title" />}</h2>{content.signatureBody?.trim() ? <RichContent className="signature-description rich-content-block" value={t(content.signatureBody)} /> : <i className="home-skeleton-block signature-copy-skeleton body" />}{content.signatureCoordinate?.trim() ? <p className="signature-coordinate-copy">{t(content.signatureCoordinate)}</p> : <i className="home-skeleton-block signature-copy-skeleton coordinate" />}{content.signatureButton?.trim() && hasProduct ? <button className="signature-cta" onClick={() => onSelect(product)}>{t(content.signatureButton)}<span><ArrowUpRight size={25} /></span></button> : <i className="home-skeleton-block signature-copy-skeleton button" />}<div className="signature-pagination" aria-label="Loading featured products">{featuredProducts.length ? featuredProducts.map((p, i) => <button key={p._id || p.id} onClick={() => chooseProduct(i)} aria-label={`Show ${p.name}`} aria-pressed={active === i}><span>{t('0')}{t(i + 1)}</span><i /></button>) : <i className="home-skeleton-block signature-copy-skeleton pagination" />}</div></div>
      <div className={`signature-stage statement-${product.design}`}>{hasProduct ? <><div className="signature-plinth" />{activeImage ? <button type="button" className="signature-rug signature-rug-button" onClick={() => onSelect(product)} aria-label={`View details for ${product.name}`}><img key={`${product.id}-${imageIndex}-${activeImage}`} src={activeImage} alt={product.name} /></button> : <button type="button" className="signature-rug signature-rug-button" onClick={() => onSelect(product)} aria-label={`View details for ${product.name}`}><Rug design={product.design} /></button>}<div className="signature-product">{productImages.length > 1 && <div className="signature-image-nav"><button type="button" aria-label="Previous product image" onClick={() => setImageIndex(index => (index + productImages.length - 1) % productImages.length)}>‹</button><span>{imageIndex + 1} / {productImages.length}</span><button type="button" aria-label="Next product image" onClick={() => setImageIndex(index => (index + 1) % productImages.length)}>›</button></div>}<div className="signature-product-details"><small>{content.signatureFocusLabel?.trim() ? t(content.signatureFocusLabel) : <i className="home-skeleton-block signature-copy-skeleton focus" />}</small><b>{t(product.name)}</b><span>{t(product.type)} · <b>${t(salePrice.toLocaleString('en-US'))}</b>{discount > 0 && <><del> ${t(priceProduct.price.toLocaleString('en-US'))}</del><strong className="signature-discount">{discount}% OFF</strong></>}</span></div><button aria-label={`Discover ${product.name}`} onClick={() => onSelect(product)}><ArrowRight size={25} /></button></div></> : <i className="home-skeleton-block signature-stage-placeholder" />}</div>
    </div>
    <div className="signature-bottom">{[1, 2, 3].map(index => { const value = content[`signatureStep${index}`]; return <span key={index}>{value?.trim() ? t(value) : <i className="home-skeleton-block signature-copy-skeleton step" />}</span>})}</div>
  </section>;
}
