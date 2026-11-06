import { useSyncExternalStore } from 'react';
import hi from './locales/hi.json';
const listeners = new Set(), dictionaries = { hi };
let locale = 'en';
try { const saved = localStorage.getItem('Tanu-Rugs-language'); if (saved === 'hi') locale = 'hi'; } catch { }
export function useLocale() { return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => locale); }
export async function setLocale(value) {
    if (value !== 'en' && !dictionaries[value]) {
        const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: value }) });
        let data; try { data = await response.json(); } catch { throw new Error('Translation server is unavailable. Run npm run dev or npm run preview with the server API key configured.'); }
        if (!response.ok || !data.dictionary) throw new Error(data.error || 'Translation failed. Please try again.');
        dictionaries[value] = data.dictionary;
    }
    locale = value; try { localStorage.setItem('Tanu-Rugs-language', value); } catch { }
    document.documentElement.lang = value;
    document.documentElement.dir = ['ar', 'he', 'ur'].includes(value) ? 'rtl' : 'ltr';
    listeners.forEach(fn => fn());
}
export function t(value) {
    if (locale === 'en' || typeof value !== 'string') return value;
    const dictionary = dictionaries[locale] || {}, key = value.trim();
    if (dictionary[key]) return value.replace(key, dictionary[key]);
    const word = s => dictionary[s] || s;
    return value.replace(/Showing (\d+) of (\d+) pieces/g, (_, a, b) => word('Showing') + ' ' + a + ' ' + word('of') + ' ' + b + ' ' + word('pieces')).replace(/All (\d+) pieces/g, (_, n) => word('All rugs') + ' · ' + n).replace(/(\d+) pieces to make your own/g, (_, n) => n + ' ' + word('pieces') + ' ' + word('to make your own')).replace(/(\d+) pieces/g, (_, n) => n + ' ' + word('pieces')).replace(/Page (\d+) of (\d+)/g, (_, a, b) => word('Page') + ' ' + a + ' / ' + b);
}
