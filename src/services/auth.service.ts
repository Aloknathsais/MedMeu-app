import api from './api';
import { User } from '../context/AppContext';
import { mapCustomerToUser } from './customerMapper';

export interface LoginPayload {
  /** Sent to the backend as `email`. Only email lookups work today — see the note in LoginPage.tsx. */
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  /** Drug License / Clinical Establishment No. / GST No. — optional. */
  license?: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    // Backend wraps every response as { success, data: {...} } — unwrap it here.
    const { data: envelope } = await api.post('/auth/login', {
      email: payload.usernameOrEmail,
      password: payload.password,
    });
    const { token, customer } = envelope.data;
    const user = mapCustomerToUser(customer);

    localStorage.setItem('medmeu_token', token);
    localStorage.setItem('medmeu_user', JSON.stringify(user));
    return { token, user };
  },

  async register(payload: RegisterPayload) {
    const { data: envelope } = await api.post('/auth/register', {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      license: payload.license || undefined,
    });
    const { token, customer } = envelope.data;
    const user = mapCustomerToUser(customer);

    // Backend register already returns a usable token — log the user
    // straight in instead of forcing a second login step.
    localStorage.setItem('medmeu_token', token);
    localStorage.setItem('medmeu_user', JSON.stringify(user));
    return { token, user };
  },

  async getMe(): Promise<User> {
    const { data: envelope } = await api.get('/customers/me');
    const user = mapCustomerToUser(envelope.data);
    // Keep the cache fresh so a later page refresh shows the latest data too.
    localStorage.setItem('medmeu_user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('medmeu_token');
    localStorage.removeItem('medmeu_user');
  },
  getUser(): User | null {
    try { return JSON.parse(localStorage.getItem('medmeu_user') || 'null'); }
    catch { return null; }
  },
  isAuthenticated() {
    return !!localStorage.getItem('medmeu_token');
  },
};