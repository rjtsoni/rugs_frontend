import React from 'react';
import DOMPurify from 'dompurify';

const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ol', 'ul', 'li', 'h2', 'h3', 'blockquote', 'a'];

function safeHtml(value) {
  // Editors and pasted copy often use non-breaking spaces between every word,
  // which prevents long descriptions from wrapping inside their layout column.
  const text = String(value || '').replace(/&nbsp;|&#160;|&#xA0;|\u00a0/gi, ' ');
  const hasMarkup = /<[a-z][\s\S]*>/i.test(text);
  const source = hasMarkup
    ? text
    : `<p>${text.split(/\r?\n/).map(line => line || '<br>').join('</p><p>')}</p>`;
  return DOMPurify.sanitize(source, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
}

export default function RichContent({ value, className = '' }) {
  return <div className={`rich-content ${className}`.trim()} dangerouslySetInnerHTML={{ __html: safeHtml(value) }} />;
}
