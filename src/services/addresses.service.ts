import api from './api';

export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export const addressesService = {
  /**
   * Only list() is here for now — ProfilePage just needs the count.
   * Add create/update/delete here (matching the backend's full CRUD at
   * /api/addresses) when the Address Book page itself gets wired.
   */
  async list(): Promise<Address[]> {
    const { data: envelope } = await api.get('/addresses');
    return envelope.data;
  },
};