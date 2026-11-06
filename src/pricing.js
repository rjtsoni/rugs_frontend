export function discountPercent(product) {
  return Math.min(100, Math.max(0, Number(product?.discountPercentage) || 0));
}

export function discountedPrice(product) {
  return Math.round((Number(product?.price) || 0) * (1 - discountPercent(product) / 100));
}

export function discountedSizePrice(size, product = {}) {
  const price = Number(size?.price ?? product.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(size?.discountPercentage ?? product.discountPercentage) || 0));
  return Math.round(price * (1 - discount / 100));
}

export function featuredSize(product) {
  return [...(product?.sizes || [])].sort((a, b) => discountedSizePrice(b, product) - discountedSizePrice(a, product))[0] || null;
}
