# Aara — Rugs & Living

A premium, responsive static React storefront inspired by the rug shopping references. Built with React, Vite and Lucide icons.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

Reusable components include the CSS-rendered `Rug` design. With the Node API connected, MongoDB provides products, categories, brand settings, homepage content and content pages. The storefront uses built-in sample rugs as a fallback when the API is unavailable. Wishlist, shopping bag and newsletter confirmation are still local demo state; checkout and email delivery are not connected.

Interior photography loads from Unsplash and typography from Google Fonts; these require internet access. Product rug illustrations are generated with CSS and require no external images. Replace the sample name, copy, product illustrations, prices, policies and contact details before a commercial launch.


Collection previews show five products without a slider. View more opens /collections/:category?page=1 with six products per page. Product quick views link to /products/:id-name and provide a Copy URL action, also available on product detail pages. Browser history and direct Vite links are supported. For production hosting, configure an SPA fallback to index.html for collection/product paths. Copied links use the current origin; localhost URLs are only accessible locally. The expanded dataset contains demo variants of the same rug illustrations.


## MongoDB, API and admin panel

The editable store uses the sibling `Rugs_Backend` Node/Express API and `Rugs_admin` React admin app. MongoDB Compass is the database client: copy the same connection URI used by Compass into the backend `.env` as `MONGODB_URI`. If Compass connects to Atlas, use its `mongodb+srv://...` URI and ensure the Atlas project has your current IP in its IP access list and a database user. Compass by itself does not run a MongoDB server.

In PowerShell, prepare `D:\new\Rugs_Backend\.env` from `.env.example`, set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run `npm run seed` once and `npm run dev` in that folder. The idempotent seed adds starter Aara content without replacing records you have edited.

In another terminal run `npm run dev` in `D:\new\Rugs_admin` and open http://localhost:5174. Sign in with the admin email and password from the backend `.env`. The storefront is at http://localhost:5173; its Vite dev proxy forwards `/api/storefront` to the API on port 4000. The admin can manage products, categories, content pages, brand settings, logo, homepage copy and image URLs. For production, configure HTTPS, a persistent database, a public image-storage service and a reverse proxy/API URL.

## Automatic website translation
The flag selector offers 32 languages. English and Hindi work without a service. Other languages load the complete UI catalog from the official Google Cloud Translation Basic v2 API through a server-only /api/translate endpoint, then switch the React UI in place. Product names and INR prices remain unchanged.

Copy .env.example to .env, configure GOOGLE_TRANSLATE_API_KEY from a Google Cloud project with Cloud Translation API enabled and billing configured, then restart npm run dev. Never prefix this key with VITE_. npm run build followed by npm run preview also provides the translation endpoint. A static-only hosting upload does not provide this endpoint: production needs a Node server with the same translation middleware or a serverless equivalent. The API caches completed translations per language in server memory, accepts only a fixed source catalog and supported targets, and does not accept arbitrary user text. Machine translations need editorial review before commercial publication.
