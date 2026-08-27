import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  shieldCheckmarkOutline, lockClosedOutline, eyeOutline,
  fingerPrintOutline, phonePortraitOutline, trashOutline,
  chevronForwardOutline, logOutOutline, documentTextOutline,
  alertCircleOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './PrivacySecurity.css';

const PrivacySecurityPage: React.FC = () => {
  const history = useHistory();
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggle = (
    val: boolean,
    setter: (v: boolean) => void,
    msg: string,
  ) => {
    setter(!val);
    setToastMsg(msg);
    setShowToast(true);
  };

  const sections = [
    {
      title: 'Account Security',
      items: [
        {
          type: 'nav',
          icon: lockClosedOutline,
          iconBg: '#EEF5FB',
          iconColor: 'var(--medmeu-blue)',
          label: 'Change Password',
          sub: 'Update your account password',
          action: () => history.push('/privacy/change-password'),
        },
        {
          type: 'toggle',
          icon: phonePortraitOutline,
          iconBg: '#E8F5E9',
          iconColor: '#2E7D32',
          label: 'Two-Factor Authentication',
          sub: twoFactor ? 'Extra security is ON' : 'Add extra layer of security',
          value: twoFactor,
          action: () => toggle(twoFactor, setTwoFactor,
            twoFactor ? '2FA disabled' : '2FA enabled — your account is more secure'),
        },
        {
          type: 'toggle',
          icon: fingerPrintOutline,
          iconBg: '#F3E5F5',
          iconColor: '#7B1FA2',
          label: 'Biometric Login',
          sub: biometric ? 'Fingerprint/Face ID is ON' : 'Login with fingerprint or Face ID',
          value: biometric,
          action: () => toggle(biometric, setBiometric,
            biometric ? 'Biometric login disabled' : 'Biometric login enabled'),
        },
        {
          type: 'toggle',
          icon: alertCircleOutline,
          iconBg: '#FFF3E0',
          iconColor: '#f4621d',
          label: 'Login Alerts',
          sub: loginAlerts ? 'Get notified of new logins' : 'Login notifications are OFF',
          value: loginAlerts,
          action: () => toggle(loginAlerts, setLoginAlerts,
            loginAlerts ? 'Login alerts disabled' : 'You will be notified of new logins'),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          type: 'toggle',
          icon: eyeOutline,
          iconBg: '#EEF5FB',
          iconColor: 'var(--medmeu-blue)',
          label: 'Personalised Experience',
          sub: dataSharing ? 'Data used for personalisation' : 'Turn off data personalisation',
          value: dataSharing,
          action: () => toggle(dataSharing, setDataSharing,
            dataSharing ? 'Personalisation disabled' : 'Personalisation enabled'),
        },
        {
          type: 'nav',
          icon: documentTextOutline,
          iconBg: '#ECEFF1',
          iconColor: '#607D8B',
          label: 'Privacy Policy',
          sub: 'Read our privacy policy',
          action: () => window.open('https://medmeu.com/privacy-policy', '_blank'),
        },
        {
          type: 'nav',
          icon: documentTextOutline,
          iconBg: '#ECEFF1',
          iconColor: '#607D8B',
          label: 'Terms of Service',
          sub: 'Read our terms & conditions',
          action: () => window.open('https://medmeu.com/terms', '_blank'),
        },
      ],
    },
    {
      title: 'Sessions',
      items: [
        {
          type: 'nav',
          icon: logOutOutline,
          iconBg: '#FFF3E0',
          iconColor: '#f4621d',
          label: 'Active Sessions',
          sub: 'Manage where you are logged in',
          action: () => history.push('/privacy/sessions'),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          type: 'danger',
          icon: trashOutline,
          iconBg: '#FFEBEE',
          iconColor: '#C62828',
          label: 'Delete Account',
          sub: 'Permanently delete your account and data',
          action: () => setShowDeleteConfirm(true),
        },
      ],
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>Privacy & Security</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* Hero */}
        <div className="ps-hero">
          <div className="ps-hero-icon">
            <IonIcon icon={shieldCheckmarkOutline} />
          </div>
          <div>
            <p className="ps-hero-label">Account Protection</p>
            <p className="ps-hero-status">
              {twoFactor && biometric ? 'Fully secured' : twoFactor ? 'Good — enable biometrics for more security' : 'Enable 2FA to strengthen security'}
            </p>
          </div>
          <div className={`ps-hero-badge ${twoFactor ? 'good' : 'warn'}`}>
            <IonIcon icon={twoFactor ? checkmarkCircleOutline : alertCircleOutline} />
            {twoFactor ? 'Secured' : 'Review'}
          </div>
        </div>

        {/* Sections */}
        {sections.map(section => (
          <div key={section.title} className="ps-section">
            <p className="ps-section-title">{section.title}</p>
            <div className="ps-card">
              {section.items.map((item, i) => (
                <div
                  key={item.label}
                  className={`ps-row ${i < section.items.length - 1 ? 'bordered' : ''} ${item.type === 'danger' ? 'danger-row' : ''}`}
                  onClick={item.action}
                >
                  <div className="ps-row-icon" style={{ background: item.iconBg }}>
                    <IonIcon icon={item.icon} style={{ color: item.iconColor }} />
                  </div>
                  <div className="ps-row-text">
                    <p className={`ps-row-label ${item.type === 'danger' ? 'danger-label' : ''}`}>
                      {item.label}
                    </p>
                    <p className="ps-row-sub">{item.sub}</p>
                  </div>
                  {item.type === 'toggle' ? (
                    <PsToggle enabled={(item as any).value} onToggle={item.action} />
                  ) : (
                    <IonIcon
                      icon={chevronForwardOutline}
                      className={`ps-chevron ${item.type === 'danger' ? 'danger-chevron' : ''}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ height: 32 }} />
      </IonContent>

      {/* Delete account confirm sheet */}
      {showDeleteConfirm && (
        <div className="ps-sheet-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="ps-sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="ps-sheet-handle" />
            <div className="ps-delete-icon">
              <IonIcon icon={trashOutline} />
            </div>
            <h3 className="ps-delete-title">Delete Account?</h3>
            <p className="ps-delete-subtitle">
              This will permanently delete your account, all orders, addresses, and data.
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="ps-delete-actions">
              <button className="ps-delete-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Keep Account
              </button>
              <button className="ps-delete-confirm">
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      <IonToast isOpen={showToast} message={toastMsg} duration={1400}
        position="bottom" color="success"
        onDidDismiss={() => setShowToast(false)} />
    </IonPage>
  );
};

const PsToggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <button className={`ps-toggle ${enabled ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); onToggle(); }}>
    <span className="ps-toggle-thumb" />
  </button>
);

export default PrivacySecurityPage;