import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  lockClosedOutline, eyeOutline, eyeOffOutline, warningOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './PrivacySecurity.css';

const ChangePasswordPage: React.FC = () => {
  const history = useHistory();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const update = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [field]: e.target.value }));
      setErrors(p => ({ ...p, [field]: '' }));
    };

  const toggleShow = (field: keyof typeof show) =>
    setShow(p => ({ ...p, [field]: !p[field] }));

  /* Password strength */
  const strength = (() => {
    const p = form.newPass;
    if (!p) return { score: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 8)        s++;
    if (/[A-Z]/.test(p))      s++;
    if (/[0-9]/.test(p))      s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { score: s, label: 'Weak',   color: '#C62828' };
    if (s === 2) return { score: s, label: 'Fair',   color: '#f4621d' };
    if (s === 3) return { score: s, label: 'Good',   color: '#2171a8' };
    return              { score: s, label: 'Strong', color: '#2E7D32' };
  })();

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.current)           e.current = 'Current password is required';
    if (!form.newPass)           e.newPass = 'New password is required';
    else if (form.newPass.length < 8) e.newPass = 'Password must be at least 8 characters';
    else if (strength.score < 2) e.newPass = 'Password is too weak';
    if (!form.confirm)           e.confirm = 'Please confirm your new password';
    else if (form.confirm !== form.newPass) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setShowToast(true);
    setTimeout(() => history.goBack(), 1500);
  };

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'current', label: 'Current Password',  placeholder: 'Enter current password' },
    { key: 'newPass', label: 'New Password',       placeholder: 'Min. 8 characters' },
    { key: 'confirm', label: 'Confirm Password',   placeholder: 'Re-enter new password' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/privacy" /></IonButtons>
          <IonTitle>Change Password</IonTitle>
          <IonButtons slot="end">
            <button className="cp-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? '...' : 'Save'}
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="cp-wrap">

          {/* Icon */}
          <div className="cp-top-icon">
            <IonIcon icon={lockClosedOutline} />
          </div>
          <p className="cp-top-hint">
            Choose a strong password with a mix of letters, numbers and symbols.
          </p>

          {/* Fields */}
          {fields.map(({ key, label, placeholder }) => (
            <div className="cp-field" key={key}>
              <label className="cp-label">{label}</label>
              <div className={`cp-input-wrap ${errors[key] ? 'has-error' : ''}`}>
                <IonIcon icon={lockClosedOutline} className="cp-input-icon" />
                <input
                  className="cp-input"
                  type={show[key] ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={update(key)}
                />
                <IonIcon
                  icon={show[key] ? eyeOffOutline : eyeOutline}
                  className="cp-eye-icon"
                  onClick={() => toggleShow(key)}
                />
              </div>
              {errors[key] && (
                <div className="cp-error">
                  <IonIcon icon={warningOutline} />
                  <span>{errors[key]}</span>
                </div>
              )}

              {/* Strength bar — only on new password */}
              {key === 'newPass' && form.newPass && (
                <div className="cp-strength">
                  <div className="cp-strength-bars">
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className="cp-strength-bar"
                        style={{ background: n <= strength.score ? strength.color : '#eee' }}
                      />
                    ))}
                  </div>
                  <span className="cp-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Match indicator on confirm */}
              {key === 'confirm' && form.confirm && (
                <div className={`cp-match ${form.confirm === form.newPass ? 'ok' : 'no'}`}>
                  <IonIcon icon={form.confirm === form.newPass ? checkmarkCircleOutline : warningOutline} />
                  <span>{form.confirm === form.newPass ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>
          ))}

          {/* Tips */}
          <div className="cp-tips">
            <p className="cp-tips-title">Password Tips</p>
            {[
              'At least 8 characters long',
              'Include uppercase and lowercase letters',
              'Add numbers (0–9)',
              'Use special characters (!, @, #, $)',
            ].map(tip => (
              <div key={tip} className="cp-tip-row">
                <span className="cp-tip-dot">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button className="cp-save-main-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
        <div style={{ height: 32 }} />
      </IonContent>

      <IonToast isOpen={showToast} message="Password updated successfully!"
        duration={1400} position="bottom" color="success"
        onDidDismiss={() => setShowToast(false)} />
    </IonPage>
  );
};

export default ChangePasswordPage;