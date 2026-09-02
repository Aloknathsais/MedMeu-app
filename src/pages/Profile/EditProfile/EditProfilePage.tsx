import React, { useState, useRef } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  personOutline, mailOutline, phonePortraitOutline, calendarOutline,
  maleFemaleOutline, locationOutline, cameraOutline, checkmarkOutline,
  warningOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useApp, User } from '../../../context/AppContext';
import { profileService } from '../../../services/profile.service';
import './EditProfile.css';

type Gender = 'Male' | 'Female' | 'Other' | '';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  city: string;
  state: string;
  pincode: string;
}

const EditProfilePage: React.FC = () => {
  const history = useHistory();
  const { state, dispatch } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const user: User = state.user ?? { id: 'guest', name: '', email: '', phone: '' };

  const [form, setForm] = useState<ProfileForm>({
    name:    user.name  ?? '',
    email:   user.email ?? '',
    phone:   user.phone ?? '',
    dob:     user.dob     ?? '',
    gender:  (user.gender as Gender) ?? '',
    city:    user.city    ?? '',
    state:   user.state   ?? '',
    pincode: user.pincode ?? '',
  });

  // Local preview only — see the note above the file input below for why
  // this never actually gets saved to the backend.
  const [avatar, setAvatar] = useState<string | null>(user.avatar ?? null);
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const update = (field: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(p => ({ ...p, [field]: e.target.value }));
      setErrors(p => ({ ...p, [field]: '' }));
    };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToastMsg('Image must be under 5MB');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const e: Partial<ProfileForm> = {};
    if (!form.name.trim())         e.name  = 'Name is required';
    if (!form.email.trim())        e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())        e.phone = 'Phone number is required';
    else if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit number';
    if (form.pincode && form.pincode.length !== 6) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        dob: form.dob,
        gender: form.gender || undefined,
      });
      // avatar is local-only (no upload endpoint exists on the backend yet —
      // see the note near the file input below), so it's merged in on top
      // of the real, backend-confirmed profile rather than sent anywhere.
      dispatch({ type: 'SET_USER', payload: { ...updated, avatar: avatar ?? undefined } });
      setToastMsg('Profile updated successfully!');
      setToastColor('success');
      setShowToast(true);
      setTimeout(() => history.goBack(), 1400);
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      const firstDetail = err?.response?.data?.details?.[0]?.message;
      setToastMsg(firstDetail || backendMessage || 'Failed to update profile. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>Edit Profile</IonTitle>
          <IonButtons slot="end">
            <button className="ep-save-header-btn" onClick={handleSave} disabled={saving}>
              {saving ? '...' : 'Save'}
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Avatar section ──
            No backend endpoint exists for uploading/storing a profile
            photo (WooCommerce has no native avatar field, and no file
            upload route has been built). This preview is local-only —
            it'll be lost on refresh/re-login/another device until a real
            upload endpoint is built. Kept as a preview so the UI isn't
            broken, not because it's actually persisted. */}
        <div className="ep-avatar-section">
          <div className="ep-avatar-wrap" onClick={() => fileRef.current?.click()}>
            {avatar ? (
              <img src={avatar} alt="avatar" className="ep-avatar-img" />
            ) : (
              <div className="ep-avatar-placeholder">
                {form.name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="ep-avatar-overlay">
              <IonIcon icon={cameraOutline} />
            </div>
          </div>
          <p className="ep-avatar-hint">Tap to change photo</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* ── Personal info section ── */}
        <div className="ep-section">
          <p className="ep-section-title">Personal Information</p>

          <EpField
            label="Full Name"
            required
            icon={personOutline}
            error={errors.name}
          >
            <input
              className="ep-input"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={update('name')}
            />
          </EpField>

          <EpField
            label="Email Address"
            required
            icon={mailOutline}
            error={errors.email}
          >
            <input
              className="ep-input"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={update('email')}
            />
          </EpField>

          <EpField
            label="Phone Number"
            required
            icon={phonePortraitOutline}
            error={errors.phone}
          >
            <input
              className="ep-input"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={form.phone}
              maxLength={10}
              onChange={update('phone')}
            />
          </EpField>

          <EpField
            label="Date of Birth"
            icon={calendarOutline}
          >
            <input
              className="ep-input"
              type="date"
              value={form.dob}
              onChange={update('dob')}
            />
          </EpField>

          <EpField
            label="Gender"
            icon={maleFemaleOutline}
          >
            <select
              className="ep-input ep-select"
              value={form.gender}
              onChange={update('gender')}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Prefer not to say</option>
            </select>
          </EpField>
        </div>

        {/* ── Address section ──
            city/state/pincode map to WooCommerce's billing address —
            real fields, not custom storage. */}
        <div className="ep-section">
          <p className="ep-section-title">Location</p>

          <EpField
            label="City"
            icon={locationOutline}
          >
            <input
              className="ep-input"
              type="text"
              placeholder="Enter your city"
              value={form.city}
              onChange={update('city')}
            />
          </EpField>

          <div className="ep-row">
            <EpField label="State" icon={locationOutline} half>
              <input
                className="ep-input"
                type="text"
                placeholder="State"
                value={form.state}
                onChange={update('state')}
              />
            </EpField>
            <EpField
              label="Pincode"
              icon={locationOutline}
              half
              error={errors.pincode}
            >
              <input
                className="ep-input"
                type="number"
                placeholder="6-digit"
                maxLength={6}
                value={form.pincode}
                onChange={update('pincode')}
              />
            </EpField>
          </div>
        </div>

        {/* ── Account info ── */}
        <div className="ep-section">
          <p className="ep-section-title">Account</p>
          <div className="ep-readonly-card">
            <div className="ep-readonly-row">
              <span className="ep-readonly-label">Member Since</span>
              {/* Real WooCommerce customer creation date now — was hardcoded "June 2024" before. */}
              <span className="ep-readonly-value">{user.memberSince || '—'}</span>
            </div>
            {/*
              Account Type and Verified below are still static placeholder
              copy — WooCommerce has no account-tier concept, and nothing
              tracks real email-verification status yet. Left as-is
              visually since removing them changes the design, but they
              don't reflect real backend data. Flagging rather than
              silently shipping them as if they were wired.
            */}
            <div className="ep-readonly-row">
              <span className="ep-readonly-label">Account Type</span>
              <span className="ep-readonly-value">Standard</span>
            </div>
            <div className="ep-readonly-row">
              <span className="ep-readonly-label">Verified</span>
              <span className="ep-readonly-value ep-verified">
                <IonIcon icon={checkmarkOutline} /> Email Verified
              </span>
            </div>
          </div>
        </div>

        {/* ── Save button ── */}
        <div className="ep-save-wrap">
          <button
            className="ep-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="ep-saving">Saving...</span>
            ) : (
              'Save Changes'
            )}
          </button>
          <button className="ep-cancel-btn" onClick={() => history.goBack()}>
            Cancel
          </button>
        </div>

        <div style={{ height: 32 }} />
      </IonContent>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={1400}
        position="bottom"
        color={toastColor}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

/* ── Reusable field wrapper ── */
const EpField: React.FC<{
  label: string;
  icon: any;
  required?: boolean;
  error?: string;
  half?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, required, error, half, children }) => (
  <div className={`ep-field ${half ? 'half' : ''}`}>
    <label className="ep-label">
      {label}
      {required && <span className="ep-required">*</span>}
    </label>
    <div className={`ep-input-wrap ${error ? 'has-error' : ''}`}>
      <IonIcon icon={icon} className="ep-input-icon" />
      {children}
    </div>
    {error && (
      <div className="ep-field-error">
        <IonIcon icon={warningOutline} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default EditProfilePage;