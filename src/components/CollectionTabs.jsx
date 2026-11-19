import { t } from '../i18n';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import RichContent from './RichContent';
import './RichContent.css';
import './CollectionTabs.css';

export default function CollectionTabs({ products = [], categories = [], onOpenCategory }) {
  const activeCategories = categories.filter(category => category.active !== false);
  const parentId = category => typeof category.parentCategory === 'object' ? category.parentCategory?._id : category.parentCategory;
  const parents = activeCategories.filter(category => !parentId(category));
  const dynamicCategories = parents.length ? parents : [...new Set(products.map(product => product.category).filter(Boolean))].map(name => ({ name }));

  const cards = dynamicCategories.slice(0, 5).map((category, index) => {
    const childIds = activeCategories.filter(child => String(parentId(child) || '') === String(category._id || '')).map(child => child.name);
    const matches = products.filter(product => product.category === category.name || childIds.includes(product.category));
    const image = category.image || matches.find(product => product.image || product.images?.[0])?.image || matches.find(product => product.images?.[0])?.images?.[0] || '';
    return { category, matches, image };
  });
  const featured = cards[0];

  if (!cards.length) return <div className="collection-picker collection-picker-skeleton" aria-label={t('Loading collections')}><div className="picker-caption"><i className="home-skeleton-block" /><i className="home-skeleton-block" /></div><div className="collection-editorial-grid"><i className="home-skeleton-block featured" /><div className="collection-side-grid">{Array.from({ length: 4 }, (_, index) => <i className="home-skeleton-block tile" key={index} />)}</div></div></div>;

  return <div className="collection-picker">
    <div className="picker-caption"><span>{t('SHOP BY CATEGORY')}</span><button onClick={() => onOpenCategory('All rugs')}>{t('')}</button></div>
    <div className="collection-editorial-grid" aria-label={t('Shop rugs by category')}>
      {featured && <button className={`featured-category${featured.image ? '' : ' category-loading'}`} onClick={() => onOpenCategory(featured.category.name)} aria-label={`${t(featured.category.name)}, ${featured.matches.length} ${t('items')}`}>
        {featured.image && <img src={featured.image} alt="" loading="lazy" />}
        <span className="featured-category-shade" />
        {featured.category.name && <span className="featured-category-note">{t(featured.category.name)}</span>}
        <span className="featured-category-copy">{featured.matches.length > 0 && <small>{t(featured.matches.length)} {t(featured.matches.length === 1 ? 'piece' : 'pieces')}</small>}<strong>{featured.category.name ? t(featured.category.name) : <i className="home-skeleton-block" />}</strong>{featured.category.note || featured.category.description ? <RichContent className="featured-category-description" value={featured.category.note || featured.category.description} /> : <i className="home-skeleton-block category-copy-skeleton" />}<b>{t('Explore collection')}<ArrowUpRight size={17} /></b></span>
      </button>}
      <div className="collection-side-grid">
        {cards.slice(1).map(({ category, matches, image }) => <button key={category._id || category.name} className="collection-tab" onClick={() => onOpenCategory(category.name)} aria-label={`${t(category.name)}, ${matches.length} ${t('items')}`}>
          <span className={`collection-tab-preview${image ? '' : ' category-image-loading'}`}>{image && <img src={image} alt="" loading="lazy" />}<span className="category-card-shade" />{matches.length > 0 && <span className="collection-tab-count">{t(matches.length)} {t(matches.length === 1 ? 'piece' : 'pieces')}</span>}</span>
          <span className="collection-tab-bottom"><span><strong>{category.name ? t(category.name) : <i className="home-skeleton-block" />}</strong>{category.note || category.description ? <RichContent className="collection-tab-description" value={category.note || category.description} /> : <i className="home-skeleton-block category-note-skeleton" />}</span><span className="collection-tab-arrow"><ArrowUpRight size={19} /></span></span>
        </button>)}
      </div>
    </div>
  </div>;
}
