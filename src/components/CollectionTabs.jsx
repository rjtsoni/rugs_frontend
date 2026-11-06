import { t } from '../i18n';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './CollectionTabs.css';

const fallbackImages = [
  'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85'
];

export default function CollectionTabs({ products = [], categories = [], onOpenCategory }) {
  const activeCategories = categories.filter(category => category.active !== false);
  const parentId = category => typeof category.parentCategory === 'object' ? category.parentCategory?._id : category.parentCategory;
  const parents = activeCategories.filter(category => !parentId(category));
  const dynamicCategories = parents.length ? parents : [...new Set(products.map(product => product.category).filter(Boolean))].map(name => ({ name }));

  const cards = dynamicCategories.slice(0, 5).map((category, index) => {
        const childIds = activeCategories.filter(child => String(parentId(child) || '') === String(category._id || '')).map(child => child.name);
        const matches = products.filter(product => product.category === category.name || childIds.includes(product.category));
        const image = category.image || matches.find(product => product.image || product.images?.[0])?.image || matches.find(product => product.images?.[0])?.images?.[0] || fallbackImages[index % fallbackImages.length];
        return { category, matches, image };
  });
  const featured = cards[0];

  return <div className="collection-picker">
    <div className="picker-caption"><span>{t('SHOP BY CATEGORY')}</span><button onClick={() => onOpenCategory('All rugs')}>{t('Explore all rugs')}<ArrowUpRight size={15} /></button></div>
    <div className="collection-editorial-grid" aria-label={t('Shop rugs by category')}>
      {featured && <button className="featured-category" onClick={() => onOpenCategory(featured.category.name)} aria-label={`${t(featured.category.name)}, ${featured.matches.length} ${t('items')}`}>
        <img src={featured.image} alt="" loading="lazy" />
        <span className="featured-category-shade" />
        <span className="featured-category-note">{t('THE SIGNATURE EDIT')}</span>
        <span className="featured-category-copy"><small>{t(featured.matches.length)} {t('considered pieces')}</small><strong>{t(featured.category.name)}</strong><span>{t(featured.category.note || featured.category.description || 'Hand-finished rugs, chosen for the way you live.')}</span><b>{t('Explore collection')}<ArrowUpRight size={17} /></b></span>
      </button>}
      <div className="collection-side-grid">
        {cards.slice(1).map(({ category, matches, image }) => <button key={category._id || category.name} className="collection-tab" onClick={() => onOpenCategory(category.name)} aria-label={`${t(category.name)}, ${matches.length} ${t('items')}`}>
          <span className="collection-tab-preview"><img src={image} alt="" loading="lazy" /><span className="category-card-shade" /><span className="collection-tab-count">{t(matches.length)} {t(matches.length === 1 ? 'piece' : 'pieces')}</span></span>
          <span className="collection-tab-bottom"><span><strong>{t(category.name)}</strong><small>{t(category.note || category.description || 'Explore the collection')}</small></span><span className="collection-tab-arrow"><ArrowUpRight size={19} /></span></span>
        </button>)}
        {!cards.length && <p className="category-empty-note">{t('Explore all of our handcrafted rugs.')}</p>}
      </div>
    </div>
  </div>;
}
