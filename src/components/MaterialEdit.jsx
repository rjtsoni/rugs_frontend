import { t } from '../i18n';
import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Rug from './Rug';
const defaultEdits = [{
  name: 'Quiet neutrals',
  title: 'A softer kind of statement.',
  text: 'Layer warm ivory, oatmeal and sand for a space that invites you to slow down.',
  design: 'sandstone',
  colour: '#d7c8ae',
  filter: 'Wool',
  note: 'WOOL · WARM SAND · SOFT TEXTURE'
}, {
  name: 'Earth & clay',
  title: 'Warmth, with a little character.',
  text: 'Sculptural lines and sunbaked tones bring an expressive, grounded energy home.',
  design: 'terra',
  colour: '#c18b70',
  filter: 'Wool',
  note: 'WOOL · TERRACOTTA · SCULPTED LINES'
}, {
  name: 'Into the green',
  title: 'Nature sets the tone.',
  text: 'Muted olive and an intricate weave make a thoughtful foundation for your favourite room.',
  design: 'olive',
  colour: '#92977b',
  filter: 'Hand-knotted',
  note: 'HAND-KNOTTED · OLIVE · TIMELESS PATTERN'
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
    name: (Array.isArray(content.materials) && content.materials[i]?.name) || content[`materialTab${i + 1}`] || edit.name
  }));
  const edit = edits[active];
  const linkedProduct = products.find(product => String(product._id || product.id) === String(edit.productId))
    || products.find(product => product.category === edit.filter)
    || products.find(product => product.design === edit.design);
  return <section className="material-edit" aria-label={t("Shop by mood")}>
    <div className="material-copy"><span className="eyebrow">{t(content.materialEyebrow || "THE PALETTE EDIT / 01—03")}</span><h2>{t(content.materialTitle || "A feeling. A colour. A place to begin.")}</h2><p>{t(content.materialDescription || "Follow your instinct. Find the tones that feel like you.")}</p><div className="mood-tabs" role="tablist" aria-label={t("Colour palettes")}>{t(edits.map((e, i) => <button key={e.name} id={`mood-tab-${i}`} role="tab" aria-selected={active === i} aria-controls="mood-panel" onClick={() => setActive(i)}><span style={{
            background: e.colour
          }} />{t(e.name)}<ArrowUpRight size={16} /></button>))}</div></div>
    <div className={`mood-stage mood-${active}`} id="mood-panel" role="tabpanel" aria-labelledby={`mood-tab-${active}`}><span className="mood-number">{t("0")}{t(active + 1)}</span><div className="mood-object">{edit.image ? <img className="material-product-image" src={edit.image} alt={edit.title || edit.name} /> : <Rug design={edit.design} />}</div><div className="mood-caption"><span className="eyebrow">{t(edit.note)}</span><h3>{t(edit.title)}</h3><p>{t(edit.text)}</p><button className="text-link" onClick={() => linkedProduct ? onSelect?.(linkedProduct) : onExplore(edit.filter)}>{t(linkedProduct ? content.materialButton || "View product details " : content.materialButton || "Discover this palette ")}<ArrowUpRight size={18} /></button></div></div>
  </section>;
}
