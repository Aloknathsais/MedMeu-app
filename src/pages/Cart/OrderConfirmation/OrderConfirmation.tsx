import React, { useEffect, useState } from "react";
import { IonIcon } from "@ionic/react";
import { checkmark, receiptOutline, timeOutline } from "ionicons/icons";
import './OrderConfirmation.css';

interface OrderConfirmationProps {
  /** Controls mount/visibility of the overlay */
  isOpen: boolean;
  /** Final amount charged for the order */
  amount: number;
  /** Order reference shown to the user */
  orderId: string;
  /** Estimated delivery window, e.g. "35-40 mins" */
  etaLabel?: string;
  /** Total time (ms) the screen stays up before onFinish fires */
  duration?: number;
  /** Called once the auto-redirect timer completes */
  onFinish: () => void;
}

/**
 * Full-screen "order placed" confirmation that appears briefly after
 * checkout, then automatically hands off to onFinish (e.g. navigating
 * to the Orders tab). Self-contained: owns its own timers + styles.
 */
const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  amount,
  orderId,
  etaLabel = "30-40 mins",
  duration = 2600,
  onFinish,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    // mount then flip to visible on next frame so CSS transitions run
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      // let the exit transition play before unmounting via parent state
      setTimeout(onFinish, 260);
    }, duration);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`oc-overlay ${visible ? "oc-visible" : ""}`}>
      <div className="oc-card">
        <div className="oc-check-wrap">
          <svg viewBox="0 0 120 120" className="oc-check-svg">
            <circle
              className="oc-check-ring"
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="6"
            />
            <circle className="oc-check-disc" cx="60" cy="60" r="44" />
            <path
              className="oc-check-mark"
              d="M40 61 L54 75 L82 45"
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="oc-title">Order Placed!</h2>
        <p className="oc-subtitle">
          Your medicines are on their way. We'll keep you posted.
        </p>

        <div className="oc-summary">
          <div className="oc-summary-row">
            <span className="oc-summary-label">
              <IonIcon icon={receiptOutline} /> Order ID
            </span>
            <span className="oc-summary-value">{orderId}</span>
          </div>
          <div className="oc-summary-divider" />
          <div className="oc-summary-row">
            <span className="oc-summary-label">
              <IonIcon icon={checkmark} /> Amount Paid
            </span>
            <span className="oc-summary-value">
              ₹{amount.toLocaleString()}
            </span>
          </div>
          <div className="oc-summary-divider" />
          <div className="oc-summary-row">
            <span className="oc-summary-label">
              <IonIcon icon={timeOutline} /> Arriving in
            </span>
            <span className="oc-summary-value">{etaLabel}</span>
          </div>
        </div>

        <div className="oc-progress-track">
          <div
            className="oc-progress-fill"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
        <p className="oc-redirect-note">Taking you to your orders…</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;