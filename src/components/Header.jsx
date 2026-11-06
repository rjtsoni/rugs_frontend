import { t } from '../i18n';
import React, { useEffect, useState } from 'react';
import { Search, Heart, ShoppingBag, Menu, UserRound, ChevronDown, ArrowUpRight, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
export default function Header({ onCollection, onPanel, onAccount, onProfile, onLogout, customer, count, savedCount, onSearch, onHome, categories = [], pages = [], brand = {}, offers = [] }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);
  const apiOfferMessages = offers.map(offer => typeof offer === 'string' ? offer : offer.message).filter(Boolean);
  const offerMessages = apiOfferMessages.length ? apiOfferMessages : [brand.offer1, brand.offer2, brand.offer3, brand.offer4].filter(Boolean);
  useEffect(() => {
    if (offerMessages.length < 2) return undefined;
    const timer = window.setInterval(() => setOfferIndex(index => (index + 1) % offerMessages.length), 5000);
    return () => window.clearInterval(timer);
  }, [offerMessages.length]);
  const currentOfferIndex = offerIndex % Math.max(offerMessages.length, 1);
  const parentId = category => typeof category.parentCategory === 'object' ? category.parentCategory?._id : category.parentCategory;
  const headerCategories = categories.filter(category => category.active !== false && !parentId(category));
  const childrenOf = category => categories.filter(child => child.active !== false && String(parentId(child) || '') === String(category._id || ''));
  const closeCategory = () => setOpenCategory(null);
  const openCollection = category => {
    const children = childrenOf(category);
    if (children.length) setOpenCategory(current => current?._id === category._id ? null : category);
    else { closeCategory(); onCollection(category.name); }
  };
  return <div className="header-shell reference-header" onKeyDown={event => { if (event.key === 'Escape') closeCategory(); }}>
    <header className="reference-top-row">
      <a className={`reference-brand ${brand.companyName ? 'has-company-name' : ''}`} href="/" onClick={event => { event.preventDefault(); onHome(); }} aria-label={brand.companyName || brand.logoText || 'Store home'}>
        {brand.logoImage ? <img src={brand.logoImage} alt={brand.companyName || brand.logoText || 'Store logo'} /> : brand.companyName || brand.logoText ? <strong>{t(brand.companyName || brand.logoText)}</strong> : <i className="reference-brand-skeleton" />}
        {brand.logoCaption ? <span className="reference-brand-tagline">{t(brand.logoCaption)}</span> : <i className="reference-tagline-skeleton" />}
      </a>
      <button className="reference-search" onClick={onSearch}><span>{t('Search for products...')}</span><Search size={20} /></button>
      <nav className="reference-page-links" aria-label={t('Main navigation')}>
        <button onClick={onHome}>{t('Home')}</button>
      </nav>
      <LanguageSelector compact />
      <button className="reference-mobile-toggle" aria-label={t('Open navigation')} onClick={() => onPanel('menu')}><Menu size={20} /></button>
    </header>
    <div className="reference-utility-row">
      <div className="reference-company-name">{brand.shippingOffer ? t(brand.shippingOffer) : <i className="reference-shipping-skeleton" />}</div>
      <div className="reference-offer-inline" role="status" aria-label={t('Current store offer')}>{offerMessages.length ? <><span className="offer-label">{t('SPECIAL OFFER')}</span><span className="offer-accent" aria-hidden="true">✦</span><span className="offer-message" key={currentOfferIndex}>{t(offerMessages[currentOfferIndex])}</span><span className="offer-progress" key={`progress-${currentOfferIndex}`} aria-hidden="true" /></> : <i className="reference-offer-skeleton" />}</div>
      <div className="reference-utility-actions">
        <button onClick={() => onPanel('wishlist')}><Heart size={18} /><span>{t('My Wishlist')}</span>{savedCount > 0 && <b>{savedCount}</b>}</button>
        {customer ? <div className="account-menu-wrap"><button className="account-avatar-button" aria-label={t('Open account menu')} aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen(value => !value)}><span className="account-avatar">{(customer.name || customer.email || 'A').trim().charAt(0).toUpperCase()}</span><span>{t(customer.name?.split(' ')[0] || 'Account')}</span><ChevronDown size={14} /></button>{accountMenuOpen && <><button className="account-menu-dismiss" aria-label={t('Close account menu')} onClick={() => setAccountMenuOpen(false)} /><div className="account-menu"><strong>{customer.name || 'Your account'}</strong><small>{customer.email}</small><button onClick={() => { setAccountMenuOpen(false); onProfile(); }}>{t('Profile')}</button><button onClick={() => { setAccountMenuOpen(false); onLogout(); }}>{t('Log out')}</button></div></>}</div> : <button onClick={onAccount}><UserRound size={18} /><span>{t('Sign In / Register')}</span></button>}
        <button onClick={() => onPanel('bag')}><ShoppingBag size={20} /><span>{t('My Cart')}</span><b>{count}</b></button>
      </div>
    </div>
    {!!headerCategories.length ? <nav className="reference-category-row" aria-label={t('Product categories')}>
      {brand.navCaption && <span className="reference-nav-caption">{t(brand.navCaption)}</span>}
      {headerCategories.map(category => <button key={category._id || category.slug || category.name} aria-expanded={openCategory?._id === category._id} onClick={() => openCollection(category)}>{t(category.name)}{childrenOf(category).length > 0 && <ChevronDown size={13} className={openCategory?._id === category._id ? 'turned' : ''} />}</button>)}
    </nav> : <nav className="reference-category-row reference-category-skeleton" aria-label={t('Product categories loading')}>{Array.from({ length: 4 }, (_, index) => <i key={index} />)}</nav>}
    {openCategory && <><button className="reference-menu-backdrop" aria-label={t('Close subcategories')} onClick={closeCategory} /><div className="reference-category-menu"><div className="reference-menu-heading"><span className="eyebrow">{t('SHOP SUBCATEGORIES')}</span><h2>{t(openCategory.name)}</h2><p>{t(openCategory.note || openCategory.description || 'Choose a collection to explore.')}</p><button className="reference-menu-all" onClick={() => { const name = openCategory.name; closeCategory(); onCollection(name); }}>{t(`View all ${openCategory.name}`)}<ArrowUpRight size={16} /></button></div><div className="reference-category-grid">{childrenOf(openCategory).map((category, index) => <button className="reference-category-card" key={category._id || category.slug || category.name} onClick={() => { closeCategory(); onCollection(category.name); }}><span className={`reference-category-art reference-art-${index % 4}`}>{category.image ? <img src={category.image} alt={category.name} /> : <i aria-hidden="true" />}</span><span className="reference-category-card-copy"><small>{t('SUBCATEGORY')} · {String(index + 1).padStart(2, '0')}</small><strong>{t(category.name)}</strong><span>{t(category.note || category.description || 'Handcrafted pieces for your home.')}</span><ArrowUpRight size={18} /></span></button>)}</div><button className="reference-menu-close" aria-label={t('Close subcategories')} onClick={closeCategory}><X size={18} /></button></div></>}
  </div>;
}
