import React, { useState } from 'react';
import {
  IonPage, IonContent, IonSpinner, IonIcon, IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  personOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, documentTextOutline,
} from 'ionicons/icons';
import { useApp } from '../../context/AppContext';
import './Auth.css';
import Logo from '../../assets/logo.png';

const RegisterPage: React.FC = () => {
  const history = useHistory();
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
    await new Promise(r => setTimeout(r, 1000));
    dispatch({ type: 'SET_AUTH', payload: true });
    dispatch({ type: 'SET_USER', payload: { id: '1', name: form.username, email: form.email, phone: '' } });
    localStorage.setItem('medmeu_token', 'demo_token');
    history.replace('/tabs/home');
    setLoading(false);
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

          {/* Username */}
          <div className="input-group">
            <label className="input-label">Username <span className="required">*</span></label>
            <div className="input-wrap">
              <IonIcon icon={personOutline} className="input-icon" />
              <input
                className="auth-field"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={update('username')}
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="input-label">Email Address <span className="required">*</span></label>
            <div className="input-wrap">
              <IonIcon icon={mailOutline} className="input-icon" />
              <input
                className="auth-field"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={update('email')}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password <span className="required">*</span></label>
            <div className="input-wrap">
              <IonIcon icon={lockClosedOutline} className="input-icon" />
              <input
                className="auth-field"
                type={showPass ? 'text' : 'password'}
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
            <label className="input-label">
              Drug License / Clinical Establishment No. / GST No.
              <span className="optional"> (optional)</span>
            </label>
            <div className="input-wrap">
              <IonIcon icon={documentTextOutline} className="input-icon" />
              <input
                className="auth-field"
                type="text"
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
          <button className="btn-primary" onClick={handleRegister} disabled={loading}>
            {loading ? <IonSpinner name="crescent" style={{ color: 'white', width: 22, height: 22 }} /> : 'Create Account'}
          </button>

          {/* Privacy Policy */}
          <p className="privacy-text">
            Your personal data will be used to support your experience throughout this application, to manage
            access to your account, and for other purposes described in our{' '}
            <span className="privacy-link" onClick={() => window.open('https://medmeu.com/my-account/', '_blank')}>
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
