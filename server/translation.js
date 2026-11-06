import { readFileSync } from 'node:fs';
const catalog = Object.keys(JSON.parse(readFileSync(new URL('../src/locales/hi.json', import.meta.url),'utf8')));
const cache = new Map();
const pending = new Map();
export const supported = new Set(['hi','ja','zh-CN','zh-TW','fr','de','es','it','pt','ar','ko','ru','bn','gu','mr','ta','te','nl','tr','vi','th','id','pl','uk','ur','pa','kn','ml','sv','el','he']);
export function translationMiddleware(getKey) {
  return async (req,res,next) => {
    if(req.url?.split('?')[0] !== '/api/translate') return next();
    const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
    if(req.method!=='POST') return send(405,{error:'Method not allowed.'});
    const key=getKey();
    if(!key) return send(503,{error:'Google translation is not activated yet. Add GOOGLE_TRANSLATE_API_KEY to the server .env file. English and Hindi are available now.'});
    try {
      let body='';for await(const part of req){body+=part;if(body.length>1024)return send(413,{error:'Request too large.'});}
      let target;try{target=JSON.parse(body).target;}catch{return send(400,{error:'Invalid request.'});}
      if(!supported.has(target)) return send(400,{error:'Unsupported language.'});
      if(cache.has(target))return send(200,{dictionary:cache.get(target)});
      if(!pending.has(target)) pending.set(target,(async()=>{
        const dictionary={};
        for(let i=0;i<catalog.length;i+=50){
          const strings=catalog.slice(i,i+50);
          const result=await fetch('https://translation.googleapis.com/language/translate/v2',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key},body:JSON.stringify({q:strings,target,source:'en',format:'text'}),signal:AbortSignal.timeout(25000)});
          if(!result.ok) throw new Error('Translation service unavailable. Check the server API key, API activation, billing and quota.');
          const data=await result.json();
          if(data.data?.translations?.length!==strings.length)throw new Error('Incomplete translation response. Please try again.');
          strings.forEach((s,n)=>dictionary[s]=data.data.translations[n].translatedText);
        }
        cache.set(target,dictionary);return dictionary;
      })().finally(()=>pending.delete(target)));
      return send(200,{dictionary:await pending.get(target)});
    }catch(error){return send(502,{error:error.message==='Incomplete translation response. Please try again.'?error.message:'Translation service unavailable. Check server configuration and try again.'});}
  };
}
