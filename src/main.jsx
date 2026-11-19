import { t, useLocale } from './i18n';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, ArrowLeft, Search, Heart, ShoppingBag, Menu, X, Plus, Minus, Truck, Leaf, Hand, MoveUpRight, Check, Clock3 } from 'lucide-react';
import './styles.css';
import './premium.css';
import './bold.css';
import './signature.css';
import './checkout.css';
import './category-dynamic.css';
import './header-reference.css';
import './subcategory-listing.css';
import SignatureEdit, { DesignRibbon } from './components/SignatureEdit';
import Header from './components/Header';
import MaterialEdit from './components/MaterialEdit';
import Rug from './components/Rug';
import RichContent from './components/RichContent';
import ProductCard from './components/ProductCard';
import CollectionTabs from './components/CollectionTabs';
import { discountedPrice, discountPercent, featuredSize } from './pricing';
import { CollectionPage, ProductPage, ProductReviewsPage, ContentPage, ContactPage, CartPage, CheckoutPage, CopyLink, productPath } from './components/StorePages';
import CustomerAuthModal from './components/CustomerAuthModal';
import CustomerProfileForm from './components/CustomerProfileForm';
import { customerApi, getStorefront, getStorefrontProducts, subscribeNewsletter } from './services/api';
import './presentation.css';
import './mobile.css';
import './typography.css';
import './home-premium.css';
const money = n => `$${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const hasConfiguredValue = value => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasConfiguredValue);
  if (value && typeof value === 'object') return Object.values(value).some(hasConfiguredValue);
  return false;
};
function StorefrontSkeleton({ brand = {}, savedCount = 0, header = null }) {
  return <div className="storefront-skeleton" aria-label="Loading storefront" aria-busy="true">
    {header || <header className="storefront-loading-header"><div className="storefront-loading-brand"><a href="/" aria-label={brand.companyName || brand.logoText || 'Store home'}>{brand.logoImage ? <img src={brand.logoImage} alt={brand.companyName || brand.logoText || 'Store logo'} /> : brand.companyName || brand.logoText || <i className="skeleton-logo" />}{brand.navCaption || brand.logoCaption || brand.shippingOffer ? <span>{brand.navCaption || brand.logoCaption || brand.shippingOffer}</span> : <i className="skeleton-tagline" />}</a></div><div className="storefront-loading-utility"><i className="skeleton-shipping" /><button type="button" aria-label="My Wishlist"><Heart size={19} /><span>My Wishlist</span>{savedCount > 0 && <b>{savedCount}</b>}</button></div></header>}
    <main><section className="skeleton-hero"><div className="skeleton-copy"><i /><b /><b /><span /><span /><button /></div></section>
      <section className="skeleton-benefits">{Array.from({ length: 4 }, (_, i) => <div key={i}><i /><span /></div>)}</section>
      <section className="skeleton-section"><i className="skeleton-line short" /><i className="skeleton-line title" /><div className="skeleton-rooms">{Array.from({ length: 3 }, (_, i) => <div key={i} />)}</div></section>
      <section className="skeleton-section products"><i className="skeleton-line short" /><i className="skeleton-line title" /><div className="skeleton-products">{Array.from({ length: 4 }, (_, i) => <div key={i}><i /><span /><small /></div>)}</div></section></main>
    <footer className="skeleton-footer"><div><i /><i /><i /></div><div><i /><i /><i /></div><div><i /><i /><i /></div><div><i /><i /><i /></div></footer>
  </div>;
}

function HomeBenefitItem({ Icon, title, body }) {
  const hasTitle = typeof title === 'string' && title.trim();
  const hasBody = typeof body === 'string' && body.trim();
  return <div>{hasTitle || hasBody ? <Icon /> : <i className="home-skeleton-block benefit-icon" />}<span>{hasTitle ? t(title) : <i className="home-skeleton-block benefit-title" />}<small>{hasBody ? t(body) : <i className="home-skeleton-block benefit-body" />}</small></span></div>;
}

function HomeText({ value, className = '' }) {
  return typeof value === 'string' && value.trim() ? t(value) : <i className={`home-skeleton-block ${className}`.trim()} />;
}

function HomeRibbonSkeleton() {
  return <div className="home-ribbon-skeleton" aria-label="Loading brand phrases"><i className="home-skeleton-block" /><i className="home-skeleton-block" /><i className="home-skeleton-block" /></div>;
}

function App() {
  useLocale();
  const [route, setRoute] = useState(() => window.location.pathname + window.location.search);
  const navigate = path => {
    window.history.pushState({}, '', path);
    setRoute(path);
    setPanel(null);
    setSelected(null);
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  useEffect(() => {
    const handle = () => {
      setRoute(window.location.pathname + window.location.search);
      setPanel(null);
      setSelected(null);
    };
    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, []);
  const [wishlist, setWishlist] = useState([]);
  const [bag, setBag] = useState([]);
  const [panel, setPanel] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('Rugs-recent-searches') || '[]').filter(item => typeof item === 'string').slice(0, 5); }
    catch { return []; }
  });
  const [size, setSize] = useState('5 × 8 ft');
  useEffect(() => { if (selected) setSize(featuredSize(selected)?.label || ''); }, [selected]);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');
  const [slide, setSlide] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [cartToast, setCartToast] = useState('');
  const [customerReady, setCustomerReady] = useState(false);
  const [storefrontReady, setStorefrontReady] = useState(false);
  const [storefrontHasData, setStorefrontHasData] = useState(false);
  const [authIntent, setAuthIntent] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeOffers, setStoreOffers] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [storeSettings, setStoreSettings] = useState({});
  const [storePages, setStorePages] = useState([]);
  const [collectionResult, setCollectionResult] = useState({ products: [], total: 0, pages: 1 });
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState('');
  useEffect(() => {
    getStorefront().then(data => {
      const productsFromApi = Array.isArray(data.products) ? data.products.map(p => ({ ...p, id: p._id || p.id })) : [];
      const offersFromApi = Array.isArray(data.offers) ? data.offers : [];
      const categoriesFromApi = Array.isArray(data.categories) ? data.categories.filter(category => category.active !== false) : [];
      const pagesFromApi = Array.isArray(data.pages) ? data.pages : [];
      setStoreProducts(productsFromApi);
      setStoreOffers(offersFromApi);
      setStoreCategories(categoriesFromApi);
      if (data.settings) setStoreSettings(data.settings);
      setStorePages(pagesFromApi);
      const apiHomepage = { ...(pagesFromApi.find(page => page.key === 'home') || {}), ...(data.settings?.homepage || {}) };
      const heroSlidesFromApi = Array.isArray(apiHomepage.heroSlides) ? apiHomepage.heroSlides : [];
      const legacyHeroImagesFromApi = Array.isArray(apiHomepage.heroImages) ? apiHomepage.heroImages : [];
      const hasConfiguredHero = Boolean(
        apiHomepage.heroImage || apiHomepage.image ||
        heroSlidesFromApi.some(slide => typeof slide === 'string' ? slide : slide?.image) ||
        legacyHeroImagesFromApi.some(slide => typeof slide === 'string' ? slide : slide?.image)
      );
      const hasConfiguredHeroCopy = Boolean(
        apiHomepage.heroTitle || apiHomepage.heroDescription ||
        heroSlidesFromApi.some(slide => typeof slide === 'object' && (slide.title || slide.description))
      );
      setStorefrontHasData(hasConfiguredHero && hasConfiguredHeroCopy && hasConfiguredValue(apiHomepage));
    }).catch(() => setStoreCategories([])).finally(() => setStorefrontReady(true));
  }, []);
  useEffect(() => {
    customerApi('/api/customer/me').then(async response => {
      if (!response.ok) return null;
      return response.json();
    }).then(async result => {
      if (!result?.customer) return;
      setCustomer(result.customer);
      const response = await customerApi('/api/customer/favorites');
      const saved = response.ok ? await response.json() : { products: [] };
      setWishlist((saved.products || []).map(product => product._id || product.id));
    }).catch(() => { }).finally(() => setCustomerReady(true));
  }, []);
  const brand = storeSettings.brand || {};
  const homePage = storePages.find(page => page.key === 'home') || {};
  const homeContent = { ...homePage, ...(storeSettings.homepage || {}) };
  const ribbonConfigured = [1, 2, 3, 4].some(index => homeContent[`ribbon${index}`]?.trim());
  const sizeDefaults = [
    { name: 'Small', dims: '3 × 5 ft', caption: 'For your favourite corner' },
    { name: 'Medium', dims: '5 × 8 ft', caption: 'For everyday spaces' },
    { name: 'Large', dims: '8 × 10 ft', caption: 'For room to gather' },
    { name: 'Runner', dims: '2.5 × 8 ft', caption: 'For paths worth taking' }
  ];
  const sizeIndexes = [1, 2, 3, 4];
  const sizeTitle = homeContent.sizeTitle?.trim() || 'The right rug. The right fit.';
  const sizeTitleParts = sizeTitle.match(/^(.+?\.)\s*(.+)$/);
  const firstRootCategory = storeCategories.find(category => {
    const parentId = typeof category.parentCategory === 'object' ? category.parentCategory?._id : category.parentCategory;
    return category.active !== false && !parentId;
  });
  const heroCollectionCategory = firstRootCategory?.name || 'Rugs&Runner';
  const storyPage = storePages.find(page => page.key === 'story') || {};
  const storyContent = { ...storyPage, image: storeSettings.pages?.storyImage || homeContent.storyImage || storyPage.image, subtitle: storeSettings.pages?.storySubtitle || storyPage.subtitle, title: storeSettings.pages?.storyTitle || storyPage.title, body: storeSettings.pages?.storyBody || storyPage.body, secondParagraph: storeSettings.pages?.storySecondParagraph, link: storeSettings.pages?.storyLink || storyPage.link, signature: storeSettings.pages?.storySignature || storyPage.signature };
  const configuredHeroImage = homeContent.heroImage || homePage.image || '';
  const legacyHeroSlides = Array.isArray(homeContent.heroImages)
    ? homeContent.heroImages.filter(Boolean).map(image => typeof image === 'string' ? { image } : image)
    : [configuredHeroImage].filter(Boolean).map(image => ({ image }));
  const configuredHeroSlides = (Array.isArray(homeContent.heroSlides) ? homeContent.heroSlides : legacyHeroSlides).filter(item => typeof item === 'string' ? item : item?.image);
  const heroSlides = configuredHeroSlides;
  const activeHeroSlide = heroSlides.length ? heroSlides[slide % heroSlides.length] : {};
  const activeHeroImage = typeof activeHeroSlide === 'string' ? activeHeroSlide : activeHeroSlide.image || '';
  const heroCopy = (key, legacyKey) => typeof activeHeroSlide === 'object' && activeHeroSlide !== null && Object.hasOwn(activeHeroSlide, key)
    ? activeHeroSlide[key]
    : homeContent[legacyKey] || '';
  const activeHeroTitle = heroCopy('title', 'heroTitle');
  const activeHeroLabel = heroCopy('label', 'heroLabel');
  const activeHeroCaption = heroCopy('labelTitle', 'heroLabelTitle');
  const activeHeroFootnote = heroCopy('footnote', 'heroFootnote');
  useEffect(() => {
    if (!panel && !selected) return;
    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    const dialog = document.querySelector('[role="dialog"]');
    const focusable = () => [...dialog.querySelectorAll('button, a[href], input, select, [tabindex="0"]')];
    focusable()[0]?.focus();
    const onKey = event => {
      if (event.key === 'Escape') {
        setPanel(null);
        setSelected(null);
      }
      if (event.key === 'Tab') {
        const controls = focusable();
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [panel, selected]);
  const toggleWish = async id => {
    if (!customer) { setAuthIntent({ intent: 'favorite', productId: id }); return; }
    const exists = wishlist.includes(id);
    try {
      const response = await customerApi(`/api/customer/favorites/${id}`, { method: exists ? 'DELETE' : 'PUT' });
      if (response.status === 401) { setCustomer(null); setAuthIntent({ intent: 'favorite', productId: id }); return; }
      if (!response.ok) throw new Error('Could not update your saved rugs.');
      const saved = await response.json();
      setWishlist((saved.products || []).map(product => product._id || product.id));
    } catch { setAuthIntent({ intent: 'favorite', productId: id }); }
  };
  const finishCustomerAuth = async signedInCustomer => {
    const profileResponse = await customerApi('/api/customer/me').catch(() => null);
    const profileData = profileResponse?.ok ? await profileResponse.json().catch(() => null) : null;
    signedInCustomer = profileData?.customer || signedInCustomer;
    setCustomer(signedInCustomer);
    setCustomerReady(true);
    const response = await customerApi('/api/customer/favorites');
    const saved = response.ok ? await response.json() : { products: [] };
    let favorites = (saved.products || []).map(product => product._id || product.id);
    if (authIntent?.intent === 'favorite' && authIntent.productId && !favorites.includes(authIntent.productId)) {
      const add = await customerApi(`/api/customer/favorites/${authIntent.productId}`, { method: 'PUT' });
      if (add.ok) { const result = await add.json(); favorites = (result.products || []).map(product => product._id || product.id); }
    }
    setWishlist(favorites);
    if (authIntent?.intent === 'wishlist') setPanel('wishlist');
    if (authIntent?.intent === 'checkout') navigate('/checkout');
    setAuthIntent(null);
  };
  const addToBag = (p, chosenSize = size, sizeVariant = null, showToast = true) => {
    const regularPrice = Number(sizeVariant?.price ?? p.price) || 0;
    const sizeDiscount = Math.min(100, Math.max(0, Number(sizeVariant?.discountPercentage ?? p.discountPercentage) || 0));
    const pricedProduct = { ...p, originalPrice: regularPrice, price: Math.round(regularPrice * (1 - sizeDiscount / 100) * 100) / 100, cartImage: featuredSize(p)?.images?.[0] || p.image || p.images?.[0] || '' };
    setBag(b => {
      const existing = b.find(i => i.id === pricedProduct.id && i.size === chosenSize);
      return existing ? b.map(i => i === existing ? {
        ...i,
        quantity: i.quantity + 1
      } : i) : [...b, {
        ...pricedProduct,
        size: chosenSize,
        quantity: 1
      }];
    });
    setSelected(null);
    if (showToast) {
      setCartToast(`${p.name} added to your cart`);
      window.clearTimeout(window.__aaraCartToastTimer);
      window.__aaraCartToastTimer = window.setTimeout(() => setCartToast(''), 3200);
    }
  };
  const buyNow = (p, chosenSize = size, sizeVariant = null) => {
    addToBag(p, chosenSize, sizeVariant, false);
    navigate('/checkout');
  };
  const logoutCustomer = async () => {
    await customerApi('/api/customer/logout', { method: 'POST' }).catch(() => { });
    setCustomer(null); setWishlist([]); setPanel(null);
  };
  const collection = (value = 'All rugs') => {
    setQuery('');
    setPanel(null);
    navigate('/collections/' + encodeURIComponent(value));
  };
  const routeUrl = new URL(route, window.location.origin);
  const isCheckout = routeUrl.pathname === '/checkout';
  const isCart = routeUrl.pathname === '/cart';
  const isCollection = routeUrl.pathname.startsWith('/collections/');
  const isProduct = routeUrl.pathname.startsWith('/products/');
  const isProductReviewsPage = /^\/products\/[^/]+\/reviews\/?$/.test(routeUrl.pathname);
  const isContact = routeUrl.pathname === '/contact';
  const isContentPage = routeUrl.pathname.startsWith('/pages/');
  const currentContentPage = storePages.find(page => page.key === decodeURIComponent(routeUrl.pathname.split('/')[2] || ''));
  const category = isCollection ? decodeURIComponent(routeUrl.pathname.split('/')[2] || 'All rugs') : 'All rugs';
  const productFilterCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '') === 'rugsrunner' ? 'All rugs' : category;
  const routeCategory = storeCategories.find(item => item.name === category);
  const routeCategoryId = routeCategory?._id;
  const routeSubcategories = routeCategoryId ? storeCategories.filter(item => String(typeof item.parentCategory === 'object' ? item.parentCategory?._id : item.parentCategory) === String(routeCategoryId)) : [];
  const page = Math.max(1, Number.parseInt(routeUrl.searchParams.get('page'), 10) || 1);
  const limit = Math.min(48, Math.max(1, Number.parseInt(routeUrl.searchParams.get('limit'), 10) || 9));
  const keyword = (routeUrl.searchParams.get('keyword') || '').trim();
  useEffect(() => {
    if (panel !== 'search') return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchLoading(true);
      setSearchError('');
      getStorefrontProducts({ page: 1, limit: 8, keyword: query.trim(), signal: controller.signal })
        .then(result => setSearchResults((result.products || []).map(product => ({ ...product, id: product._id || product.id }))))
        .catch(error => {
          if (error.name !== 'AbortError') { setSearchResults([]); setSearchError('Products could not be loaded. Please try again.'); }
        })
        .finally(() => { if (!controller.signal.aborted) setSearchLoading(false); });
    }, query.trim() ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [panel, query]);
  const rememberSearch = value => {
    const term = value.trim();
    if (!term) return;
    const next = [term, ...recentSearches.filter(item => item.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    try { localStorage.setItem('Rugs-recent-searches', JSON.stringify(next)); } catch { /* Storage may be unavailable in private browsing. */ }
  };
  useEffect(() => {
    if (!isCollection) return;
    const controller = new AbortController();
    setCollectionLoading(true);
    setCollectionError('');
    getStorefrontProducts({ page, limit, keyword, category: productFilterCategory, signal: controller.signal })
      .then(result => setCollectionResult({
        ...result,
        products: (result.products || []).map(product => ({ ...product, id: product._id || product.id }))
      }))
      .catch(error => {
        if (error.name !== 'AbortError') {
          setCollectionResult({ products: [], total: 0, pages: 1 });
          setCollectionError('Products could not be loaded. Please try again.');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setCollectionLoading(false); });
    return () => controller.abort();
  }, [isCollection, page, limit, keyword, productFilterCategory]);
  const productSegment = decodeURIComponent(routeUrl.pathname.split('/')[2] || '');
  const detailProduct = storeProducts.find(p => String(p.id) === productSegment.split('-')[0] || p.slug === productSegment.replace(/^\d+-/, ''));
  useEffect(() => {
    const pageBrand = brand.companyName || brand.logoText || 'Aara Rugs';
    const pageTitle = isProductReviewsPage && detailProduct
      ? `Reviews for ${detailProduct.name} | ${pageBrand}`
      : isProduct && detailProduct
        ? `${detailProduct.name} | Handcrafted Rugs | ${pageBrand}`
        : isCollection
          ? `${category} Rugs | ${pageBrand}`
          : isContentPage && currentContentPage
            ? `${currentContentPage.title || currentContentPage.key} | ${pageBrand}`
            : isContact ? `Contact Us | ${pageBrand}`
              : isCart ? `Shopping Bag | ${pageBrand}`
                : isCheckout ? `Checkout | ${pageBrand}`
                  : `${pageBrand} — Rugs for the way you live`;
    const pageDescription = isProduct && detailProduct?.description
      ? detailProduct.description
      : isCollection
        ? routeCategory?.description || `Explore ${category} rugs at ${pageBrand}. Discover considered designs and inviting textures for every room.`
        : isContentPage && currentContentPage
          ? currentContentPage.subtitle || currentContentPage.body?.replace(/<[^>]*>/g, '').slice(0, 155)
          : isContact ? `Get in touch with ${pageBrand} for help choosing rugs, orders or general enquiries.`
            : `Thoughtfully designed rugs for modern homes, with inviting textures and considered designs.`;
    document.title = pageTitle;
    const setMeta = (selector, content, attribute = 'content') => {
      const element = document.head.querySelector(selector);
      if (element) element.setAttribute(attribute, content || '');
    };
    setMeta('meta[name="description"]', pageDescription);
    setMeta('meta[property="og:title"]', pageTitle);
    setMeta('meta[property="og:description"]', pageDescription);
    setMeta('meta[name="twitter:title"]', pageTitle);
    setMeta('meta[name="twitter:description"]', pageDescription);
    setMeta('meta[name="robots"]', isCart || isCheckout || isProductReviewsPage ? 'noindex, follow' : 'index, follow');
  }, [brand, category, currentContentPage, detailProduct, isCart, isCheckout, isCollection, isContact, isContentPage, isProduct, isProductReviewsPage, routeCategory]);
  const count = bag.reduce((n, p) => n + p.quantity, 0);
  const selectedVariant = selected?.sizes?.find(item => item.label === size) || featuredSize(selected);
  const selectedPriceProduct = selected ? { ...selected, price: selectedVariant?.price ?? selected.price, discountPercentage: selectedVariant?.discountPercentage ?? selected.discountPercentage } : null;
  const storefrontHeader = <Header onHome={() => navigate('/')} onContact={() => navigate('/contact')} onCollection={collection} onPanel={view => { if (view === 'wishlist' && !customer) setAuthIntent({ intent: 'wishlist' }); else if (view === 'bag') navigate('/cart'); else setPanel(view); }} onAccount={() => setAuthIntent({ intent: 'account' })} onProfile={() => setPanel('profile')} onLogout={logoutCustomer} customer={customer} count={count} savedCount={wishlist.length} categories={storeCategories} pages={storePages} brand={brand} offers={storeOffers} onSearch={() => { setQuery(''); setPanel('search'); }} />;
  if (!storefrontReady) return <StorefrontSkeleton brand={brand} savedCount={wishlist.length} />;
  if (!storefrontHasData) return <StorefrontSkeleton brand={brand} savedCount={wishlist.length} />;
  return <>
    {storefrontHeader}
    {t(isCart ? <CartPage bag={bag} navigate={navigate} onQuantityChange={(item, quantity) => setBag(current => current.map(entry => entry.id === item.id && entry.size === item.size ? { ...entry, quantity } : entry))} onRemove={item => setBag(current => current.filter(entry => !(entry.id === item.id && entry.size === item.size)))} onCheckout={() => navigate('/checkout')} /> : isCollection ? <CollectionPage category={category} categories={storeCategories} products={collectionResult.products} page={page} limit={limit} keyword={keyword} total={collectionResult.total} totalPages={collectionResult.pages} loading={collectionLoading} error={collectionError} navigate={navigate} wishlist={wishlist} onToggleWish={toggleWish} subcategories={routeSubcategories} onQuickView={p => navigate(productPath(p))} /> : isProductReviewsPage ? <ProductReviewsPage product={detailProduct} page={page} navigate={navigate} /> : isProduct ? <ProductPage product={detailProduct} size={size} setSize={setSize} onAdd={addToBag} onBuyNow={buyNow} navigate={navigate} saved={wishlist.includes(detailProduct?.id || detailProduct?._id)} onToggleWish={toggleWish} onEnquiry={() => navigate('/contact?subject=Bulk%20%26%20Custom%20Orders')} products={storeProducts} wishlist={wishlist} categories={storeCategories} /> : isContact ? <ContactPage contact={storeSettings.contact || {}} /> : isContentPage ? <ContentPage page={currentContentPage} navigate={navigate} /> : isCheckout ? <CheckoutPage customer={customer} bag={bag} navigate={navigate} onOrderPlaced={() => setBag([])} /> : <main>
      <section className="hero" style={activeHeroImage ? { backgroundImage: `url(${activeHeroImage})` } : undefined}><div className="hero-shade" />{activeHeroImage ? <div className="hero-visual"><img src={activeHeroImage} alt={homeContent.heroImageAlt || ''} fetchPriority="high" />{(activeHeroLabel?.trim() || activeHeroCaption?.trim()) && <div className="hero-visual-label"><span>{activeHeroLabel?.trim() && <>{t(activeHeroLabel)} </>}{activeHeroCaption?.trim() && <b>{t(activeHeroCaption)}</b>}</span><ArrowUpRight size={22} /></div>}</div> : <div className="home-skeleton-block hero-visual-skeleton" />}<div className="hero-orbit"><span>{t('THE ART OF')}</span><b>{t('slow')}</b><small>{t('BEAUTIFUL LIVING')}</small></div><div className="hero-content"><span className="eyebrow light"><HomeText value={heroCopy('subtitle', 'heroSubtitle')} className="hero-copy-skeleton eyebrow" /></span><h1><HomeText value={activeHeroTitle} className="hero-copy-skeleton title" /></h1><div className="hero-rich-description">{heroCopy('description', 'heroDescription')?.trim() ? <RichContent className="hero-description rich-content-block" value={t(heroCopy('description', 'heroDescription'))} /> : <i className="home-skeleton-block hero-copy-skeleton description" />}{heroCopy('secondLine', 'heroSecondLine')?.trim() && <RichContent className="hero-second-line rich-content-block" value={t(heroCopy('secondLine', 'heroSecondLine'))} />}</div>{heroCopy('button', 'heroButton')?.trim() ? <button className="button cream" onClick={() => navigate(`/collections/${encodeURIComponent(heroCollectionCategory)}`)}>{t(heroCopy('button', 'heroButton'))}<ArrowUpRight size={19} /></button> : <i className="home-skeleton-block hero-copy-skeleton button" />}{activeHeroFootnote?.trim() && <div className="hero-note">{t(activeHeroFootnote)}</div>}</div><div className="hero-bottom">{homeContent.heroBottomLabel?.trim() && <span>{t(homeContent.heroBottomLabel)}</span>}<div><button aria-label="Previous slide" onClick={() => setSlide(s => (s + heroSlides.length - 1) % Math.max(heroSlides.length, 1))} disabled={heroSlides.length < 2}><ArrowLeft size={18} /></button><span>{String((slide % Math.max(heroSlides.length, 1)) + 1).padStart(2, '0')} <span className="muted">/ {String(heroSlides.length).padStart(2, '0')}</span></span><button aria-label="Next slide" onClick={() => setSlide(s => (s + 1) % Math.max(heroSlides.length, 1))} disabled={heroSlides.length < 2}><ArrowRight size={18} /></button></div></div></section>
      <section className="benefits"><HomeBenefitItem Icon={Hand} title={homeContent.benefit1Title} body={homeContent.benefit1Body} /><HomeBenefitItem Icon={Leaf} title={homeContent.benefit2Title} body={homeContent.benefit2Body} /><HomeBenefitItem Icon={Truck} title={homeContent.benefit3Title} body={homeContent.benefit3Body} /><HomeBenefitItem Icon={() => <span className="woven-icon">{t("✳")}</span>} title={homeContent.benefit4Title} body={homeContent.benefit4Body} /></section>
      {ribbonConfigured ? <DesignRibbon content={homeContent} /> : <HomeRibbonSkeleton />}
      <section className="intro section-pad"><span className="eyebrow">{homeContent.roomsEyebrow?.trim() ? t(homeContent.roomsEyebrow) : <i className="home-skeleton-block room-eyebrow-skeleton" />}</span><h2>{homeContent.roomsTitle?.trim() ? t(homeContent.roomsTitle) : <i className="home-skeleton-block room-heading-skeleton" />}</h2><div className="rooms-rich-description">{homeContent.roomsDescription?.trim() ? <RichContent className="rooms-description rich-content-block" value={t(homeContent.roomsDescription)} /> : <i className="home-skeleton-block room-copy-skeleton" />}{homeContent.roomsSecondLine?.trim() ? <p>{t(homeContent.roomsSecondLine)}</p> : <i className="home-skeleton-block room-copy-skeleton short" />}</div><div className="room-grid">{[['room1Title', 'living'], ['room2Title', 'bedroom'], ['room3Title', 'dining']].map(([titleKey, imageKey], i) => { const name = homeContent[titleKey]?.trim(); const image = homeContent[`${imageKey}Image`]; return <button key={imageKey} className={`room-card${image ? '' : ' room-card-loading'}`} onClick={() => collection()}>{image ? <img src={image} alt={name || ''} loading="lazy" /> : <i className="home-skeleton-block room-image-skeleton" />}<div className="room-label">{name ? <span><small>{t('0')}{t(i + 1)}</small>{t(name)}</span> : <i className="home-skeleton-block room-title-skeleton" />}<span className="circle-arrow"><ArrowUpRight size={22} /></span></div></button>; })}</div></section>
      <section className="collection section-pad" id="collection"><div className="section-heading"><div><span className="eyebrow"><HomeText value={homeContent.collectionEyebrow} className="collection-eyebrow-skeleton" /></span><h2><HomeText value={homeContent.collectionTitle} className="collection-title-skeleton" /></h2></div>{homeContent.collectionButton?.trim() ? <button className="text-link" onClick={() => navigate('/collections/All%20rugs')}>{t(homeContent.collectionButton)}<ArrowUpRight size={18} /></button> : <i className="home-skeleton-block collection-button-skeleton" />}</div><CollectionTabs products={storeProducts} categories={storeCategories} onOpenCategory={name => navigate(`/collections/${encodeURIComponent(name)}`)} />{(homeContent.collectionFoot || homeContent.collectionFootAccent) && <div className="collection-closing-copy">{homeContent.collectionFoot && <RichContent className="rich-content-block" value={t(homeContent.collectionFoot)} />}{homeContent.collectionFootAccent && <p>{t(homeContent.collectionFootAccent)}</p>}</div>}</section>
      <SignatureEdit products={storeProducts} content={homeContent} onSelect={p => navigate(productPath(p))} />
      <MaterialEdit onExplore={collection} products={storeProducts} content={homeContent} onSelect={p => navigate(productPath(p))} />
      <section className="story" id="story"><div className="story-image">{storyContent.image ? <img src={storyContent.image} loading="lazy" alt="" /> : <i className="home-skeleton-block story-image-skeleton" />}</div><div className="story-copy"><span className="eyebrow"><HomeText value={storyContent.subtitle} className="story-eyebrow-skeleton" /></span><h2><HomeText value={storyContent.title} className="story-title-skeleton" /></h2>{storyContent.body?.trim() ? <RichContent className="story-paragraph rich-content-block" value={t(storyContent.body)} /> : <i className="home-skeleton-block story-paragraph-skeleton" />}{storyContent.secondParagraph?.trim() ? <RichContent className="story-paragraph rich-content-block" value={t(storyContent.secondParagraph)} /> : <i className="home-skeleton-block story-paragraph-skeleton" />}{storyContent.link?.trim() && <button type="button" className="text-link story-link" onClick={() => navigate(`/collections/${encodeURIComponent('Rugs&Runner')}`)}>{t(storyContent.link)}<ArrowUpRight size={17} /></button>}{storyContent.signature?.trim() && <p className="story-signature">{t(storyContent.signature)}</p>}</div></section>
      <section className="size-section section-pad" id="spaces"><div><span className="eyebrow"><HomeText value={homeContent.sizeEyebrow} className="size-eyebrow-skeleton" /></span><h2>{sizeTitleParts ? <>{t(sizeTitleParts[1])}<br /><em>{t(sizeTitleParts[2])}</em></> : t(sizeTitle)}</h2>{homeContent.sizeDescription?.trim() ? <RichContent className="size-description rich-content-block" value={t(homeContent.sizeDescription)} /> : <p className="size-description">From a cosy corner to a room full of life. Find the size that brings it all together.</p>}</div><div className="sizes">{sizeIndexes.map((i, index) => { const defaults = sizeDefaults[index]; const name = homeContent[`size${i}Name`]?.trim() || defaults.name, dims = homeContent[`size${i}Dims`]?.trim() || defaults.dims, desc = homeContent[`size${i}Caption`]?.trim() || defaults.caption; return <button key={i} onClick={() => { setSize(dims); setPanel('guide'); }}><div className={`size-drawing size-${index}`}><span /></div><h3>{t(name)}</h3><span>{t(dims)}</span><small>{t(desc)}</small></button>; })}</div></section>
      <section className="craft-banner" id="craft"><span className="eyebrow"><HomeText value={homeContent.craftEyebrow} className="craft-eyebrow-skeleton" /></span><h2><HomeText value={homeContent.craftTitle} className="craft-title-skeleton" /></h2>{homeContent.craftDescription?.trim() ? <RichContent className="craft-description rich-content-block" value={t(homeContent.craftDescription)} /> : <i className="home-skeleton-block craft-description-skeleton" />}<div><span><Leaf size={19} />{homeContent.craftPoint1?.trim() ? t(homeContent.craftPoint1) : <i className="home-skeleton-block craft-point-skeleton" />}</span><span><Hand size={19} />{homeContent.craftPoint2?.trim() ? t(homeContent.craftPoint2) : <i className="home-skeleton-block craft-point-skeleton" />}</span><span>✳ {homeContent.craftPoint3?.trim() ? t(homeContent.craftPoint3) : <i className="home-skeleton-block craft-point-skeleton" />}</span></div></section>
      <section className="newsletter"><div><span className="eyebrow"><HomeText value={homeContent.newsletterEyebrow} className="newsletter-eyebrow-skeleton" /></span><h2><HomeText value={homeContent.newsletterTitle} className="newsletter-title-skeleton" /></h2>{homeContent.newsletterDescription?.trim() ? <RichContent className="newsletter-description rich-content-block" value={t(homeContent.newsletterDescription)} /> : <i className="home-skeleton-block newsletter-description-skeleton" />}</div>{homeContent.newsletterPlaceholder?.trim() ? <form onSubmit={async e => {
        e.preventDefault();
        if (!email.trim() || newsletterBusy) return;
        setNewsletterBusy(true); setNewsletterError('');
        try { await subscribeNewsletter(email.trim()); setSubscribed(true); }
        catch (error) { setNewsletterError(error.message || 'Could not subscribe right now. Please try again.'); }
        finally { setNewsletterBusy(false); }
      }}><div className="email-field"><input type="email" required aria-label={homeContent.newsletterPlaceholder} placeholder={homeContent.newsletterPlaceholder} value={email} onChange={e => setEmail(e.target.value)} disabled={newsletterBusy} /><button type="submit" aria-label="Subscribe to newsletter" disabled={newsletterBusy}><ArrowRight size={23} /></button></div>{newsletterError ? <small>{t(newsletterError)}</small> : <small><HomeText value={homeContent.newsletterNote} className="newsletter-note-skeleton" /></small>}</form> : <div className="newsletter-form-skeleton"><i className="home-skeleton-block" /><i className="home-skeleton-block" /></div>}</section>
    </main>)}
    <footer><div className="footer-main"><div className="footer-brand"><a className="logo" href="/">{brand.logoImage ? <img className="admin-footer-logo" src={brand.logoImage} alt={brand.logoText || 'Store logo'} /> : t(brand.logoText || "")}<span>{t(brand.footerCaption || "RUGS & LIVING")}</span></a><p>{t(storeSettings.footer?.tagline || "Woven for the way you live.")}<br />{t(storeSettings.footer?.secondLine || "Made for the place you call home.")}</p><span>{t(storeSettings.footer?.origin || "INDIAN CRAFT. EVERYDAY SOUL.")}</span></div><div><h4>{t("Explore")}</h4><button onClick={() => collection()}>{t("All rugs")}</button>{storeCategories.map(category => <button key={category._id || category.slug} onClick={() => collection(category.name)}>{t(category.name)}</button>)}</div><div><h4>{t("A little help")}</h4><button onClick={() => setPanel('guide')}>{t("Rug size guide")}</button><button onClick={() => setPanel('care')}>{t("Care for your rug")}</button><button onClick={() => setPanel('shipping')}>{t("Shipping & returns")}</button><button onClick={() => navigate('/contact')}>{t("Contact Us")}</button></div><div><h4>{t("Our Company")}</h4>{storePages.filter(page => page.active && /about|company|blog|story|who/i.test(`${page.key} ${page.title || ''}`)).map(page => <a key={page.key} href={`/pages/${page.key}`}>{t(page.title || page.key)}</a>)}<a href="/contact">{t("Contact Us")}</a><a href="/#story">{t("The Aara story")}</a><a href="#craft">{t("Our craftsmanship")}</a><a href="/#spaces">{t("Spaces & inspiration")}</a></div><div><h4>{t("Policies")}</h4>{storePages.filter(page => page.active && /privacy|policy|disclaimer|terms|condition|return/i.test(`${page.key} ${page.title || ''}`)).map(page => <a key={page.key} href={`/pages/${page.key}`}>{t(page.title || page.key)}</a>)}</div></div><div className="footer-bottom"><span>{t("© ")}{t(new Date().getFullYear())}{t(` ${storeSettings.footer?.copyright || 'Rugs & Living'}`)}</span><span>{t("A thoughtfully designed demo storefront")}</span><span>USD · $</span></div></footer>
    {subscribed && <div className="newsletter-success-backdrop" onClick={() => { setSubscribed(false); setEmail(''); }}><section className="newsletter-success" role="dialog" aria-modal="true" aria-labelledby="newsletter-success-title" onClick={event => event.stopPropagation()}><button className="newsletter-success-close" type="button" aria-label="Close" onClick={() => { setSubscribed(false); setEmail(''); }}>×</button><h2 id="newsletter-success-title">{t("Thank You for Subscribing! ❤️")}</h2><p>{t("You're officially on the list! Thank you for subscribing to our newsletter.")}</p><p>{t("Stay tuned for the latest updates, exclusive offers, new arrivals, and special surprises delivered straight to your inbox.")}</p><p>{t("We're glad to have you with us!")}</p><button className="button olive" type="button" onClick={() => { setSubscribed(false); setEmail(''); }}>{t("Continue browsing")}</button></section></div>}
    {t((panel || selected) && <div className="overlay" onClick={() => {
      setPanel(null);
      setSelected(null);
    }} />)}
    {t(selected && <section className="product-modal" role="dialog" aria-modal="true" aria-label={selected.name}><button className="close" aria-label="Close product" onClick={() => setSelected(null)}><X /></button><div className="modal-rug">{(selectedVariant?.images?.[0] || selected.signatureImages?.[0] || selected.images?.[0] || selected.image) ? <img src={selectedVariant?.images?.[0] || selected.signatureImages?.[0] || selected.images?.[0] || selected.image} alt={selected.name} /> : <Rug design={selected.design} />}</div><div className="modal-copy"><span className="eyebrow">{t("THE RUGS COLLECTION")}</span><h2>{t(selected.name)}</h2><p>{t(selected.type)}{t(" · Made in India")}</p><h3 className="modal-product-price">{t(money(discountedPrice(selectedPriceProduct)))}{discountPercent(selectedPriceProduct) > 0 && <><del>{t(money(selectedPriceProduct.price))}</del><span>{discountPercent(selectedPriceProduct)}% OFF</span></>}</h3><RichContent className="quickview-description rich-content-block" value={t(selected.description || "A considered balance of texture and tone, crafted by hand to bring warmth and character to your everyday spaces.")} /><span className="modal-size-heading">{t("Choose your size")}</span>{selected.sizes?.length ? (() => { const currentPrice = { ...selected, price: selectedVariant?.price ?? selected.price, discountPercentage: selectedVariant?.discountPercentage ?? selected.discountPercentage }; const currentSale = discountedPrice(currentPrice); const currentPercent = discountPercent(currentPrice); return <details className="modal-size-dropdown"><summary><span className="modal-size-current-label">{t(selectedVariant?.label || "Choose your size")}</span><span className="modal-size-current-price">{money(currentSale)}{currentPercent > 0 && <><del>{money(currentPrice.price)}</del><i>{currentPercent}% OFF</i></>}</span></summary><div className="modal-size-options" role="listbox" aria-label={t("Choose your size")}>{selected.sizes.map(item => { const sizePrice = { ...selected, price: item.price ?? selected.price, discountPercentage: item.discountPercentage ?? selected.discountPercentage }; const sale = discountedPrice(sizePrice); const percent = discountPercent(sizePrice); const isSelected = selectedVariant?.label === item.label; return <button type="button" className={`modal-size-option${isSelected ? ' is-selected' : ''}`} role="option" aria-selected={isSelected} key={item.label} onClick={e => { setSize(item.label); e.currentTarget.closest('details').open = false; }}><span className="modal-size-label">{t(item.label)}</span><span className="modal-size-prices">{percent > 0 && <del>{money(sizePrice.price)}</del>}<b>{money(sale)}</b>{percent > 0 && <i>{percent}% OFF</i>}</span></button>; })}</div></details>; })() : <p className="size-price-note">Size options will be available soon.</p>}<div className="modal-purchase-actions"><button className="button olive" disabled={!selectedVariant} onClick={() => addToBag(selected, selectedVariant?.label, selectedVariant)}>{t("Add to bag ")}<ShoppingBag size={18} /></button><button className="button buy-now" disabled={!selectedVariant} onClick={() => buyNow(selected, selectedVariant?.label, selectedVariant)}>{t("Buy now")}</button></div><div className="modal-page-actions"><button className="text-link" onClick={() => navigate(productPath(selected))}>{t("View full details ")}<ArrowUpRight size={17} /></button><CopyLink key={selected.id} product={selected} /></div><small>{t("Complimentary shipping above $5,000. Static demo; no payment is collected.")}</small></div></section>)}
    {t(panel && <aside className="drawer" role="dialog" aria-modal="true" aria-label={panel}><div className="drawer-head"><h2>{t({
      bag: 'Your bag',
      wishlist: 'Saved for later',
      profile: 'Your profile',
      search: 'Find your rug',
      menu: 'Explore RUGS',
      guide: 'Find your perfect fit',
      care: 'Made to be cared for',
      shipping: 'Shipping & returns',
      contact: 'Come say hello'
    }[panel])}</h2><button aria-label="Close panel" onClick={() => setPanel(null)}><X /></button></div>
      {t(panel === 'menu' && <div className="menu-links"><button onClick={() => { setPanel(null); navigate('/contact'); }}>{t('Contact Us')}<ArrowUpRight /></button>{t(['All rugs', ...storeCategories.map(category => category.name)].map(f => <button onClick={() => navigate(`/collections/${encodeURIComponent(f)}`)} key={f}>{t(f)}<ArrowUpRight /></button>))}</div>)}
      {panel === 'profile' && customer && <CustomerProfileForm customer={customer} onSaved={setCustomer} />}
      {t(panel === 'search' && <><form className="search-field" role="search" onSubmit={event => { event.preventDefault(); rememberSearch(query); }}><Search size={19} /><input autoFocus placeholder="Try wool, jute, sandstone…" aria-label="Search products" value={query} onChange={e => setQuery(e.target.value)} /></form>{!query.trim() && recentSearches.length > 0 && <section className="recent-searches"><div className="search-section-heading"><span>{t("Recent searches")}</span><button onClick={() => { setRecentSearches([]); try { localStorage.removeItem('Rugs recent-searches'); } catch { /* Storage may be unavailable. */ } }}>{t("Clear")}</button></div><div className="recent-search-chips">{recentSearches.map(term => <button key={term} onClick={() => setQuery(term)}><Clock3 size={14} />{t(term)}</button>)}</div></section>}<p className="drawer-note">{t(query.trim() ? "Search results" : "Discover your next favourite.")}</p>{searchLoading && <div className="search-status" role="status">{t("Searching rugs…")}</div>}{searchError && <div className="search-status search-error" role="alert">{t(searchError)}</div>}{!searchLoading && !searchError && searchResults.map(p => {
        const image = p.image || p.images?.[0] || p.sizes?.[0]?.images?.[0]; return <button className="mini-product" key={p.id} onClick={() => { rememberSearch(query); navigate(productPath(p)); }}>
          {image ? <img className="mini-product-image" src={image} alt={p.name} /> : <Rug design={p.design} />}<span><b>{t(p.name)}</b><small>{t(p.type || p.details?.material || p.category)}</small>{t(money(discountedPrice(p)))}{discountPercent(p) > 0 && <small className="mini-discount">{discountPercent(p)}% OFF</small>}</span><ArrowUpRight size={18} /></button>;
      })}{!searchLoading && !searchError && !searchResults.length && <p className="search-status">{t(query.trim() ? "No rugs found. Try another name, material or style." : "No products are available yet.")}</p>}</>)}
      {t(panel === 'wishlist' && customer && (wishlist.length ? storeProducts.filter(p => wishlist.includes(p.id)).map(p => {
        const size = featuredSize(p); const image = size?.images?.[0] || p.image || p.images?.[0]; return <div className="mini-product" key={p.id}>{image ? <img className="mini-product-image" src={image} alt={p.name} /> : <Rug design={p.design} />}<button onClick={() => {
          setPanel(null);
          navigate(productPath(p));
        }}><b>{t(p.name)}</b><small>{t(p.type)}</small>{t(money(discountedPrice(p)))}{discountPercent(p) > 0 && <small className="mini-discount">{discountPercent(p)}% OFF</small>}</button><button aria-label={`Remove ${p.name}`} onClick={() => toggleWish(p.id)}><X size={17} /></button></div>;
      }) : <div className="empty"><Heart size={38} /><h3>{t("A place for your favourites.")}</h3><p>{t("Tap the heart on a rug to save it here.")}</p><button className="button olive" onClick={() => collection()}>{t("Explore rugs ")}<ArrowRight size={18} /></button></div>))}
      {t(panel === 'bag' && <>{t(bag.length ? <>{t(bag.map(p => <div className="mini-product" key={`${p.id}-${p.size}`}>{p.cartImage ? <img className="mini-product-image" src={p.cartImage} alt={p.name} /> : <Rug design={p.design} />}<span><b>{t(p.name)}</b><small>{t(p.size)}{t(" · ")}{t(money(p.price))}</small><span className="quantity"><button aria-label={`Decrease ${p.name} quantity`} onClick={() => setBag(b => b.map(i => i.id === p.id && i.size === p.size ? {
        ...i,
        quantity: i.quantity - 1
      } : i).filter(i => i.quantity > 0))}><Minus size={13} /></button>{t(p.quantity)}<button aria-label={`Increase ${p.name} quantity`} onClick={() => setBag(b => b.map(i => i.id === p.id && i.size === p.size ? {
        ...i,
        quantity: i.quantity + 1
      } : i))}><Plus size={13} /></button></span></span></div>))}<div className="bag-total"><span>{t("Subtotal")}</span><b>{t(money(bag.reduce((n, p) => n + p.price * p.quantity, 0)))}</b></div><p className="demo-note">{t("This is a demo shopping bag. Orders and payments are not processed.")}</p><button className="button olive" onClick={() => collection()}>{t("Continue exploring ")}<ArrowRight size={18} /></button></> : <div className="empty"><ShoppingBag size={38} /><h3>{t("Good things are waiting.")}</h3><p>{t("Your home’s next chapter starts with a rug.")}</p><button className="button olive" onClick={() => collection()}>{t("Discover the collection ")}<ArrowRight size={18} /></button></div>)}</>)}
      {t(panel === 'guide' && <div className="info-copy"><p>{t("A rug brings the whole room together. Start with these simple proportions.")}</p>{t([['Living room', 'Choose 8 × 10 ft or larger so the front legs of your sofa and chairs rest on the rug.'], ['Bedroom', 'A 5 × 8 ft rug suits smaller bedrooms. Choose 8 × 10 ft for a generous border around a queen bed.'], ['Dining room', 'Allow approximately 60 cm beyond the table on every side so chairs remain on the rug when pulled out.'], ['Hallways', 'Leave a little floor visible on both sides of a runner. Measure door clearance before choosing a thick pile.']].map(([t, d]) => <div key={t}><h3>{t(t)}</h3><p>{t(d)}</p></div>))}<button className="button olive" onClick={() => collection()}>{t("Find your rug ")}<ArrowUpRight size={18} /></button></div>)}
      {t(panel === 'care' && <div className="info-copy"><p>{t("A little regular care keeps your rug beautiful for years.")}</p><h3>{t("Everyday care")}</h3><p>{t("Vacuum gently without a rotating brush. Rotate every few months for even wear and use a rug pad underneath.")}</p><h3>{t("Spills happen")}</h3><p>{t("Blot immediately with a clean, dry cloth. Avoid rubbing or soaking. For deep cleaning, consult a professional familiar with your rug’s fibre.")}</p><h3>{t("Natural character")}</h3><p>{t("Light shedding and subtle variations are part of a handmade wool rug’s character. Keep jute rugs dry and away from damp areas.")}</p></div>)}
      {t(panel === 'shipping' && <div className="info-copy"><p>{t("This storefront is a static demonstration. No orders are accepted or dispatched.")}</p><h3>{t("Delivery information")}</h3><p>{t("Complimentary shipping above $5,000 is sample storefront copy. Final delivery regions, timelines, charges and return terms must be configured before launching a real store.")}</p></div>)}
      {t(panel === 'contact' && <div className="info-copy"><h3>{t("Let's find something beautiful.")}</h3><p>{t("For bulk orders, custom rug requests, styling advice or order support, this space can connect customers with your team.")}</p><p>{t("Contact details will be available when the store launches. This is a demo website.")}</p></div>)}
    </aside>)}
    {t(panel === 'bag' && bag.length > 0 && <div className="checkout-float"><button className="button olive" onClick={() => { setPanel(null); navigate('/checkout'); }}>Proceed to checkout <ArrowRight size={18} /></button></div>)}
    {authIntent && <CustomerAuthModal intent={authIntent.intent} onClose={() => setAuthIntent(null)} onAuthenticated={finishCustomerAuth} />}
    {cartToast && <div className="cart-toast" role="status"><span>✓</span><div><b>Added to your cart</b><small>{cartToast.replace(/ added to your cart$/, '')}</small></div><button onClick={() => { setCartToast(''); navigate('/cart'); }}>View cart</button><button aria-label="Dismiss" onClick={() => setCartToast('')}>×</button></div>}
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
