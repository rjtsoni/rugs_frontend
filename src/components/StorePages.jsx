import { t } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Copy, Check, ShoppingBag, ZoomIn, ZoomOut, Truck, RefreshCcw, Hand, Package, Share2, X, Trash2, ShieldCheck, RotateCcw, Headphones, ChevronRight, Search, Mail, MapPin, Phone, Clock3, MessageCircle, UserRound, PenLine, Send, Star } from 'lucide-react';
import ProductCard from './ProductCard';
import Rug from './Rug';
import { discountedPrice, discountPercent, featuredSize } from '../pricing';
import { customerApi, submitContactMessage, getProductReviews, submitProductReview } from '../services/api';
import './StorePages.css';
const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
export const productPath = p => `/products/${p.slug || `${p.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}`;
function Breadcrumbs({ items, navigate }) {
  return <nav className="store-breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 && <ChevronRight size={14} aria-hidden="true" />}{item.href && index < items.length - 1 ? <button onClick={() => navigate(item.href)}>{t(item.label)}</button> : <span aria-current="page">{t(item.label)}</span>}</li>)}</ol></nav>;
}
export function CopyLink({
  product
}) {
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState(false);
  const url = new URL(productPath(product), window.location.origin).href;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('URL copied!');
      setFallback(false);
    } catch {
      setFallback(true);
      setStatus('Select and copy this link:');
    }
  }
  return <div className="copy-link"><button onClick={copy}>{t(status === 'URL copied!' ? <Check size={17} /> : <Copy size={17} />)} {t(status === 'URL copied!' ? status : 'Copy URL')}</button><span role="status">{t(fallback ? status : '')}</span>{t(fallback && <input aria-label="Product share URL" readOnly value={url} onFocus={e => e.target.select()} />)}</div>;
}
export function CollectionPage({ category, categories = [], products = [], page = 1, limit = 9, total = 0, totalPages = 1, keyword = '', loading = false, error = '', navigate, wishlist, onToggleWish, onQuickView, subcategories = [] }) {
  const [searchDraft, setSearchDraft] = useState(keyword);
  useEffect(() => setSearchDraft(keyword), [keyword]);
  const current = Math.max(1, Number(page) || 1);
  const pages = Math.max(1, Number(totalPages) || 1);
  const selectedCategory = categories.find(item => item.name === category);
  const categoryImage = selectedCategory?.image || products.find(product => product.image || product.images?.[0])?.image || products.find(product => product.images?.[0])?.images?.[0];
  const makeUrl = (nextPage, nextLimit, nextKeyword) => {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    if (nextLimit !== 9) params.set('limit', String(nextLimit));
    if (nextKeyword?.trim()) params.set('keyword', nextKeyword.trim());
    const query = params.toString();
    return `/collections/${encodeURIComponent(category)}${query ? `?${query}` : ''}`;
  };
  const go = nextPage => navigate(makeUrl(nextPage, limit, keyword));
  function submitSearch(event) { event.preventDefault(); navigate(makeUrl(1, limit, searchDraft.trim())); }
  function changeLimit(event) { navigate(makeUrl(1, Number(event.target.value), keyword)); }
  return <main className="store-page">
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, ...(category !== 'All rugs' ? [{ label: 'All rugs', href: '/collections/All%20rugs' }] : []), { label: category }]} navigate={navigate} />
    <div className="store-page-heading"><span className="eyebrow">{t(subcategories.length ? 'EXPLORE THE SUBCOLLECTIONS' : 'THE COMPLETE RUGS EDIT')}</span><h1>{t(category)}</h1><p>{t(subcategories.length ? 'Choose a collection to see its rugs.' : 'Considered pieces. Natural textures. Find your forever rug.')}</p></div>
    {(categoryImage || category === 'All rugs') && <div className={`collection-feature-image ${category === 'All rugs' ? 'all-rugs' : ''}`}><img src={categoryImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85'} alt={`${category} rugs`} /></div>}
    <nav className="collection-category-picker" aria-label={t('Choose a category')}><button className={category === 'All rugs' ? 'is-selected' : ''} onClick={() => navigate('/collections/All%20rugs')}>{t('All rugs')}</button>{categories.filter(item => item.active !== false && !item.parentCategory).map(item => <button key={item._id || item.slug} className={category === item.name ? 'is-selected' : ''} onClick={() => navigate(`/collections/${encodeURIComponent(item.name)}`)}>{t(item.name)}</button>)}</nav>
    {subcategories.length > 0 && <section className="subcategory-grid" aria-label={t('Subcategories')}>{subcategories.map((subcategory, index) => <button className="subcategory-card" key={subcategory._id || subcategory.slug} onClick={() => navigate(`/collections/${encodeURIComponent(subcategory.name)}`)}><span className={`subcategory-card-image subcategory-tone-${index % 4}`}>{subcategory.image ? <img src={subcategory.image} alt={subcategory.name} /> : <i />}</span><span className="subcategory-card-copy"><small>{t('SUBCOLLECTION')} · {String(index + 1).padStart(2, '0')}</small><strong>{t(subcategory.name)}</strong><span>{t(subcategory.note || subcategory.description || 'Explore the collection.')}</span><ArrowUpRight size={18} /></span></button>)}</section>}
    <div className="collection-toolbar"><form className="collection-search" role="search" onSubmit={submitSearch}><Search size={17} aria-hidden="true" /><input type="search" value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder="Search rugs by name, material or style" aria-label="Search rugs" /><button type="submit" aria-label="Submit search"><ArrowUpRight size={17} /></button></form><label className="collection-limit"><span>Products per page</span><select value={limit} onChange={changeLimit}><option value="6">6</option><option value="9">9</option><option value="12">12</option><option value="24">24</option></select></label>{keyword && <button className="collection-search-meta" onClick={() => { setSearchDraft(''); navigate(makeUrl(1, limit, '')); }}>Clear “{keyword}”</button>}</div>
    <div className="listing-meta"><span>{loading ? 'Loading products…' : `${total} ${total === 1 ? 'piece' : 'pieces'}${keyword ? ` matching “${keyword}”` : ''}`}</span><span>{t('Page ')}{t(current)}{t(' of ')}{t(pages)}</span></div>
    {error && <p className="collection-error" role="alert">{error}</p>}
    {loading && !products.length ? <div className="product-grid skeleton-product-grid" role="status" aria-label="Loading products" aria-busy="true">{Array.from({ length: Math.min(limit, 9) }, (_, index) => <div className="skeleton-product" key={index}><i /><span /><small /></div>)}</div> : <div className="product-grid">{products.map(product => <ProductCard key={product.id || product._id} product={product} saved={wishlist.includes(product.id || product._id)} onToggleWish={onToggleWish} onQuickView={onQuickView} />)}</div>}
    {!loading && !products.length && <div className="empty"><h3>{keyword ? 'No rugs match that search.' : 'No products found in this collection.'}</h3><p>{keyword ? 'Try another name, material or style.' : 'Please check back soon for new pieces.'}</p></div>}
    <nav className="pagination" aria-label={t('Collection pagination')}><button disabled={current === 1 || loading || pages <= 1} onClick={() => go(current - 1)} aria-label={t('Previous page')}><ArrowLeft size={17} /></button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} aria-current={current === number ? 'page' : undefined} disabled={loading || pages <= 1} onClick={() => go(number)}>{number}</button>)}<button disabled={current === pages || loading || pages <= 1} onClick={() => go(current + 1)} aria-label={t('Next page')}><ArrowRight size={17} /></button></nav>
  </main>;
} export function ProductPage({
  product,
  size,
  setSize,
  onAdd,
  onBuyNow,
  navigate,
  saved,
  onToggleWish,
  onEnquiry,
  products = [],
  wishlist = []
}) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const [activeSize, setActiveSize] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const [shareMessage, setShareMessage] = useState('');
  const chosenSize = sizes.find(item => item.label === activeSize) || featuredSize(product) || sizes[0] || null;
  const selectedSizeLabel = chosenSize?.label || '';
  const baseImages = product ? [product.image, ...(product.images || [])].filter(Boolean) : [];
  const productImages = chosenSize?.images?.length ? [...chosenSize.images, ...baseImages].filter((image, index, all) => Boolean(image) && all.indexOf(image) === index) : baseImages;
  const regularPrice = Number(chosenSize?.price ?? product?.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(chosenSize?.discountPercentage ?? product?.discountPercentage) || 0));
  const salePrice = Math.round(regularPrice * (1 - discount / 100));
  const [reviewSummary, setReviewSummary] = useState({ rating: 0, reviewCount: 0 });
  const [reviews, setReviews] = useState([]);
  const reviewsTrackRef = useRef(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsLoadError, setReviewsLoadError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDraft, setReviewDraft] = useState({ name: '', email: '', body: '', media: '' });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const rating = Math.min(5, Math.max(0, Number(reviewSummary.rating) || 0));
  const reviewCount = Math.max(0, Number(reviewSummary.reviewCount) || 0);
  const productId = String(product?.id || product?._id || '');
  const normalizeCategory = value => String(value?.name || value || '').trim().toLocaleLowerCase();
  const categoryProducts = products.filter(item => String(item.id || item._id) !== productId && normalizeCategory(item.category) === normalizeCategory(product?.category));
  const youMayAlsoLikeProducts = products.filter(item => String(item.id || item._id) !== String(product?.id || product?._id) && item.youMayAlsoLike).slice(0, 4);
  const youMayAlsoLikeIds = new Set(youMayAlsoLikeProducts.map(item => String(item.id || item._id)));
  const similarProducts = categoryProducts.filter(item => !youMayAlsoLikeIds.has(String(item.id || item._id))).slice(0, 4);
  const details = product?.details || {};
  const craftStory = {
    image: details.craftImage || productImages[0] || '',
    eyebrow: details.craftEyebrow || 'THE CRAFT BEHIND EVERY PIECE',
    title: details.craftTitle || 'Made by hand, finished for modern homes',
    paragraphs: [details.craftDescription || 'Every rug carries the character of handmade textile work: considered materials, patient weaving, and small variations that make each piece personal.', details.craftSecondParagraph || 'From material selection to final finishing, each rug brings natural texture and everyday warmth into your home.'],
    points: [1, 2, 3].map((index) => ({ title: details[`craftPoint${index}Title`] || ['Handmade', 'Natural', 'Finished'][index - 1], caption: details[`craftPoint${index}Caption`] || ['Woven with a human touch', 'Materials chosen for their texture', 'Made for everyday living'][index - 1] })),
    steps: [1, 2, 3].map((index) => ({ title: details[`craftStep${index}Title`] || ['Material selection', 'Artisan making', 'Finishing and care'][index - 1], body: details[`craftStep${index}Body`] || ['Fibres and colours are chosen for the intended texture and feel.', 'Weaving gives each rug its surface, character, and natural variation.', 'Each piece is finished with care for the home it will live in.'][index - 1] })),
    notesTitle: details.craftExpectTitle || 'WHAT TO EXPECT FROM HANDMADE RUGS',
    notes: [details.craftExpect1 || 'Small variations in colour, size, and texture are part of handcraft.', details.craftExpect2 || 'Natural fibres and handmade details give every rug its own character.', details.craftExpect3 || 'Rotate and vacuum gently to care for the surface over time.']
  };
  const shareProduct = async () => {
    const url = new URL(productPath(product), window.location.origin).href;
    try { if (navigator.share) await navigator.share({ title: product.name, text: product.description || product.name, url }); else if (navigator.clipboard) { await navigator.clipboard.writeText(url); setShareMessage('Link copied'); } else window.prompt('Copy product link', url); } catch { /* User dismissed the native share sheet. */ }
  };
  useEffect(() => { setImageIndex(0); setZoom(false); setShareMessage(''); setActiveSize(featuredSize(product)?.label || ''); }, [product?.id]);
  useEffect(() => { setImageIndex(0); setZoom(false); }, [activeSize]);
  useEffect(() => {
    let active = true;
    setReviewsLoading(true); setReviewsLoadError(''); setReviews([]); setReviewSummary({ rating: 0, reviewCount: 0 });
    if (!product?.id) { setReviewsLoading(false); return () => { active = false; }; }
    getProductReviews(product.id, { page: 1, limit: 5 }).then(data => {
      if (!active) return;
      setReviews(data.reviews || []);
      setReviewSummary({ rating: Number(data.rating) || 0, reviewCount: Number(data.reviewCount) || 0 });
    }).catch(() => { if (active) { setReviews([]); setReviewSummary({ rating: 0, reviewCount: 0 }); setReviewsLoadError('Reviews could not be loaded right now. Please try again shortly.'); } }).finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [product?.id]);
  useEffect(() => {
    if (!showReviewForm) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => { if (event.key === 'Escape') setShowReviewForm(false); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape); };
  }, [showReviewForm]);
  async function handleReviewSubmit(event) {
    event.preventDefault(); if (reviewSending || !reviewRating) return;
    setReviewSending(true); setReviewError('');
    try {
      const data = await submitProductReview(product.id, { ...reviewDraft, rating: reviewRating });
      setReviews(current => [data.review, ...current].slice(0, 5)); setReviewSummary({ rating: data.rating, reviewCount: data.reviewCount }); setReviewDraft({ name: '', email: '', body: '', media: '' }); setReviewRating(0); setShowReviewForm(false);
    } catch (error) { setReviewError(error.message || 'Could not submit your review. Please try again.'); }
    finally { setReviewSending(false); }
  }
  function handleReviewPhoto(event) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setReviewError('Choose an image smaller than 2 MB.'); event.target.value = ''; return; }
    setReviewError(''); const reader = new FileReader(); reader.onload = () => setReviewDraft(current => ({ ...current, media: String(reader.result || '') })); reader.onerror = () => setReviewError('Could not read this image.'); reader.readAsDataURL(file);
  }
  if (!product) return <main className="store-page"><h1>{t("Piece not found.")}</h1><button className="text-link" onClick={() => navigate('/')}>{t("Return home ")}<ArrowRight size={18} /></button></main>;
  return <main className="store-page product-detail-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All rugs', href: '/collections/All%20rugs' }, ...(product.category && product.category !== 'All rugs' ? [{ label: product.category, href: `/collections/${encodeURIComponent(product.category)}` }] : []), { label: product.name }]} navigate={navigate} /><div className="detail-layout"><div className="detail-art" onMouseMove={event => { if (!zoom) return; const rect = event.currentTarget.getBoundingClientRect(); setZoomOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`); }} onMouseLeave={() => setZoom(false)}>{productImages.length ? <><img className={zoom ? 'is-zoomed' : ''} src={productImages[imageIndex]} alt={`${product.name}, ${selectedSizeLabel}, image ${imageIndex + 1}`} onClick={() => setZoom(value => !value)} />{zoom && <span className="detail-zoom-lens" style={{ left: zoomOrigin.split(' ')[0], top: zoomOrigin.split(' ')[1], backgroundImage: `url("${productImages[imageIndex]}")`, backgroundPosition: zoomOrigin }} aria-hidden="true" />}<button className="detail-zoom-toggle" type="button" aria-label={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => setZoom(value => !value)}>{zoom ? <ZoomOut size={17} /> : <ZoomIn size={17} />}</button>{productImages.length > 1 && <><div className="detail-thumbnails">{productImages.map((image, index) => <button type="button" className={index === imageIndex ? 'active' : ''} key={`${index}-${image.slice(0, 24)}`} aria-label={`Show image ${index + 1}`} onClick={() => setImageIndex(index)}><img src={image} alt="" /></button>)}</div><div className="detail-image-nav"><button type="button" aria-label="Previous product image" onClick={() => setImageIndex(index => (index + productImages.length - 1) % productImages.length)}>‹</button><span>{imageIndex + 1} / {productImages.length}</span><button type="button" aria-label="Next product image" onClick={() => setImageIndex(index => (index + 1) % productImages.length)}>›</button></div></>}</> : <Rug design={product.design} />}<span>{t("")}</span></div><div className="detail-copy"><span className="eyebrow">{t("THE Rugs COLLECTION ")}{t(String(product.id).padStart(2, '0'))}</span><h1>{t(product.name)}</h1><p>{t(product.type)}{t(" · Made in India")}</p><button type="button" className="product-rating-link" onClick={() => document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth" })}><span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < Math.round(rating) ? "currentColor" : "none"} />)}</span><b>{reviewCount ? rating.toFixed(1) : "New"}</b><u>{reviewCount ? `${reviewCount} reviews` : "No reviews yet"}</u></button><div className="detail-price"><b>₹{t(salePrice.toLocaleString('en-IN'))}</b>{discount > 0 && <><del>₹{t(regularPrice.toLocaleString('en-IN'))}</del><span>{discount}% OFF</span></>}</div><p>{t(product.description || `A thoughtful foundation for a beautiful home. ${product.name} brings natural texture, considered colour and the character of handcraft into your favourite spaces.`)}</p><div className="product-benefits"><div><Truck size={21} /><span><b>{details.freeDelivery === false ? 'Delivery charge' : 'Free delivery'}</b><small>{details.delivery || (details.freeDelivery === false ? money(details.deliveryCharge) : 'For this product')}</small></span></div><div><RefreshCcw size={21} /><span><b>Returns & replacement</b><small>{details.returns || 'Contact us for eligibility'}</small></span></div><div><Hand size={21} /><span><b>Handcrafted</b><small>{details.origin || 'Made in India'}</small></span></div><div><Package size={21} /><span><b>{details.material || product.type || 'Thoughtful materials'}</b><small>{details.texture || 'Made for everyday living'}</small></span></div></div><span className="modal-size-heading">{t("Choose your size")}</span>{sizes.length ? <><details className="modal-size-dropdown"><summary><span className="modal-size-current-label">{t(selectedSizeLabel || "Choose your size")}</span><span className="modal-size-current-price">{money(salePrice)}{discount > 0 && <><del>{money(regularPrice)}</del><i>{discount}% OFF</i></>}</span></summary><div className="modal-size-options" role="listbox" aria-label={t("Choose your size")}>
    {sizes.map(item => { const label = item.label; const priceProduct = { price: item.price ?? product.price, discountPercentage: item.discountPercentage ?? product.discountPercentage }; const price = Number(priceProduct.price) || 0; const sale = discountedPrice(priceProduct); const percent = discountPercent(priceProduct); const isSelected = selectedSizeLabel === label; return <button type="button" className={`modal-size-option${isSelected ? ' is-selected' : ''}`} role="option" aria-selected={isSelected} key={label} onClick={e => { setActiveSize(label); setSize(label); e.currentTarget.closest('details').open = false; }}><span className="modal-size-label">{t(label)}</span><span className="modal-size-prices">{percent > 0 && <del>{money(price)}</del>}<b>{money(sale)}</b>{percent > 0 && <i>{percent}% OFF</i>}</span></button>; })}
  </div></details><div className="size-price-note">{discount > 0 ? `${discount}% discount included in price · You save ${money(regularPrice - salePrice)} on this size` : 'Price shown is for the selected size.'}</div></> : <p className="size-price-note">Size options will be available soon.</p>}<div className="detail-all-actions"><div className="detail-purchase-actions"><button className="button olive" disabled={!sizes.length} onClick={() => onAdd(product, selectedSizeLabel, chosenSize)}>{t("Add to bag ")}<ShoppingBag size={19} /></button><button className="button buy-now" disabled={!sizes.length} onClick={() => onBuyNow(product, selectedSizeLabel, chosenSize)}>{t("Buy now")}</button></div><div className="detail-enquiry-actions"><button type="button" onClick={onEnquiry}>Bulk & Custom Orders</button>
      {/* <button type="button" onClick={onEnquiry}>Custom</button> */}
    </div></div><div className="detail-actions"><button onClick={() => onToggleWish(product.id)}>{t(saved ? '♥ Saved to wishlist' : '♡ Save to wishlist')}</button><button type="button" onClick={shareProduct}><Share2 size={15} /> Share</button><CopyLink key={product.id} product={product} /></div>{shareMessage && <small className="share-status" role="status">{shareMessage}</small>}{product.details?.highlights && <details open><summary>Highlights</summary><p>{product.details.highlights}</p></details>}<details open><summary>{t("Materials & craftsmanship")}</summary><p>{product.details?.material || product.type}{product.details?.texture ? ` · ${product.details.texture}` : ''}{product.details?.origin ? ` · ${product.details.origin}` : ''}{product.details?.pileThickness ? ` · ${product.details.pileThickness}` : ''}</p></details>{product.details?.care ? <details><summary>Care & everyday living</summary><p>{product.details.care}</p></details> : <details><summary>{t("Care & everyday living")}</summary><p>{t("Vacuum gently without a rotating brush, rotate periodically and blot spills immediately. Keep natural jute dry. Professional cleaning is recommended for deep stains.")}</p></details>}<details><summary>Specifications</summary><div className="product-specifications">{[['SKU', product.details?.sku], ['Material', product.details?.material || product.type], ['Texture', product.details?.texture], ['Pile thickness', product.details?.pileThickness], ['Origin', product.details?.origin], ['Category', product.category]].filter(([, value]) => value).map(([label, value]) => <p key={label}><span>{label}</span><b>{value}</b></p>)}</div></details></div></div>
