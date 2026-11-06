import { t } from '../i18n';
import React from 'react';
export default function Rug({
  design,
  className = ''
}) {
  return <div className={`rug ${design} ${className}`} role="img" aria-label={`${design} handcrafted rug design`}><div className="rug-pattern" /></div>;
}
