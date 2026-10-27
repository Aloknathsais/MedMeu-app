import React from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon,
} from '@ionic/react';
import {
  shieldCheckmarkOutline, lockClosedOutline, documentTextOutline,
  openOutline,
} from 'ionicons/icons';
import './PrivacySecurity.css';

const PrivacySecurityPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
        <IonTitle>Privacy &amp; Security</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent fullscreen>
      {/* <div className="ps-hero">
        <div className="ps-hero-icon">
          <IonIcon icon={shieldCheckmarkOutline} />
        </div>
        <div>
          <p className="ps-hero-label">Security features</p>
          <p className="ps-hero-status">This screen does not verify your account security status.</p>
        </div>
      </div> */}

      <section className="ps-section">
        <h2 className="ps-section-title">Privacy</h2>
        <div className="ps-card">
          <a
            className="ps-row bordered"
            href="https://medmeu.com/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="ps-row-icon" style={{ background: '#ECEFF1' }}>
              <IonIcon icon={documentTextOutline} style={{ color: '#607D8B' }} />
            </div>
            <div className="ps-row-text">
              <p className="ps-row-label">Privacy Policy</p>
              <p className="ps-row-sub">Read how MedMeu describes its privacy practices</p>
            </div>
            <IonIcon icon={openOutline} className="ps-chevron" />
          </a>
          <a
            className="ps-row"
            href="https://medmeu.com/terms-condition/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="ps-row-icon" style={{ background: '#ECEFF1' }}>
              <IonIcon icon={documentTextOutline} style={{ color: '#607D8B' }} />
            </div>
            <div className="ps-row-text">
              <p className="ps-row-label">Terms of Service</p>
              <p className="ps-row-sub">Read the MedMeu terms of use</p>
            </div>
            <IonIcon icon={openOutline} className="ps-chevron" />
          </a>
        </div>
      </section>
      <div style={{ height: 32 }} />
    </IonContent>
  </IonPage>
);

export default PrivacySecurityPage;