<section className="related-products"><div className="related-products-heading"><span className="eyebrow">MORE FROM THIS COLLECTION</span><h2>Similar rugs</h2><p>Explore more pieces from {product.category}.</p></div><div className="product-grid">{similarProducts.length ? similarProducts.map(item => <ProductCard key={item.id || item._id} product={item} saved={wishlist.includes(item.id || item._id)} onToggleWish={onToggleWish} onQuickView={selected => navigate(productPath(selected))} />) : <div className="related-products-empty"><p>More rugs from this collection are coming soon.</p><button type="button" onClick={() => navigate(`/collections/${encodeURIComponent(product.category)}`)}>Browse {product.category}</button></div>}</div></section>
{youMayAlsoLikeProducts.length > 0 && <section className="related-products you-may-also-like"><div className="related-products-heading"><span className="eyebrow">CURATED FOR YOU</span><h2>You may also like</h2><p>Handpicked pieces to complement your choice.</p></div><div className="product-grid">{youMayAlsoLikeProducts.map(item => <ProductCard key={item.id || item._id} product={item} saved={wishlist.includes(item.id || item._id)} onToggleWish={onToggleWish} onQuickView={selected => navigate(productPath(selected))} />)}</div></section>}<section className="product-review-summary" id="product-reviews"><div className="product-review-score"><b>{reviewCount ? rating.toFixed(1) : "—"}</b><span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={18} fill={index < Math.round(rating) ? "currentColor" : "none"} />)}</span><small>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</small></div><div className="product-reviews-content"><div className="product-reviews-heading"><div><span className="eyebrow">CUSTOMER FEEDBACK</span><h2>Ratings & reviews</h2><p>{reviewCount ? `Rated ${rating.toFixed(1)} out of 5 from ${reviewCount} customer reviews.` : "No reviews yet. Share your experience with this rug."}</p></div><button className="write-review-button" type="button" onClick={() => { setShowReviewForm(open => !open); setReviewError(""); }}>Write a review</button></div>{reviewsLoading ? <p className="product-reviews-loading">Loading reviews…</p> : <>{reviewsLoadError && <p className="product-review-error" role="status">{reviewsLoadError}</p>}<div className="product-review-carousel"><button type="button" aria-label="Previous reviews" onClick={() => reviewsTrackRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}><ArrowLeft size={17} /></button><div className="product-review-track" ref={reviewsTrackRef}>{reviews.slice(0, 5).map(review => <article className="product-review-card" key={review._id}><div className="product-review-card-head"><b>{review.name}</b><span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}</span><time>{review.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(review.createdAt)) : ''}</time></div><p>{review.body}</p>{review.media && <img className="product-review-photo" src={review.media} alt={'Photo shared by ' + review.name} loading="lazy" />}</article>)}</div><button type="button" aria-label="Next reviews" onClick={() => reviewsTrackRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}><ArrowRight size={17} /></button></div>{reviewCount > 0 && <button className="show-more-reviews" type="button" onClick={() => navigate('/products/' + product.id + '/reviews')}>Show more reviews <ArrowRight size={16} /></button>}</>}{showReviewForm && <div className="product-review-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowReviewForm(false); }}><div className="product-review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><form className="product-review-form" onSubmit={handleReviewSubmit}><header className="product-review-form-header"><h3 id="review-modal-title">Rate this product</h3><button type="button" aria-label="Close review form" onClick={() => setShowReviewForm(false)}><X size={20} /></button></header><div className="product-review-star-picker" role="radiogroup" aria-label="Choose a rating">{[1,2,3,4,5].map(value => <button type="button" key={value} role="radio" aria-checked={reviewRating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setReviewRating(value)}><Star size={28} fill={value <= reviewRating ? "currentColor" : "none"} /></button>)}</div><label>Write your review<textarea required minLength={5} maxLength={3000} value={reviewDraft.body} onChange={event => setReviewDraft(current => ({ ...current, body: event.target.value }))} placeholder="Tell other customers what you think about this product" /></label><label className="review-photo-field">Add a photo (optional)<input type="file" accept="image/*" onChange={handleReviewPhoto} />{reviewDraft.media && <img src={reviewDraft.media} alt="Review upload preview" />}</label><div className="product-review-form-grid"><label>Your name<input required minLength={2} maxLength={100} value={reviewDraft.name} onChange={event => setReviewDraft(current => ({ ...current, name: event.target.value }))} placeholder="Type your name here" /></label><label>Your email<input required type="email" maxLength={254} value={reviewDraft.email} onChange={event => setReviewDraft(current => ({ ...current, email: event.target.value }))} placeholder="email@example.com" /><small>Your email is private and won’t be shown publicly.</small></label></div>{reviewError && <p className="product-review-error" role="alert">{reviewError}</p>}<button className="write-review-button" type="submit" disabled={reviewSending || !reviewRating}>{reviewSending ? "Submitting…" : "Submit review"}</button></form></div></div>}</div></section>
<section className={`product-craft-story ${craftStory.image ? 'has-image' : 'without-image'}`}>{craftStory.image && <img src={craftStory.image} alt={craftStory.title} loading="lazy" />}<div className="product-craft-content"><span className="eyebrow">{craftStory.eyebrow}</span><h2>{craftStory.title}</h2>{craftStory.paragraphs.filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="product-craft-points">{craftStory.points.map((point, index) => <div key={index}><b>{point.title}</b><span>{point.caption}</span></div>)}</div><div className="product-craft-steps">{craftStory.steps.map((step, index) => <div key={index}><b><i>{index + 1}</i>{step.title}</b><p>{step.body}</p></div>)}</div><div className="product-craft-notes"><span className="eyebrow">{craftStory.notesTitle}</span><ul>{craftStory.notes.map((note, index) => <li key={index}>{note}</li>)}</ul></div></div></section></main>;
}

