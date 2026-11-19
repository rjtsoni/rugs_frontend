import { t } from '../i18n';
import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import RichContent from './RichContent';
const defaultEdits = [{
  design: 'sandstone',
  colour: '#d7c8ae'
}, {
  design: 'terra',
  colour: '#c18b70'
}, {
  design: 'olive',
  colour: '#92977b'
}];
export default function MaterialEdit({
  onExplore,
  content = {},
  products = [],
  onSelect
}) {
  const [active, setActive] = useState(0);
  const edits = defaultEdits.map((edit, i) => ({
    ...edit,
    ...((Array.isArray(content.materials) && content.materials[i]) || {}),
    name: (Array.isArray(content.materials) && content.materials[i]?.name) || content[`materialTab${i + 1}`] || '',
    title: (Array.isArray(content.materials) && content.materials[i]?.title) || '',
    text: (Array.isArray(content.materials) && content.materials[i]?.text) || '',
    note: (Array.isArray(content.materials) && content.materials[i]?.note) || '',
    filter: (Array.isArray(content.materials) && content.materials[i]?.filter) || ''
  }));
  const edit = edits[active];
  const linkedProduct = products.find(product => String(product._id || product.id) === String(edit.productId))
    || (edit.filter && products.find(product => product.category === edit.filter))
    || products.find(product => product.design === edit.design);
  return <section className="material-edit" aria-label={t("Shop by mood")}>
    <div className="material-copy"><span className="eyebrow">{content.materialEyebrow?.trim() ? t(content.materialEyebrow) : <i className="home-skeleton-block material-copy-skeleton eyebrow" />}</span><h2>{content.materialTitle?.trim() ? t(content.materialTitle) : <i className="home-skeleton-block material-copy-skeleton title" />}</h2>{content.materialDescription?.trim() ? <RichContent className="material-description rich-content-block" value={t(content.materialDescription)} /> : <i className="home-skeleton-block material-copy-skeleton description" />}<div className="mood-tabs" role="tablist" aria-label="Loading material choices">{edits.map((e, i) => <button key={`mood-tab-${i}`} id={`mood-tab-${i}`} role="tab" aria-selected={active === i} aria-controls="mood-panel" onClick={() => setActive(i)}><span style={{
            background: e.name ? e.colour : undefined
          }} className={!e.name ? 'home-skeleton-block material-color-skeleton' : ''} />{e.name ? t(e.name) : <i className="home-skeleton-block material-tab-skeleton" />}<ArrowUpRight size={16} /></button>)}</div></div>
    <div className={`mood-stage mood-${active}`} id="mood-panel" role="tabpanel" aria-labelledby={`mood-tab-${active}`}><span className="mood-number">{t("0")}{t(active + 1)}</span><div className="mood-object">{edit.image ? <img className="material-product-image" src={edit.image} alt={edit.title || edit.name || ''} /> : <i className="home-skeleton-block material-image-skeleton" />}</div><div className="mood-caption"><span className="eyebrow">{edit.note ? t(edit.note) : <i className="home-skeleton-block material-copy-skeleton note" />}</span><h3>{edit.title ? t(edit.title) : <i className="home-skeleton-block material-copy-skeleton title" />}</h3>{edit.text ? <RichContent className="material-card-description rich-content-block" value={t(edit.text)} /> : <i className="home-skeleton-block material-copy-skeleton description" />}{content.materialButton?.trim() ? <button className="text-link" onClick={() => linkedProduct ? onSelect?.(linkedProduct) : onExplore(edit.filter)}>{t(content.materialButton)}<ArrowUpRight size={18} /></button> : <i className="home-skeleton-block material-copy-skeleton button" />}</div></div>
  </section>;
}
