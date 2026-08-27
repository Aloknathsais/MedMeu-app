import React, { useMemo, useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  searchOutline, chevronDown, callOutline, mailOutline,
  logoWhatsapp, timeOutline, helpBuoyOutline, sendOutline,
  bagHandleOutline, cardOutline, personCircleOutline,
  medkitOutline, appsOutline, closeCircle,
} from 'ionicons/icons';
import './HelpSupport.css';

/* ── Types ── */
type FaqCategory = 'all' | 'orders' | 'payments' | 'account' | 'prescriptions';

interface Faq {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  question: string;
  answer: string;
}

/* ── FAQ data ── */
const FAQS: Faq[] = [
  {
    id: 'f1', category: 'orders',
    question: 'How do I track my order?',
    answer: 'Go to Profile > Orders (or the Orders tab) and open the order you want to track. You\u2019ll see live status updates from confirmation to delivery.',
  },
  {
    id: 'f2', category: 'orders',
    question: 'Can I cancel an order after placing it?',
    answer: 'Yes, orders can be cancelled free of charge as long as they haven\u2019t been shipped yet. Open the order details and tap "Cancel Order".',
  },
  {
    id: 'f3', category: 'orders',
    question: 'What are the delivery charges?',
    answer: 'Delivery is free on orders above \u20b9499. Below that, a flat \u20b939 delivery fee applies, shown at checkout before you pay.',
  },
  {
    id: 'f4', category: 'payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI, all major debit/credit cards, net banking, and Cash on Delivery for eligible orders.',
  },
  {
    id: 'f5', category: 'payments',
    question: 'My payment failed but money was deducted. What now?',
    answer: 'Failed payments are auto-refunded to your original payment method within 5-7 business days. If it takes longer, reach out via the options below.',
  },
  {
    id: 'f6', category: 'account',
    question: 'How do I update my delivery address?',
    answer: 'Go to Profile > Address Book to add, edit, or remove delivery addresses at any time.',
  },
  {
    id: 'f7', category: 'account',
    question: 'How do I delete my account?',
    answer: 'Go to Profile > Privacy & Security > Delete Account. This permanently removes your data and can\u2019t be undone.',
  },
  {
    id: 'f8', category: 'prescriptions',
    question: 'How do I order prescription medicines?',
    answer: 'Search for the medicine, add it to cart, and upload a clear photo of your prescription at checkout. Our pharmacist verifies it before dispatch.',
  },
  {
    id: 'f9', category: 'prescriptions',
    question: 'Is my prescription data kept private?',
    answer: 'Yes. Prescriptions are encrypted, viewed only by our licensed pharmacists for verification, and never shared with third parties.',
  },
  {
    id: 'f10', category: 'orders',
    question: 'What if an item in my order is missing or damaged?',
    answer: 'Report it within 48 hours of delivery from the order details page. We\u2019ll arrange a free replacement or refund, whichever you prefer.',
  },
];

const CATEGORY_TABS: { key: FaqCategory; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: appsOutline },
  { key: 'orders', label: 'Orders', icon: bagHandleOutline },
  { key: 'payments', label: 'Payments', icon: cardOutline },
  { key: 'account', label: 'Account', icon: personCircleOutline },
  { key: 'prescriptions', label: 'Prescriptions', icon: medkitOutline },
];

const HelpSupportPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  /* ── Filtering ── */
  const visibleFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter(f => {
      const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
      const matchesSearch = !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  /* ── Quick contact actions ── */
  const callSupport = () => { window.location.href = 'tel:+911234567890'; };
  const emailSupport = () => { window.location.href = 'mailto:support@medmeu.com?subject=Help%20with%20my%20order'; };
  const whatsappSupport = () => { window.open('https://wa.me/911234567890', '_blank'); };

  /* ── Ticket submission ── */
  const canSubmit = subject.trim().length > 2 && message.trim().length > 5;

  const submitTicket = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700)); // simulated network call
    setSubmitting(false);
    setShowTicketForm(false);
    setSubject('');
    setMessage('');
    setToastMsg('Your query has been submitted. We\u2019ll get back within 24 hours.');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/tabs/profile" /></IonButtons>
          <IonTitle>Help & Support</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        {/* ── Search ── */}
        <div className="hs-search-wrap">
          <IonIcon icon={searchOutline} className="hs-search-icon" />
          <input
            className="hs-search-input"
            placeholder="Search FAQs (e.g. refund, address)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="hs-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <IonIcon icon={closeCircle} />
            </button>
          )}
        </div>

        {/* ── Quick contact ── */}
        <div className="hs-contact-row">
          <button className="hs-contact-card" onClick={callSupport}>
            <div className="hs-contact-icon call"><IonIcon icon={callOutline} /></div>
            <span>Call Us</span>
          </button>
          <button className="hs-contact-card" onClick={whatsappSupport}>
            <div className="hs-contact-icon whatsapp"><IonIcon icon={logoWhatsapp} /></div>
            <span>WhatsApp</span>
          </button>
          <button className="hs-contact-card" onClick={emailSupport}>
            <div className="hs-contact-icon email"><IonIcon icon={mailOutline} /></div>
            <span>Email Us</span>
          </button>
        </div>
        <p className="hs-hours-note">
          <IonIcon icon={timeOutline} /> Support available Mon-Sat, 9 AM - 7 PM
        </p>

        {/* ── Category tabs ── */}
        <div className="hs-cat-tabs">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              className={`hs-cat-tab ${activeCategory === tab.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.key)}
            >
              <IonIcon icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── FAQ list ── */}
        <div className="hs-faq-section">
          <p className="hs-section-title">Frequently Asked Questions</p>

          {visibleFaqs.length === 0 ? (
            <div className="hs-faq-empty">
              <IonIcon icon={helpBuoyOutline} />
              <p>No results for "{search}". Try a different search or raise a ticket below.</p>
            </div>
          ) : (
            <div className="hs-faq-list">
              {visibleFaqs.map(faq => {
                const isOpen = expandedId === faq.id;
                return (
                  <div key={faq.id} className={`hs-faq-item ${isOpen ? 'open' : ''}`}>
                    <button className="hs-faq-question" onClick={() => toggleExpand(faq.id)}>
                      <span>{faq.question}</span>
                      <IonIcon icon={chevronDown} className="hs-faq-chevron" />
                    </button>
                    {isOpen && <p className="hs-faq-answer">{faq.answer}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Raise a ticket ── */}
        <div className="hs-ticket-section">
          {!showTicketForm ? (
            <button className="hs-raise-ticket-btn" onClick={() => setShowTicketForm(true)}>
              <IonIcon icon={helpBuoyOutline} />
              Still need help? Raise a ticket
            </button>
          ) : (
            <div className="hs-ticket-card">
              <p className="hs-section-title">Raise a Support Ticket</p>
              <input
                className="hs-ticket-input"
                placeholder="Subject (e.g. Order not delivered)"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={80}
              />
              <textarea
                className="hs-ticket-textarea"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="hs-ticket-actions">
                <button
                  className="hs-ticket-cancel"
                  onClick={() => { setShowTicketForm(false); setSubject(''); setMessage(''); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="hs-ticket-submit"
                  onClick={submitTicket}
                  disabled={!canSubmit || submitting}
                >
                  <IonIcon icon={sendOutline} />
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 32 }} />
      </IonContent>

      <IonToast
        isOpen={showToast}
        message={toastMsg}
        duration={2200}
        position="bottom"
        color="success"
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

export default HelpSupportPage;