export function ProductReviewsPage({ product, page = 1, navigate }) {
  const [data, setData] = useState({ reviews: [], rating: 0, reviewCount: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!product?.id) { setLoading(false); return () => { active = false; }; }
    setLoading(true); setError('');
    getProductReviews(product.id, { page, limit: 10 }).then(result => {
      if (active) setData(result);
    }).catch(() => { if (active) setError('Reviews could not be loaded right now. Please try again shortly.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [product?.id, page]);
  if (!product) return <main className="store-page"><h1>Product not found.</h1><button className="text-link" onClick={() => navigate('/')}>Return home <ArrowRight size={18} /></button></main>;
  const goToPage = nextPage => navigate('/products/' + product.id + '/reviews?page=' + nextPage);
  return <main className="store-page product-reviews-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: product.name, href: productPath(product) }, { label: 'Reviews' }]} navigate={navigate} /><header className="reviews-page-heading"><span className="eyebrow">CUSTOMER FEEDBACK</span><h1>Reviews for {product.name}</h1><p>{data.reviewCount ? `${data.rating.toFixed(1)} out of 5 · ${data.reviewCount} customer reviews` : 'No reviews have been submitted yet.'}</p></header>{error && <p className="product-review-error" role="alert">{error}</p>}{loading ? <p className="product-reviews-loading">Loading reviews…</p> : data.reviews?.length ? <><div className="product-review-page-list">{data.reviews.map(review => <article className="product-review-card" key={review._id}><div className="product-review-card-head"><b>{review.name}</b><span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />)}</span><time>{review.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(review.createdAt)) : ''}</time></div><p>{review.body}</p>{review.media && <img className="product-review-photo" src={review.media} alt={'Photo shared by ' + review.name} loading="lazy" />}</article>)}</div><nav className="reviews-pagination" aria-label="Reviews pagination"><button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)}><ArrowLeft size={16} /> Previous</button><div className="reviews-page-numbers" aria-label="Choose reviews page">{Array.from({ length: data.pages }, (_, index) => index + 1).map(number => <button type="button" key={number} aria-current={page === number ? "page" : undefined} onClick={() => goToPage(number)}>{number}</button>)}</div><button type="button" disabled={page >= data.pages} onClick={() => goToPage(page + 1)}>Next <ArrowRight size={16} /></button></nav></> : !error && <div className="related-products-empty"><p>Be the first to review this rug.</p><button type="button" onClick={() => navigate(productPath(product) + '#product-reviews')}>Back to product</button></div>}</main>;
}

export function ContentPage({ page, navigate }) {
  if (!page) return <main className="store-page"><h1>Page not found.</h1><button className="text-link" onClick={() => navigate('/')}>Return home <ArrowLeft size={18} /></button></main>;
  return <main className="store-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: page.title || page.key }]} navigate={navigate} /><div className="store-page-heading"><span className="eyebrow">Rugs / OUR WORLD</span><h1>{t(page.title || page.key)}</h1>{page.subtitle && <p>{t(page.subtitle)}</p>}</div>{page.image && <img className="content-page-image" src={page.image} alt="" />}{page.body && <div className="content-page-body">{t(page.body)}</div>}</main>;
}

export function ContactPage({ contact = {} }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const enquirySubject = new URLSearchParams(window.location.search).get('subject') || '';
  const email = contact.email || '';
  const whatsapp = (contact.whatsapp || '').replace(/[^\d+]/g, '');
  const phone = (contact.phone || '').replace(/[^\d+]/g, '');
  const address = [contact.address, contact.city, contact.country].filter(Boolean).join(', ');
  useEffect(() => { if (enquirySubject) window.setTimeout(() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120); }, [enquirySubject]);
  const submit = async event => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setSending(true); setSubmitError('');
    try {
      await submitContactMessage({ name: values.get('name'), email: values.get('email'), phone: values.get('phone'), subject: values.get('subject') || 'Contact enquiry', message: values.get('message') });
      setSubmitted(true); form.reset();
    } catch (error) { setSubmitError(error.message || 'Could not send your message. Please try again.'); }
    finally { setSending(false); }
  };
  return <main className="contact-page">
    <section className="contact-hero"><div className="contact-hero-copy"><span className="eyebrow">{t(contact.eyebrow || 'WE WOULD LOVE TO HEAR FROM YOU')}</span><h1>{t(contact.title || 'Contact Us')}</h1><span className="contact-flourish">—　∞　—</span><p>{t(contact.intro || 'Have questions or want to leave a remark? Send us a message.')}</p></div><img src={contact.heroImage || 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=85'} alt="Handcrafted rug detail" /></section>
    <section className="contact-quick-grid" aria-label={t('Contact options')}>
      <a className="contact-quick-card" href={email ? `mailto:${email}` : '#contact-form'}><span><Mail /></span><h2>{t(contact.emailTitle || 'Email Us')}</h2><p>{t(contact.emailCaption || 'We reply within 24 hours')}</p><b>{email || t('Send us a message')}</b></a>
      <a className="contact-quick-card" href={whatsapp ? `https://wa.me/${whatsapp.replace('+','')}` : '#contact-form'} target={whatsapp ? '_blank' : undefined} rel="noreferrer"><span><MessageCircle /></span><h2>{t(contact.whatsappTitle || 'WhatsApp')}</h2><p>{t(contact.whatsappCaption || 'Chat with us instantly')}</p><b>{contact.whatsapp || t('Send us a message')}</b></a>
      <a className="contact-quick-card" href={phone ? `tel:${phone}` : '#contact-form'}><span><Phone /></span><h2>{t(contact.phoneTitle || 'Call Us')}</h2><p>{t(contact.hours || 'Mon - Sat: 9:30 AM - 6:30 PM')}</p><b>{contact.phone || t('Call our team')}</b></a>
      <div className="contact-quick-card"><span><MapPin /></span><h2>{t(contact.officeTitle || 'Our Office')}</h2><p>{contact.address || t('Visit us by appointment')}</p><b>{[contact.city, contact.country].filter(Boolean).join(', ')}</b></div>
    </section>
    <section className="contact-lower-grid"><article className="contact-other"><img src={contact.officeImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85'} alt="Warmly styled home with handcrafted rugs" /><div><span className="eyebrow">{t('HERE TO HELP')}</span><h2>{t(contact.otherTitle || 'Other ways to reach us')}</h2><p>{t(contact.otherDescription || 'Visit our location or write to us for custom orders, partnerships and export enquiries.')}</p><div className="contact-info-line"><span><MapPin /></span><p><b>{t(contact.officeTitle || 'Our Office')}</b>{address || t('Add your office address in the admin panel.')}</p></div><div className="contact-info-line"><span><Clock3 /></span><p><b>{t('Working Hours')}</b>{contact.hours || t('Add business hours in the admin panel.')}{contact.sundayHours && <small>{contact.sundayHours}</small>}</p></div><div className="contact-info-line"><span><Mail /></span><p><b>{t('Business Inquiries')}</b>{t(contact.businessNote || 'For bulk orders, partnerships or export enquiries, write to us at')} {email && <a href={`mailto:${email}`}>{email}</a>}</p></div></div></article>
      <section className="contact-form-card" id="contact-form"><span className="eyebrow">{t(contact.formEyebrow || 'LET’S START A CONVERSATION')}</span><h2>{t(contact.formTitle || 'Send us a Message')}</h2><p>{t(contact.formDescription || 'Have doubts or questions, or want to leave a remark? Leave us a message.')}</p>{submitted ? <div className="contact-success" role="status"><Check />{t('Thank you. Your message has been sent to our team.')}</div> : <form onSubmit={submit}>{submitError && <p className="contact-submit-error" role="alert">{submitError}</p>}<label><UserRound /><input name="name" placeholder={t('Full Name *')} required /></label><label><Mail /><input name="email" type="email" placeholder={t('Email Address *')} required /></label><label><Phone /><input name="phone" type="tel" placeholder={t('Phone Number (Optional)')} /></label><label><PenLine /><input name="subject" defaultValue={enquirySubject} placeholder={t('Subject')} /></label><label className="contact-message"><MessageCircle /><textarea name="message" placeholder={t('Your Message')} required /></label><button className="contact-submit" type="submit" disabled={sending}>{t(sending ? 'Sending…' : contact.submitLabel || 'Send Message')}<Send size={17} /></button><small className="contact-privacy"><ShieldCheck size={15} />{t(contact.privacyNote || 'We respect your privacy. Your information is safe with us.')}</small></form>}</section></section>
  </main>;
}

export function CartPage({ bag = [], navigate, onQuantityChange, onRemove, onCheckout }) {
  const subtotal = bag.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  const itemCount = bag.reduce((total, item) => total + item.quantity, 0);
  return <main className="store-page cart-page">
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All rugs', href: '/collections/All%20rugs' }, { label: 'Shopping cart' }]} navigate={navigate} />
    <div className="cart-page-title"><div><ShoppingBag size={30} strokeWidth={1.5} /><h1>Shopping Cart</h1></div><span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div>
    {!bag.length ? <section className="cart-empty"><ShoppingBag size={35} /><h2>Your cart is waiting for something lovely.</h2><p>Explore the collection and find a rug that feels at home.</p><button className="button olive" onClick={() => navigate('/')}>Explore rugs <ArrowRight size={17} /></button></section> : <>
      <div className="cart-layout"><section className="cart-items" aria-label="Cart items">{bag.map(item => {
        const image = item.cartImage || featuredSize(item)?.images?.[0] || item.image || item.images?.[0];
        return <article className="cart-item" key={`${item.id}-${item.size}`}>
          <button className="cart-item-image" onClick={() => navigate(`/products/${item.slug || `${item.id}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}`)} aria-label={`View ${item.name}`}>
            {image ? <img src={image} alt={item.name} /> : <Rug design={item.design} />}
          </button>
          <div className="cart-item-main"><div className="cart-item-heading"><div><h2>{item.name}</h2><p> Handcrafted rugs</p>{item.size && <span className="cart-size-chip">Size: {item.size}</span>}</div><button className="cart-remove" onClick={() => onRemove(item)} aria-label={`Remove ${item.name}`}><Trash2 size={18} /></button></div><div className="cart-item-bottom"><div><small>QUANTITY</small><div className="cart-quantity"><button aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => onQuantityChange(item, item.quantity - 1)}>−</button><b>{item.quantity}</b><button aria-label={`Increase ${item.name} quantity`} onClick={() => onQuantityChange(item, item.quantity + 1)}>+</button></div></div><div className="cart-item-prices">{item.originalPrice > item.price && <del>{money(item.originalPrice)} each</del>}<b>{money(item.price * item.quantity)}</b>{item.quantity > 1 && <small>{money(item.price)} each</small>}</div></div></div>
        </article>;
      })}</section>
        <aside className="cart-summary"><h2><ShoppingBag size={20} /> Order Summary</h2><div className="cart-summary-body"><div className="cart-summary-line"><span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span><b>{money(subtotal)}</b></div><div className="cart-summary-line"><span>Shipping</span><b className="cart-shipping-note">Calculated at checkout</b></div><div className="cart-summary-total"><b>Estimated Total</b><strong>{money(subtotal)}</strong></div><button className="cart-checkout-button" onClick={onCheckout}><ShieldCheck size={19} /> Proceed to Checkout</button><p className="cart-secure-note"><ShieldCheck size={16} /> Secure checkout</p></div></aside></div>
      <section className="cart-trust-row"><div><ShieldCheck /><span><b>Secure Checkout</b><small>Your details stay protected</small></span></div><div><Truck /><span><b>Complimentary Shipping</b><small>On qualifying orders</small></span></div><div><RotateCcw /><span><b>Easy Returns</b><small>See our return policy</small></span></div><div><Headphones /><span><b>Here to Help</b><small>We’re happy to assist</small></span></div></section>
    </>}
  </main>;
}

export function CheckoutPage({ customer, bag, navigate, onOrderPlaced }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ name: customer?.name || '', email: customer?.email || '', mobile: customer?.mobile || '', address: customer?.address || '', city: customer?.city || '', state: customer?.state || '', postalCode: customer?.postalCode || '' });
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await customerApi('/api/customer/orders', { method: 'POST', body: JSON.stringify({ shipping: form, items: bag.map(item => ({ productId: item.id, size: item.size, quantity: item.quantity })) }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not create your order.');
      setOrder(result.order); onOrderPlaced?.();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  if (!customer) return <main className="store-page product-detail-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All rugs', href: '/collections/All%20rugs' }, { label: 'Shopping cart', href: '/cart' }, { label: 'Checkout' }]} navigate={navigate} /><span className="eyebrow">RUGS · CHECKOUT</span><h1>Sign in to continue.</h1><p>Your bag is here when you are ready.</p><button className="text-link" onClick={() => navigate('/cart')}>Return to your cart <ArrowRight size={18} /></button></main>;
  if (order) return <main className="store-page checkout-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All rugs', href: '/collections/All%20rugs' }, { label: 'Order placed' }]} navigate={navigate} /><section className="order-confirmation"><span className="eyebrow">ORDER RECEIVED</span><h1>Thank you, {order.customer?.name || customer.name}.</h1><p>Your demo order <b>{order.orderNumber}</b> has been placed. Its current status is <b>{order.status}</b>.</p><button className="button olive" onClick={() => navigate('/')}>Continue shopping <ArrowRight size={18} /></button></section></main>;
  const subtotal = bag.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
  return <main className="store-page checkout-page"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All rugs', href: '/collections/All%20rugs' }, { label: 'Shopping cart', href: '/cart' }, { label: 'Checkout' }]} navigate={navigate} /><div className="store-page-heading"><span className="eyebrow">RUGS · CHECKOUT</span><h1>Make yourself at home.</h1><p>Review your selection and add delivery details.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2>Delivery details</h2><label>Full name<input name="name" required minLength="2" maxLength="100" autoComplete="name" value={form.name} onChange={change} /></label><label>Email<input name="email" required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={change} /></label><label>Mobile number<input name="mobile" required minLength="7" maxLength="25" autoComplete="tel" value={form.mobile} onChange={change} /></label><label>Delivery address<textarea name="address" required maxLength="500" rows="3" autoComplete="street-address" value={form.address} onChange={change} /></label><div className="checkout-two-col"><label>City<input name="city" required maxLength="100" autoComplete="address-level2" value={form.city} onChange={change} /></label><label>PIN code<input name="postalCode" required maxLength="20" autoComplete="postal-code" value={form.postalCode} onChange={change} /></label></div><label>State<input name="state" maxLength="100" autoComplete="address-level1" value={form.state} onChange={change} /></label>{error && <p className="checkout-error" role="alert">{error}</p>}{message && <p className="checkout-message" role="status">{message}</p>}<button className="button olive" disabled={!bag.length || busy}>{busy ? 'Placing demo order…' : bag.length ? 'Place demo order' : 'Your cart is empty'}</button><small className="checkout-demo-note">This creates a dummy order for admin review. No payment is collected.</small></form><aside className="checkout-summary"><span className="eyebrow">YOUR SELECTION</span><h2>Order summary</h2>{bag.map(item => <div className="checkout-item" key={`${item.id}-${item.size}`}><span><b>{item.name}</b><small>{item.size} · Qty {item.quantity}</small></span><strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong></div>)}<div className="checkout-total"><span>Estimated total</span><b>₹{subtotal.toLocaleString('en-IN')}</b></div><small>Shipping details are collected above.</small></aside></div></main>;
}
