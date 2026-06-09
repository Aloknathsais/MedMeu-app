import api from './api';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; phone: string; password: string; }

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('medmeu_token', data.token);
    localStorage.setItem('medmeu_user', JSON.stringify(data.user));
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  async sendOtp(phone: string) {
    const { data } = await api.post('/auth/send-otp', { phone });
    return data;
  },
  async verifyOtp(phone: string, otp: string) {
    const { data } = await api.post('/auth/verify-otp', { phone, otp });
    localStorage.setItem('medmeu_token', data.token);
    localStorage.setItem('medmeu_user', JSON.stringify(data.user));
    return data;
  },
  logout() {
    localStorage.removeItem('medmeu_token');
    localStorage.removeItem('medmeu_user');
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('medmeu_user') || 'null'); }
    catch { return null; }
  },
  isAuthenticated() {
    return !!localStorage.getItem('medmeu_token');
  },
};
