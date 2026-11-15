const brand = 'Tanu Rugs';
const baseDescription = 'Thoughtfully designed rugs for modern homes, with inviting textures and considered designs.';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

function getPageMetadata(pathname, storefront = null) {
  const parts = pathname.split('/').filter(Boolean).map(part => decodeURIComponent(part));
  const actualBrand = storefront?.settings?.brand?.companyName || storefront?.settings?.brand?.logoText || brand;
  if (!parts.length) return { title: `${actualBrand} — Rugs for the way you live`, description: baseDescription };

  if (parts[0] === 'collections' && parts[1]) {
    const categorySlug = parts[1].toLowerCase();
    const category = storefront?.categories?.find(item => item.slug?.toLowerCase() === categorySlug || item.name?.toLowerCase() === categorySlug)?.name || parts[1].replace(/[-_]+/g, ' ');
    return { title: `${category} Rugs | ${actualBrand}`, description: storefront?.categories?.find(item => item.name === category)?.description || `Explore ${category} rugs at ${actualBrand}. Discover considered designs, inviting textures and styles for every room.` };
  }

  if (parts[0] === 'products' && parts[1]) {
    const routeSlug = parts[1].replace(/^\d+-/, '').toLowerCase();
    const product = storefront?.products?.find(item => item.slug?.toLowerCase() === routeSlug || String(item._id || item.id) === parts[1].split('-')[0]);
    const productName = product?.name || parts[1].replace(/^\d+-/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
    if (parts[2] === 'reviews') return { title: `Reviews for ${productName} | ${actualBrand}`, description: `Read customer reviews for ${productName} from ${actualBrand}.`, noindex: true };
    return { title: `${productName} | Handcrafted Rugs | ${actualBrand}`, description: product?.description || `Discover ${productName}, a thoughtfully designed rug from ${actualBrand}. Explore its details, sizes and handcrafted character.` };
  }

  if (parts[0] === 'pages' && parts[1]) {
    const page = storefront?.pages?.find(item => item.key?.toLowerCase() === parts[1].toLowerCase());
    const pageName = page?.title || parts[1].replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
    return { title: `${pageName} | ${actualBrand}`, description: page?.subtitle || page?.body?.replace(/<[^>]*>/g, '').slice(0, 155) || `Learn more about ${pageName.toLowerCase()} at ${actualBrand}.` };
  }

  const fixed = {
    contact: { title: `Contact Us | ${actualBrand}`, description: `Get in touch with ${actualBrand} for help choosing rugs, orders or general enquiries.` },
    cart: { title: `Shopping Bag | ${actualBrand}`, description: `Review the rugs in your ${actualBrand} shopping bag.`, noindex: true },
    checkout: { title: `Checkout | ${actualBrand}`, description: `Complete your ${actualBrand} order securely.`, noindex: true }
  };
  return fixed[parts[0]] || { title: `Page Not Found | ${brand}`, description: baseDescription, noindex: true };
}

export function seoMiddleware(getApiBase = () => 'https://rug-backend.onrender.com') {
  let storefrontCache;
  let storefrontCacheTime = 0;
  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) return next();
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    let storefront = null;
    if (/^\/(collections|products|pages)\//.test(pathname) && Date.now() - storefrontCacheTime > 30000) {
      try {
        const response = await fetch(`${getApiBase().replace(/\/$/, '')}/api/storefront`, { signal: AbortSignal.timeout(1800) });
        if (response.ok) {
          storefrontCache = await response.json();
          storefrontCacheTime = Date.now();
        }
      } catch { /* Keep route-slug metadata as a fallback while the API is unavailable. */ }
    }
    storefront = storefrontCache || null;
    const metadata = getPageMetadata(pathname, storefront);
    const originalEnd = res.end;
    res.end = function (body, ...args) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        let html = body.toString();
        const title = escapeHtml(metadata.title);
        const description = escapeHtml(metadata.description);
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
        html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${description}" />`);
        html = html.replace(/<meta name="robots"[^>]*>/i, `<meta name="robots" content="${metadata.noindex ? 'noindex, follow' : 'index, follow'}" />`);
        html = html.replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`);
        html = html.replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
        html = html.replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
        body = html;
      }
      return originalEnd.call(this, body, ...args);
    };
    next();
  };
}
