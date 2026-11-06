import React, { useState } from 'react';
import { customerApi } from '../services/api';

export default function CustomerProfileForm({ customer, onSaved }) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    mobile: customer?.mobile || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    postalCode: customer?.postalCode || ''
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const response = await customerApi('/api/customer/profile', { method: 'PUT', body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not save your profile.');
      onSaved(result.customer);
      setMessage('Your details have been saved.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <form className="customer-profile-form" onSubmit={submit}>
    <p>Keep your contact and delivery details up to date for a smoother checkout.</p>
    <label>Full name<input name="name" required minLength="2" maxLength="100" autoComplete="name" value={form.name} onChange={change} /></label>
    <label>Email address<input name="email" type="email" required maxLength="254" autoComplete="email" value={form.email} onChange={change} /></label>
    <label>Mobile number<input name="mobile" required minLength="7" maxLength="25" autoComplete="tel" value={form.mobile} onChange={change} /></label>
    <label>Delivery address<textarea name="address" rows="3" maxLength="500" autoComplete="street-address" value={form.address} onChange={change} /></label>
    <div className="customer-profile-grid"><label>City<input name="city" maxLength="100" autoComplete="address-level2" value={form.city} onChange={change} /></label><label>State<input name="state" maxLength="100" autoComplete="address-level1" value={form.state} onChange={change} /></label></div>
    <label>PIN code<input name="postalCode" maxLength="20" autoComplete="postal-code" value={form.postalCode} onChange={change} /></label>
    {error && <p className="customer-profile-error" role="alert">{error}</p>}{message && <p className="customer-profile-success" role="status">{message}</p>}
    <button className="button olive" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
  </form>;
}
