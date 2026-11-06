import { t } from '../i18n';
import React, { useState } from 'react';
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-react';
import Rug from './Rug';
import { discountedPrice, discountPercent, featuredSize } from '../pricing';
export function DesignRibbon({ content = {} }) {
  const phrases = [content.ribbon1 || 'Natural fibres.', content.ribbon2 || 'Human hands.', content.ribbon3 || 'Extraordinary homes.', content.ribbon4 || 'Beautifully Rugs.'];
  return <div className="design-ribbon" aria-label={t(phrases.join(' '))}>{phrases.map((phrase, i) => <React.Fragment key={i}><span className={i === 3 ? 'ribbon-last' : ''}>{t(phrase)}</span>{i < 3 && <b>{t('✳')}</b>}</React.Fragment>)}</div>;
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
  const product = selectedProduct || { id: 'signature-product-placeholder', name: 'Choose a product in admin', type: 'Your featured rug will appear here', price: 0, design: 'sandstone' };
  const featuredVariant = featuredSize(product);
  const priceProduct = featuredVariant ? { ...product, price: featuredVariant.price ?? product.price, discountPercentage: featuredVariant.discountPercentage ?? product.discountPercentage } : product;
  const salePrice = discountedPrice(priceProduct);
  const discount = discountPercent(priceProduct);
  const productImages = hasProduct ? [...(featuredVariant?.images || []), ...(product.signatureImages || []), ...(product.images || []), product.image].filter((image, index, all) => Boolean(image) && all.indexOf(image) === index) : [];
  const activeImage = productImages.length ? productImages[imageIndex % productImages.length] : '';
  function chooseProduct(index) { setActive(index); setImageIndex(0); }
  return <section className="signature-edit" aria-label={t("The statement collection")}>
    <div className="signature-top"><span className="eyebrow">{t(content.signatureEyebrow || "OBJECTS OF AFFECTION / THE SIGNATURE EDIT")}</span><span>{t(content.signatureKicker || "CONSIDERED DESIGN, FROM THE GROUND UP.")}</span></div>
    <div className="signature-layout">
      <div className="signature-copy">
        {/* <span className="signature-index">{t("N° 0")}{t(active + 1)}</span> */}
        <h2>{t(content.signatureTitle || "Not just a room. A feeling.")}</h2><p>{t(content.signatureBody || "A sculptural line. An unexpected colour. That one piece that makes everything feel like you.")}</p><button className="signature-cta" disabled={!hasProduct} onClick={() => hasProduct && onSelect(product)}>{t(hasProduct ? content.signatureButton || "Meet your statement piece " : "Choose a featured product in admin")}<span><ArrowUpRight size={25} /></span></button><div className="signature-pagination" aria-label={t("Choose a signature rug")}>{t(featuredProducts.map((p, i) => <button key={p._id || p.id} onClick={() => chooseProduct(i)} aria-label={`Show ${p.name}`} aria-pressed={active === i}><span>{t("0")}{t(i + 1)}</span><i /></button>))}</div></div>
      <div className={`signature-stage statement-${product.design}`}><div className="signature-plinth" />{activeImage ? <button type="button" className="signature-rug signature-rug-button" onClick={() => hasProduct && onSelect(product)} aria-label={`View details for ${product.name}`} disabled={!hasProduct}><img src={activeImage} alt={product.name} /></button> : <button type="button" className="signature-rug signature-rug-button" onClick={() => hasProduct && onSelect(product)} aria-label={`View details for ${product.name}`} disabled={!hasProduct}><Rug design={product.design} /></button>}{productImages.length > 1 && <div className="signature-image-nav"><button type="button" aria-label="Previous product image" onClick={() => setImageIndex(index => (index + productImages.length - 1) % productImages.length)}>‹</button><span>{imageIndex + 1} / {productImages.length}</span><button type="button" aria-label="Next product image" onClick={() => setImageIndex(index => (index + 1) % productImages.length)}>›</button></div>}<span className="stage-coordinate">{t(content.signatureCoordinate || "TEXTURE / FORM / FEELING")}</span>{hasProduct && <button className="signature-hotspot" onClick={() => onSelect(product)} aria-label={`View ${product.name}`}><Plus size={22} /></button>}<div className="signature-product"><span><small>{t(content.signatureFocusLabel || "THE PIECE IN FOCUS")}</small><b>{t(product.name)}</b>{hasProduct && <span>{t(product.type)} · <b>₹{t(salePrice.toLocaleString('en-IN'))}</b>{discount > 0 && <><del> ₹{t(priceProduct.price.toLocaleString('en-IN'))}</del><strong className="signature-discount">{discount}% OFF</strong></>}</span>}</span>{hasProduct && <button aria-label={`Discover ${product.name}`} onClick={() => onSelect(product)}><ArrowRight size={25} /></button>}</div></div>
    </div>
    <div className="signature-bottom"><span>{t(content?.signatureStep1 || "01 / MATERIALS WITH MEANING")}</span><span>{t(content.signatureStep2 || "02 / ARTISTRY IN EVERY THREAD")}</span><span>{t(content.signatureStep3 || "03 / DESIGNED TO BELONG")}</span></div>
  </section>;
}
