import api from './api';
import { User } from '../context/AppContext';
import { mapCustomerToUser } from './customerMapper';

/** Backend wants firstName/lastName separately (WooCommerce native fields), not one combined name. */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || fullName.trim();
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  dob?: string;
  gender?: string;
}

export const profileService = {
  async getProfile(): Promise<User> {
    const { data: envelope } = await api.get('/customers/me');
    return mapCustomerToUser(envelope.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { firstName, lastName } = splitName(payload.name);
    const { data: envelope } = await api.put('/customers/me', {
      firstName,
      lastName,
      email: payload.email,
      phone: payload.phone || undefined,
      city: payload.city || undefined,
      state: payload.state || undefined,
      pincode: payload.pincode || undefined,
      dob: payload.dob || undefined,
      gender: payload.gender || undefined,
    });
    return mapCustomerToUser(envelope.data);
  },
};