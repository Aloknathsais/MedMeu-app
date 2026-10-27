import React, { useMemo, useState } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonBackButton, IonButtons, IonIcon, IonToast,
} from '@ionic/react';
import {
  searchOutline, chevronDown, callOutline, mailOutline,
  logoWhatsapp, timeOutline, helpBuoyOutline, sendOutline,
  bagHandleOutline, cardOutline, personCircleOutline,
  appsOutline, closeCircle,
} from 'ionicons/icons';
import './HelpSupport.css';

/* ── Types ── */
type FaqCategory = 'all' | 'orders' | 'delivery' | 'payments' | 'account';

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
    answer: 'Open the Orders tab and select an order to see its current status and details. Live courier tracking and delivery-stage updates are not currently available in the app.',
  },
  {
    id: 'f2', category: 'orders',
    question: 'Can I cancel an order after placing it?',
    answer: 'You can cancel an order while the Cancel Order option is available on its order details page. Orders that are no longer eligible cannot be cancelled in the app.',
  },
  {
    id: 'f3', category: 'delivery',
    question: 'How are delivery charges calculated?',
    answer: 'Delivery charges are calculated based on the total weight of the items in your cart. The applicable charge is shown at checkout before you place your order; the app does not currently offer a free-delivery threshold.',
  },
  {
    id: 'f11', category: 'delivery',
    question: 'Is there a minimum order value?',
    answer: 'The current minimum order value is ₹2,000. Your cart will show how much more is needed before you can place the order.',
  },
  {
    id: 'f4', category: 'payments',
    question: 'What payment methods are accepted?',
    answer: 'Cash on Delivery is currently the only payment method enabled in the app. UPI/net banking and credit/debit card payments are not available yet.',
  },
  {
    id: 'f5', category: 'payments',
    question: 'I have a payment or refund question. What should I do?',
    answer: 'The app currently supports Cash on Delivery only, so it does not process online payments or automatic online-payment refunds. If you see a payment deduction related to an order, contact support with your order number and payment reference. Never share your password, PIN, or OTP.',
  },
  {
    id: 'f6', category: 'account',
    question: 'How do I update my delivery address?',
    answer: 'Go to Profile > Address Book to add, edit, or remove delivery addresses at any time.',
  },
  {
    id: 'f7', category: 'account',
    question: 'How do I delete my account?',
    answer: 'Account deletion is not currently available in the app. Contact support to request help with your account.',
  },
  {
    id: 'f8', category: 'account',
    question: 'Can I upload a prescription in the app?',
    answer: 'Prescription upload and verification are not currently available in the app. Contact support if you need help with a product that requires a prescription.',
  },
  {
    id: 'f10', category: 'orders',
    question: 'What if an item in my order is missing or damaged?',
    answer: 'Contact support as soon as possible and include your order number and details of the issue. The app does not currently provide a dedicated missing- or damaged-item report form.',
  },
];

const CATEGORY_TABS: { key: FaqCategory; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: appsOutline },
  { key: 'orders', label: 'Orders', icon: bagHandleOutline },
  { key: 'delivery', label: 'Delivery', icon: bagHandleOutline },
  { key: 'payments', label: 'Payments', icon: cardOutline },
  { key: 'account', label: 'Account', icon: personCircleOutline },
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
        {/* <div className="hs-ticket-section">
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
        </div> */}

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