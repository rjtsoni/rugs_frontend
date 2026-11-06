import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import './CustomerAuthModal.css';
import { customerApi } from '../services/api';

export default function CustomerAuthModal({ intent = 'favorite', onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState(''); const [mobile, setMobile] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const register = mode === 'register';
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await customerApi(`/api/customer/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(register ? { name, email, password, mobile } : { email, password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not sign you in. Please try again.');
      await onAuthenticated(result.customer);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const copy = intent === 'checkout' ? 'Sign in to continue to checkout.' : intent === 'wishlist' ? 'Sign in to view your saved rugs.' : intent === 'account' ? 'Sign in or create your customer account.' : 'Sign in to save this piece to your favourites.';
  return <div className="customer-auth-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="customer-auth-modal" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title"><button className="customer-auth-close" aria-label="Close sign in" onClick={onClose}><X size={19} /></button><span className="customer-auth-kicker">RUGS.</span><h2 id="customer-auth-title">{register ? 'Make yourself at home.' : 'Welcome back.'}</h2><p>{register ? 'Create an account to keep your favourite pieces close.' : copy}</p><form onSubmit={submit}>{register && <><label>Your name<input required minLength="2" maxLength="100" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label><label>Mobile number<input required minLength="7" maxLength="25" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value)} /></label></>}<label>Email address<input type="email" required maxLength="254" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Password<input type="password" required minLength={register ? 8 : 1} maxLength="128" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <div className="customer-auth-error" role="alert">{error}</div>}<button className="customer-auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}<ArrowRight size={18} /></button></form><button className="customer-auth-switch" onClick={() => { setError(''); setMode(register ? 'login' : 'register'); }}>{register ? 'Already have an account? Sign in' : 'New to Rugs? Create an account'}</button><small>Your account protects your saved rugs and checkout details.</small></section></div>;
}
