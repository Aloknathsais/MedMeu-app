import React, { useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  phonePortraitOutline, laptopOutline, tabletPortraitOutline,
  locationOutline, timeOutline, trashOutline, logOutOutline,
  warningOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import './PrivacySecurity.css';

interface Session {
  id: string;
  device: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location: string;
  ip: string;
  time: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1', device: 'Samsung Galaxy S22 · Android 13',
    deviceType: 'mobile', location: 'Bhubaneswar, Odisha, IN',
    ip: '192.168.29.84', time: 'Active now', isCurrent: true,
  },
  {
    id: 's2', device: 'Chrome on Windows 11',
    deviceType: 'desktop', location: 'Bhubaneswar, Odisha, IN',
    ip: '103.45.67.89', time: '2 hours ago', isCurrent: false,
  },
  {
    id: 's3', device: 'Safari on iPad Pro',
    deviceType: 'tablet', location: 'Cuttack, Odisha, IN',
    ip: '117.20.34.56', time: 'Yesterday, 6:30 PM', isCurrent: false,
  },
  {
    id: 's4', device: 'Firefox on MacOS',
    deviceType: 'desktop', location: 'Bhubaneswar, Odisha, IN',
    ip: '122.55.43.21', time: '3 days ago', isCurrent: false,
  },
];

const deviceIcon: Record<Session['deviceType'], any> = {
  mobile:  phonePortraitOutline,
  desktop: laptopOutline,
  tablet:  tabletPortraitOutline,
};

const ActiveSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [showLogoutAll, setShowLogoutAll] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const revokeSession = (id: string) => {
    setSessions(p => p.filter(s => s.id !== id));
    setRevokeId(null);
    setToastMsg('Session revoked successfully');
    setShowToast(true);
  };

  const revokeAll = () => {
    setSessions(p => p.filter(s => s.isCurrent));
    setShowLogoutAll(false);
    setToastMsg('All other sessions have been logged out');
    setShowToast(true);
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/privacy" /></IonButtons>
          <IonTitle>Active Sessions</IonTitle>
          {otherSessions.length > 0 && (
            <IonButtons slot="end">
              <button className="as-logout-all-btn" onClick={() => setShowLogoutAll(true)}>
                Logout All
              </button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* Info note */}
        <div className="as-info-note">
          <IonIcon icon={warningOutline} />
          <p>If you see an unrecognised session, revoke it immediately and change your password.</p>
        </div>

        {/* Current session */}
        <div className="ps-section">
          <p className="ps-section-title">Current Session</p>
          {sessions.filter(s => s.isCurrent).map(session => (
            <div key={session.id} className="as-card current">
              <div className="as-card-top">
                <div className="as-device-icon current-icon">
                  <IonIcon icon={deviceIcon[session.deviceType]} />
                </div>
                <div className="as-device-info">
                  <p className="as-device-name">{session.device}</p>
                  <div className="as-current-badge">
                    <IonIcon icon={checkmarkCircleOutline} />
                    This device
                  </div>
                </div>
              </div>
              <div className="as-meta-row">
                <IonIcon icon={locationOutline} />
                <span>{session.location}</span>
              </div>
              <div className="as-meta-row">
                <IonIcon icon={timeOutline} />
                <span>{session.time} · IP {session.ip}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Other sessions */}
        <div className="ps-section">
          <p className="ps-section-title">
            Other Sessions
            {otherSessions.length > 0 && (
              <span className="as-other-count">{otherSessions.length}</span>
            )}
          </p>

          {otherSessions.length === 0 ? (
            <div className="as-no-other">
              <IonIcon icon={checkmarkCircleOutline} />
              <span>No other active sessions</span>
            </div>
          ) : (
            <div className="as-other-list">
              {otherSessions.map(session => {
                const isRevoking = revokeId === session.id;
                return (
                  <div key={session.id} className="as-card">
                    <div className="as-card-top">
                      <div className="as-device-icon">
                        <IonIcon icon={deviceIcon[session.deviceType]} />
                      </div>
                      <div className="as-device-info">
                        <p className="as-device-name">{session.device}</p>
                        <p className="as-device-time">{session.time}</p>
                      </div>
                      {!isRevoking && (
                        <button className="as-revoke-btn"
                          onClick={() => setRevokeId(session.id)}>
                          <IonIcon icon={logOutOutline} />
                          Logout
                        </button>
                      )}
                    </div>
                    <div className="as-meta-row">
                      <IonIcon icon={locationOutline} />
                      <span>{session.location}</span>
                    </div>
                    <div className="as-meta-row">
                      <IonIcon icon={timeOutline} />
                      <span>IP {session.ip}</span>
                    </div>
                    {isRevoking && (
                      <div className="as-revoke-confirm">
                        <div className="as-revoke-confirm-left">
                          <IonIcon icon={warningOutline} />
                          <span>Logout this session?</span>
                        </div>
                        <div className="as-revoke-btns">
                          <button className="as-revoke-cancel"
                            onClick={() => setRevokeId(null)}>Cancel</button>
                          <button className="as-revoke-do"
                            onClick={() => revokeSession(session.id)}>Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 32 }} />
      </IonContent>

      {/* Logout all confirm sheet */}
      {showLogoutAll && (
        <div className="ps-sheet-overlay" onClick={() => setShowLogoutAll(false)}>
          <div className="ps-sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="ps-sheet-handle" />
            <div className="ps-delete-icon" style={{ background: '#FFF3E0' }}>
              <IonIcon icon={logOutOutline} style={{ color: '#f4621d' }} />
            </div>
            <h3 className="ps-delete-title">Logout All Other Sessions?</h3>
            <p className="ps-delete-subtitle">
              You will be logged out from all {otherSessions.length} other device{otherSessions.length > 1 ? 's' : ''}.
              Your current session will remain active.
            </p>
            <div className="ps-delete-actions">
              <button className="ps-delete-cancel" onClick={() => setShowLogoutAll(false)}>
                Cancel
              </button>
              <button className="ps-delete-confirm" style={{ background: '#f4621d' }}
                onClick={revokeAll}>
                Logout All
              </button>
            </div>
          </div>
        </div>
      )}

      <IonToast isOpen={showToast} message={toastMsg} duration={1500}
        position="bottom" color="success"
        onDidDismiss={() => setShowToast(false)} />
    </IonPage>
  );
};

export default ActiveSessionsPage;