import React from 'react';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonMenuToggle,
} from '@ionic/react';
import { closeOutline, checkmarkCircle, starSharp } from 'ionicons/icons';
import './AboutDrawer.css';

const brands = [
  'Omron', 'Romsons', 'Tynor', 'Dr. Morepen', 'Beurer', 'Accu-Chek',
  'Huggies', 'Himalaya', 'Niine', 'Hicks', 'Dyna', 'Liberty', 'Care Touch', 'BIO PLUS',
];

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

const categories = [
  'Home Healthcare Devices',
  'Diagnostic & Pathology Equipment',
  'Lab Reagents & Chemicals',
  'Diabetic & Ortho Care',
  'Mother & Baby Care Products',
  'Medical Consumables & PPE',
];

const AboutDrawer: React.FC = () => {
  return (
    <IonMenu menuId="about-menu" contentId="main-content" side="start" className="about-menu">
      <IonHeader>
        <IonToolbar className="about-toolbar">
          <div className="about-header-row">
            {/* <div className="about-logo-mark">🏥</div> */}
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
            MedMEU is India's trusted online medical & lab equipment marketplace and a leading
            healthcare supply platform offering home healthcare equipment in India to patients,
            caregivers, clinics, and hospitals. We bring together the most trusted brands in
            healthcare to serve every need.
          </p>
        </div>

        {/* Brands */}
        <div className="about-section">
          <h3 className="about-heading">Our Trusted Brands</h3>
          <div className="brand-chip-grid">
            {brands.map(b => (
              <span key={b} className="brand-chip">{b}</span>
            ))}
            <span className="brand-chip brand-chip-more">& many more</span>
          </div>
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
            customer support, MedMEU ensures a seamless and trustworthy experience for all your
            healthcare supply needs.
          </p>
        </div>

        {/* Why choose */}
        <div className="about-section">
          <h3 className="about-heading">Why Choose MedMEU?</h3>
          <ul className="about-list">
            {whyChoose.map(item => (
              <li key={item}>
                <IonIcon icon={starSharp} className="list-icon star" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="about-section">
          <h3 className="about-heading">Our Product Categories</h3>
          <div className="category-numbered-list">
            {categories.map((cat, i) => (
              <div key={cat} className="numbered-item">
                <span className="numbered-badge">{i + 1}</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </IonContent>
    </IonMenu>
  );
};

export default AboutDrawer;