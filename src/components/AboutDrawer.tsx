import React from 'react';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuToggle,
} from '@ionic/react';
import {
  closeOutline, checkmarkCircle, starSharp,
  callOutline, mailOutline, logoWhatsapp, documentTextOutline,
} from 'ionicons/icons';
import './AboutDrawer.css';

// Change the brand spelling here once and it updates everywhere in this drawer.
const BRAND = 'Medmeu';
const APP_VERSION = '1.0.0'; // keep in sync with the Profile page

// TODO: replace with your real details
const CONTACT = {
  phone: '+919876543210',
  phoneLabel: '+91 98765 43210',
  email: 'support@medmeu.com',
  whatsapp: 'https://wa.me/919876543210',
  privacyUrl: 'https://medmeu.com/privacy-policy',
};

const ecosystem = [
  'Home diagnostic devices',
  'Mobility aids',
  'Chronic care supplies',
  'Mother & baby essentials',
  'Orthopedic supports',
  'Adult diapers & hygiene care',
  'First-aid & daily medical consumables',
];

const whyChoose = [
  '100% Genuine Products from verified healthcare brands',
  'Pan-India Delivery with fast dispatch',
  'Bulk Order Support for clinics, hospitals & distributors',
  'Affordable Pricing directly from manufacturers',
  'Wide Brand Network – Omron, Romsons, Tynor, Dr. Morepen & more',
  'Secure Payments & Easy Returns',
  'Dedicated Customer Support for B2B & B2C buyers',
];

const AboutDrawer: React.FC = () => {
  return (
    <IonMenu
      menuId="about-menu"
      contentId="main-content"
      side="start"
      className="about-menu"
      swipeGesture={false}
    >
      <IonHeader>
        <IonToolbar className="about-toolbar">
          <div className="about-header-row">
            <IonTitle className="about-title">About Us</IonTitle>
            <IonButtons slot="end">
              <IonMenuToggle menu="about-menu">
                <IonIcon icon={closeOutline} className="about-close-icon" />
              </IonMenuToggle>
            </IonButtons>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="about-content">
        <div className="about-section">
          <p className="about-intro">
            {BRAND} is India's trusted online medical & lab equipment marketplace and a leading
            healthcare supply platform offering home healthcare equipment in India to patients,
            caregivers, clinics, and hospitals. We bring together the most trusted brands in
            healthcare to serve every need.
          </p>
        </div>

        {/* Product ecosystem */}
        <div className="about-section">
          <h3 className="about-heading">Our Product Ecosystem</h3>
          <ul className="about-list">
            {ecosystem.map(item => (
              <li key={item}>
                <IonIcon icon={checkmarkCircle} className="list-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about-section">
          <p className="about-body">
            With nationwide delivery, competitive pricing, verified sellers, and dedicated
            customer support, {BRAND} ensures a seamless and trustworthy experience for all your
            healthcare supply needs.
          </p>
        </div>

        {/* Why choose */}
        <div className="about-section">
          <h3 className="about-heading">Why Choose {BRAND}?</h3>
          <ul className="about-list">
            {whyChoose.map(item => (
              <li key={item}>
                <IonIcon icon={starSharp} className="list-icon star" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="about-section">
          <h3 className="about-heading">Contact Us</h3>
          <ul className="about-list">
            <li>
              <IonIcon icon={callOutline} className="list-icon" />
              <a className="about-link" href={`tel:${CONTACT.phone}`}>{CONTACT.phoneLabel}</a>
            </li>
            <li>
              <IonIcon icon={mailOutline} className="list-icon" />
              <a className="about-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <IonIcon icon={logoWhatsapp} className="list-icon whatsapp" />
              <a className="about-link" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </li>
            <li>
              <IonIcon icon={documentTextOutline} className="list-icon" />
              <a className="about-link" href={CONTACT.privacyUrl} target="_blank" rel="https://medmeu.com/privacy-policy/">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        <p className="about-version">{BRAND} v{APP_VERSION}</p>

        <div style={{ height: 32 }} />
      </IonContent>
    </IonMenu>
  );
};

export default AboutDrawer;