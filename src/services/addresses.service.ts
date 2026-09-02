import api from './api';

export interface Address {
  id: string;
  /** Backend field name is `label` (e.g. "Home"/"Office"/"Other") — matches the form's "tag" concept. */
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

/** Shape sent when creating/updating — id/isDefault are handled separately, not part of the editable form fields. */
export interface AddressInput {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export const addressesService = {
  async list(): Promise<Address[]> {
    const { data: envelope } = await api.get('/addresses');
    return envelope.data;
  },

  async create(input: AddressInput): Promise<Address> {
    const { data: envelope } = await api.post('/addresses', { ...input, country: input.country || 'IN' });
    return envelope.data;
  },

  async update(id: string, input: Partial<AddressInput> & { isDefault?: boolean }): Promise<Address> {
    const { data: envelope } = await api.put(`/addresses/${id}`, input);
    return envelope.data;
  },

  /** Backend returns the remaining address list after delete — including any auto-promoted new default. */
  async remove(id: string): Promise<Address[]> {
    const { data: envelope } = await api.delete(`/addresses/${id}`);
    return envelope.data;
  },

  async setDefault(id: string): Promise<Address> {
    return addressesService.update(id, { isDefault: true });
  },
};