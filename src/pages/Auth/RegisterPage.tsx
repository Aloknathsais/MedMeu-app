import React, { useState } from 'react';
import {
  IonPage, IonContent, IonSpinner, IonIcon, IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import {
  personOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, documentTextOutline,
} from 'ionicons/icons';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth.service';
import './Auth.css';
import Logo from '../../assets/logo.png';

/** Pulls a displayable message out of whatever shape the backend/axios error is. */
function extractErrorMessage(err: any): string {
  const backendMessage = err?.response?.data?.message;
  const firstDetail = err?.response?.data?.details?.[0]?.message;
  return firstDetail || backendMessage || 'Registration failed. Please try again.';
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Same idea as the login page: let Android's autofill see the submit before we navigate away. */
async function letAutofillCommit() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  await delay(600);
}

const RegisterPage: React.FC = () => {
  const history = useHistory();
  const router = useIonRouter();
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    license: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      setError('Username, email and password are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true); setError('');
    try {
      const { user } = await authService.register({
        username: form.username,
        email: form.email,
        password: form.password,
        license: form.license || undefined,
      });

      await letAutofillCommit();

      dispatch({ type: 'SET_AUTH', payload: true });
      dispatch({ type: 'SET_USER', payload: user });
      router.push('/tabs/home', 'root', 'replace');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-content" fullscreen>
        {/* Top */}
        <div className="auth-top">
          <div className="auth-logo">
            <img src={Logo} alt='logo'/>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card register-card">
          <h2>Register</h2>
          <p className="auth-subtitle">Join thousands of healthcare professionals</p>

          <form
            id="register-form"
            method="post"
            action="#"
            autoComplete="on"
            onSubmit={event => {
              event.preventDefault();
              void handleRegister();
            }}
          >
            {/* Username */}
            <div className="input-group">
              <label className="input-label" htmlFor="register-username">
                Username <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <IonIcon icon={personOutline} className="input-icon" />
                <input
                  id="register-username"
                  className="auth-field"
                  type="text"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={update('username')}
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label className="input-label" htmlFor="register-email">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <IonIcon icon={mailOutline} className="input-icon" />
                <input
                  id="register-email"
                  className="auth-field"
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label" htmlFor="register-password">
                Password <span className="required">*</span>
              </label>
              <div className="input-wrap">
                <IonIcon icon={lockClosedOutline} className="input-icon" />
                <input
                  id="register-password"
                  className="auth-field"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={update('password')}
                />
                <IonIcon
                  icon={showPass ? eyeOffOutline : eyeOutline}
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                />
              </div>
            </div>

            {/* License (optional) */}
            <div className="input-group">
              <label className="input-label" htmlFor="register-license">
                Drug License / Clinical Establishment No. / GST No.
                <span className="optional"> (optional)</span>
              </label>
              <div className="input-wrap">
                <IonIcon icon={documentTextOutline} className="input-icon" />
                <input
                  id="register-license"
                  className="auth-field"
                  type="text"
                  name="license"
                  autoComplete="off"
                  placeholder="Enter license or GST number"
                  value={form.license}
                  onChange={update('license')}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <IonText color="danger">
                <p className="error-text">⚠️ {error}</p>
              </IonText>
            )}

            {/* Register Button */}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <IonSpinner name="crescent" style={{ color: 'white', width: 22, height: 22 }} /> : 'Create Account'}
            </button>
          </form>

          {/* Privacy Policy */}
          <p className="privacy-text">
            Your personal data will be used to support your experience throughout this application, to manage
            access to your account, and for other purposes described in our{' '}
            <span className="privacy-link" onClick={() => window.open('https://medmeu.com/privacy-policy/', '_blank')}>
              privacy policy
            </span>.
          </p>

          {/* Login link */}
          <div className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => history.push('/login')}>Login</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default RegisterPage;