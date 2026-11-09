const renderApiBase = 'https://rug-backend.onrender.com';
const storefrontBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : renderApiBase);
const customerBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : renderApiBase);

export async function getStorefront() {
  const response = await fetch(`${storefrontBase}/api/storefront`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load the storefront from the API.');
  return response.json();
}

export async function getStorefrontProducts({ page = 1, limit = 9, keyword = '', category = 'All rugs', signal } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), keyword, category });
  const response = await fetch(`${storefrontBase}/api/storefront/products?${params}`, { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Could not load the requested products.');
  return response.json();
}

export async function subscribeNewsletter(email) {
  const response = await fetch(`${storefrontBase}/api/storefront/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not subscribe right now. Please try again.');
  return data;
}

export async function submitContactMessage(message) {
  const response = await fetch(`${storefrontBase}/api/storefront/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not send your message. Please try again.');
  return data;
}

export async function getProductReviews(productId, { page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetch(`${storefrontBase}/api/storefront/products/${encodeURIComponent(productId)}/reviews?${params}`, { cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load product reviews.');
  return data;
}

export async function submitProductReview(productId, review) {
  const response = await fetch(`${storefrontBase}/api/storefront/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not submit your review.');
  return data;
}

export function customerApi(path, options = {}) {
  return fetch(`${customerBase}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
}
