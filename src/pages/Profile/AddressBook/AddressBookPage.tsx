import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast, IonSpinner,
} from '@ionic/react';
import {
  addOutline, homeOutline, businessOutline, locationSharp,
  pencilOutline, trashBinOutline, checkmarkCircle,
  locationOutline, warningOutline,
} from 'ionicons/icons';
import { addressesService, Address as ApiAddress } from '../../../services/addresses.service';
import './AddressBook.css';

/* ── Types ── */
type Tag = 'Home' | 'Office' | 'Other';

/** Local display type — same shape the UI already used, `tag` maps to the backend's `label` field. */
interface Address {
  id: string;
  name: string;
  tag: Tag;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

const tagIcon: Record<string, any> = {
  Home:   homeOutline,
  Office: businessOutline,
  Other:  locationSharp,
};

function fromApi(a: ApiAddress): Address {
  const tag: Tag = a.label === 'Home' || a.label === 'Office' ? a.label : 'Other';
  return {
    id: a.id,
    name: a.name,
    tag,
    line1: a.line1,
    line2: a.line2 || '',
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    phone: a.phone,
    isDefault: !!a.isDefault,
  };
}

function extractErrorMessage(err: any, fallback: string): string {
  const backendMessage = err?.response?.data?.message;
  const firstDetail = err?.response?.data?.details?.[0]?.message;
  return firstDetail || backendMessage || fallback;
}

type ViewMode = 'list' | 'add' | 'edit';

type FormShape = Omit<Address, 'id' | 'isDefault'>;

const emptyForm = (): FormShape => ({
  name: '', tag: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', phone: '',
});

const AddressBookPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormShape>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormShape, string>>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const fetchAddresses = useCallback(async () => {
    try {
      const list = await addressesService.list();
      setAddresses(list.map(fromApi));
      setLoadError(false);
    } catch (err) {
      console.error('Failed to load addresses', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const update = (field: keyof FormShape) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(p => ({ ...p, [field]: e.target.value }));
      setErrors(p => ({ ...p, [field]: '' }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormShape, string>> = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.line1.trim())   e.line1   = 'Address line 1 is required';
    if (!form.city.trim())    e.city    = 'City is required';
    if (!form.state.trim())   e.state   = 'State is required';
    if (!form.phone.trim())   e.phone   = 'Phone number is required';
    else if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (form.pincode.length !== 6) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openAdd = () => {
    setForm(emptyForm());
    setErrors({});
    setEditingId(null);
    setViewMode('add');
  };

  const openEdit = (addr: Address) => {
    setForm({
      name: addr.name, tag: addr.tag, line1: addr.line1, line2: addr.line2,
      city: addr.city, state: addr.state, pincode: addr.pincode, phone: addr.phone,
    });
    setErrors({});
    setEditingId(addr.id);
    setViewMode('edit');
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      if (viewMode === 'add') {
        await addressesService.create({
          label: form.tag,
          name: form.name,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        });
        setToastMsg('Address added successfully!');
      } else if (editingId) {
        await addressesService.update(editingId, {
          label: form.tag,
          name: form.name,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        });
        setToastMsg('Address updated successfully!');
      }
      await fetchAddresses();
      setToastColor('success');
      setShowToast(true);
      setViewMode('list');
    } catch (err) {
      setToastMsg(extractErrorMessage(err, 'Failed to save address. Please try again.'));
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await addressesService.remove(id);
      await fetchAddresses();
      setDeleteConfirmId(null);
      setToastMsg('Address removed.');
      setToastColor('danger');
      setShowToast(true);
    } catch (err) {
      setToastMsg(extractErrorMessage(err, 'Failed to remove address. Please try again.'));
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setDeleting(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await addressesService.setDefault(id);
      await fetchAddresses();
      setToastMsg('Default address updated!');
      setToastColor('success');
      setShowToast(true);
    } catch (err) {
      setToastMsg(extractErrorMessage(err, 'Failed to update default address.'));
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const isFormMode = viewMode === 'add' || viewMode === 'edit';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {isFormMode ? (
              <button className="ab-back-btn" onClick={() => setViewMode('list')}>
                ‹
              </button>
            ) : (
              <IonBackButton defaultHref="/tabs/profile" />
            )}
          </IonButtons>
          <IonTitle>
            {viewMode === 'list' ? 'Address Book'
              : viewMode === 'add' ? 'Add New Address'
              : 'Edit Address'}
          </IonTitle>
          {viewMode === 'list' && addresses.length > 0 && (
            <IonButtons slot="end">
              <button className="ab-add-header-btn" onClick={openAdd}>
                <IonIcon icon={addOutline} />
                Add
              </button>
            </IonButtons>
          )}
          {isFormMode && (
            <IonButtons slot="end">
              <button className="ab-save-header-btn" onClick={handleSave} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ════════ LIST VIEW ════════ */}
        {viewMode === 'list' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
                <IonSpinner name="crescent" />
                <p>Loading addresses...</p>
              </div>
            ) : loadError ? (
              <div className="ab-empty">
                <div className="ab-empty-icon">
                  <IonIcon icon={warningOutline} />
                </div>
                <h3>Couldn't load addresses</h3>
                <p>Check your connection and try again.</p>
                <button className="ab-btn-solid" onClick={fetchAddresses}>Retry</button>
              </div>
            ) : addresses.length === 0 ? (
              <div className="ab-empty">
                <div className="ab-empty-icon">
                  <IonIcon icon={locationOutline} />
                </div>
                <h3>No saved addresses</h3>
                <p>Add a delivery address to make checkout faster.</p>
                <button className="ab-btn-solid" onClick={openAdd}>
                  <IonIcon icon={addOutline} /> Add Address
                </button>
              </div>
            ) : (
              <div className="ab-list">
                {addresses.map(addr => {
                  const isDeleting = deleteConfirmId === addr.id;
                  return (
                    <div key={addr.id} className={`ab-card ${addr.isDefault ? 'default' : ''}`}>
                      {addr.isDefault && (
                        <div className="ab-default-badge">
                          <IonIcon icon={checkmarkCircle} /> Default
                        </div>
                      )}

                      <div className="ab-card-body">
                        <div className="ab-card-top">
                          <div className="ab-tag-row">
                            <div className="ab-tag-icon-wrap">
                              <IonIcon icon={tagIcon[addr.tag]} />
                            </div>
                            <span className={`ab-tag-chip ${addr.tag.toLowerCase()}`}>{addr.tag}</span>
                          </div>
                          <p className="ab-card-name">{addr.name}</p>
                        </div>
                        <p className="ab-card-line">{addr.line1}</p>
                        {addr.line2 && <p className="ab-card-line">{addr.line2}</p>}
                        <p className="ab-card-line">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="ab-card-phone">{addr.phone}</p>
                      </div>

                      {!isDeleting ? (
                        <div className="ab-card-actions">
                          {!addr.isDefault && (
                            <button className="ab-action-link default-link"
                              onClick={() => setDefault(addr.id)}>
                              Set as Default
                            </button>
                          )}
                          <div className="ab-action-right">
                            <button className="ab-icon-btn edit" onClick={() => openEdit(addr)}>
                              <IonIcon icon={pencilOutline} /> Edit
                            </button>
                            <div className="ab-action-sep" />
                            <button className="ab-icon-btn delete"
                              onClick={() => setDeleteConfirmId(addr.id)}>
                              <IonIcon icon={trashBinOutline} /> Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="ab-delete-confirm">
                          <div className="ab-delete-confirm-left">
                            <IonIcon icon={warningOutline} />
                            <span>Remove this address?</span>
                          </div>
                          <div className="ab-delete-confirm-btns">
                            <button className="ab-del-cancel"
                              onClick={() => setDeleteConfirmId(null)} disabled={deleting}>
                              Cancel
                            </button>
                            <button className="ab-del-confirm"
                              onClick={() => handleDelete(addr.id)} disabled={deleting}>
                              {deleting ? '...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button className="ab-add-more-btn" onClick={openAdd}>
                  <IonIcon icon={addOutline} />
                  Add New Address
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════ ADD / EDIT FORM ════════ */}
        {isFormMode && (
          <div className="ab-form">

            <div className="ab-form-section">
              <p className="ab-form-section-title">Address Type</p>
              <div className="ab-tag-selector">
                {(['Home', 'Office', 'Other'] as Tag[]).map(tag => (
                  <button
                    key={tag}
                    className={`ab-tag-opt ${form.tag === tag ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, tag }))}
                  >
                    <IonIcon icon={tagIcon[tag]} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="ab-form-section">
              <p className="ab-form-section-title">Contact Details</p>

              <AbField label="Full Name" required error={errors.name}>
                <input
                  className="ab-input"
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={update('name')}
                />
              </AbField>

              <AbField label="Phone Number" required error={errors.phone}>
                <input
                  className="ab-input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  maxLength={10}
                  onChange={update('phone')}
                />
              </AbField>
            </div>

            <div className="ab-form-section">
              <p className="ab-form-section-title">Address Details</p>

              <AbField label="House / Flat / Building" required error={errors.line1}>
                <input
                  className="ab-input"
                  type="text"
                  placeholder="House no., building name"
                  value={form.line1}
                  onChange={update('line1')}
                />
              </AbField>

              <AbField label="Area / Street / Locality">
                <input
                  className="ab-input"
                  type="text"
                  placeholder="Street, area, locality"
                  value={form.line2}
                  onChange={update('line2')}
                />
              </AbField>

              <div className="ab-form-row">
                <AbField label="City" required error={errors.city} half>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={update('city')}
                  />
                </AbField>
                <AbField label="State" required error={errors.state} half>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={update('state')}
                  />
                </AbField>
              </div>

              <AbField label="Pincode" required error={errors.pincode}>
                <input
                  className="ab-input"
                  type="number"
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  maxLength={6}
                  onChange={update('pincode')}
                />
              </AbField>
            </div>

            <div className="ab-form-actions">
              <button className="ab-btn-solid" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : viewMode === 'add' ? 'Save Address' : 'Update Address'}
              </button>
              <button className="ab-btn-outline" onClick={() => setViewMode('list')} disabled={saving}>
                Cancel
              </button>
            </div>
            <div style={{ height: 32 }} />
          </div>
        )}
      </IonContent>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={1800}
        position="bottom"
        color={toastColor}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

/* ── Reusable field wrapper ── */
const AbField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  half?: boolean;
  children: React.ReactNode;
}> = ({ label, required, error, half, children }) => (
  <div className={`ab-field ${half ? 'half' : ''}`}>
    <label className="ab-label">
      {label}
      {required && <span className="ab-required">*</span>}
    </label>
    <div className={`ab-input-wrap ${error ? 'has-error' : ''}`}>
      {children}
    </div>
    {error && (
      <div className="ab-field-error">
        <IonIcon icon={warningOutline} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default AddressBookPage;