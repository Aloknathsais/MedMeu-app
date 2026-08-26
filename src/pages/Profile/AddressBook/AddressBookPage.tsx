import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  addOutline, homeOutline, businessOutline, locationSharp,
  pencilOutline, trashBinOutline, checkmarkCircle,
  locationOutline, closeOutline, warningOutline,
} from 'ionicons/icons';
import './AddressBook.css';

/* ── Types ── */
export interface Address {
  id: string;
  name: string;
  tag: 'Home' | 'Office' | 'Other';
  line1: string;
  line2: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

const tagIcon: Record<string, any> = {
  Home:   homeOutline,
  Office: businessOutline,
  Other:  locationSharp,
};

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr1', name: 'John Doe', tag: 'Home',
    line1: '123, MG Road', line2: 'Bhubaneswar, Odisha',
    pincode: '751001', phone: '+91 98765 43210', isDefault: true,
  },
  {
    id: 'addr2', name: 'John Doe', tag: 'Office',
    line1: '45, Janpath Tower, 3rd Floor', line2: 'Saheed Nagar, Bhubaneswar, Odisha',
    pincode: '751007', phone: '+91 98765 43210', isDefault: false,
  },
  {
    id: 'addr3', name: 'John Doe', tag: 'Other',
    line1: '8, New Colony, Near AIIMS', line2: 'Patrapada, Bhubaneswar, Odisha',
    pincode: '751019', phone: '+91 98765 43210', isDefault: false,
  },
];

type ViewMode = 'list' | 'add' | 'edit';

const emptyForm = (): Omit<Address, 'id' | 'isDefault'> => ({
  name: '', tag: 'Home', line1: '', line2: '', pincode: '', phone: '',
});

const AddressBookPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const update = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(p => ({ ...p, [field]: e.target.value }));
      setErrors(p => ({ ...p, [field]: '' }));
    };

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.line1.trim())   e.line1   = 'Address line 1 is required';
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
      name: addr.name, tag: addr.tag, line1: addr.line1,
      line2: addr.line2, pincode: addr.pincode, phone: addr.phone,
    });
    setErrors({});
    setEditingId(addr.id);
    setViewMode('edit');
  };

  const handleSave = () => {
    if (!validate()) return;
    if (viewMode === 'add') {
      const newAddr: Address = {
        id: `addr${Date.now()}`,
        ...form,
        tag: form.tag as Address['tag'],
        isDefault: addresses.length === 0,
      };
      setAddresses(p => [...p, newAddr]);
      setToastMsg('Address added successfully!');
    } else {
      setAddresses(p =>
        p.map(a => a.id === editingId
          ? { ...a, ...form, tag: form.tag as Address['tag'] }
          : a
        )
      );
      setToastMsg('Address updated successfully!');
    }
    setToastColor('success');
    setShowToast(true);
    setViewMode('list');
  };

  const handleDelete = (id: string) => {
    const wasDefault = addresses.find(a => a.id === id)?.isDefault;
    const remaining = addresses.filter(a => a.id !== id);
    if (wasDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }
    setAddresses(remaining);
    setDeleteConfirmId(null);
    setToastMsg('Address removed.');
    setToastColor('danger');
    setShowToast(true);
  };

  const setDefault = (id: string) => {
    setAddresses(p => p.map(a => ({ ...a, isDefault: a.id === id })));
    setToastMsg('Default address updated!');
    setToastColor('success');
    setShowToast(true);
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
          {viewMode === 'list' && (
            <IonButtons slot="end">
              <button className="ab-add-header-btn" onClick={openAdd}>
                <IonIcon icon={addOutline} />
                Add
              </button>
            </IonButtons>
          )}
          {isFormMode && (
            <IonButtons slot="end">
              <button className="ab-save-header-btn" onClick={handleSave}>Save</button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ════════ LIST VIEW ════════ */}
        {viewMode === 'list' && (
          <>
            {addresses.length === 0 ? (
              /* Empty state */
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
                      {/* Default badge */}
                      {addr.isDefault && (
                        <div className="ab-default-badge">
                          <IonIcon icon={checkmarkCircle} /> Default
                        </div>
                      )}

                      {/* Address content */}
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
                        <p className="ab-card-line">
                          {addr.pincode}
                        </p>
                        <p className="ab-card-phone">{addr.phone}</p>
                      </div>

                      {/* Action row OR delete confirm */}
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
                              onClick={() => setDeleteConfirmId(null)}>
                              Cancel
                            </button>
                            <button className="ab-del-confirm"
                              onClick={() => handleDelete(addr.id)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add more button */}
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

            {/* Address type selector */}
            <div className="ab-form-section">
              <p className="ab-form-section-title">Address Type</p>
              <div className="ab-tag-selector">
                {(['Home', 'Office', 'Other'] as Address['tag'][]).map(tag => (
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

            {/* Contact details */}
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

            {/* Address details */}
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
                <AbField label="Pincode" required error={errors.pincode} half>
                  <input
                    className="ab-input"
                    type="number"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    maxLength={6}
                    onChange={update('pincode')}
                  />
                </AbField>
                <AbField label="City" half>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="City"
                    value={form.line2.split(',').pop()?.trim() ?? ''}
                    onChange={() => {}}
                  />
                </AbField>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="ab-form-actions">
              <button className="ab-btn-solid" onClick={handleSave}>
                {viewMode === 'add' ? 'Save Address' : 'Update Address'}
              </button>
              <button className="ab-btn-outline" onClick={() => setViewMode('list')}>
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
        duration={1600}
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