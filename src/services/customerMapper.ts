import { User } from '../context/AppContext';

/** What the backend's sanitizeCustomer() actually returns — the ONE shape both auth and profile services map from. */
export interface BackendCustomer {
  id: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  license?: string;
  dob?: string;
  gender?: string;
  dateCreated?: string;
  billing?: { city?: string; state?: string; postcode?: string; phone?: string };
  shipping?: Record<string, any>;
}

function formatMemberSince(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * The ONLY place a BackendCustomer gets turned into a User. Used by
 * auth.service.ts (login/register/getMe) AND profile.service.ts
 * (getProfile/updateProfile) — previously each had its own copy of this
 * that drifted apart, which is exactly why phone/city/etc were vanishing
 * on every fresh login (auth.service.ts's old copy didn't know those
 * fields existed, so it silently dropped them on every login/getMe call).
 *
 * Registration stored the initial display name as WooCommerce's
 * `username` (first_name was just set equal to it). Once a real
 * firstName/lastName has been saved via Edit Profile, that takes
 * priority — username is only the fallback for accounts that have
 * never been edited since registering.
 */
export function mapCustomerToUser(c: BackendCustomer): User {
  const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ').trim();
  return {
    id: String(c.id),
    name: fullName || c.username || c.email,
    email: c.email,
    phone: c.phone || c.billing?.phone || '',
    dob: c.dob,
    gender: c.gender,
    city: c.billing?.city || undefined,
    state: c.billing?.state || undefined,
    pincode: c.billing?.postcode || undefined,
    memberSince: formatMemberSince(c.dateCreated),
  };
}