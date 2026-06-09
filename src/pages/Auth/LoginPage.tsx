import React, { useState } from 'react';
import {
  IonPage, IonContent, IonButton, IonInput, IonItem,
  IonText, IonSpinner, IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { eyeOutline, eyeOffOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { useApp } from '../../context/AppContext';
import './Auth.css';
import Logo from '../../assets/logo.png';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 1000));
      dispatch({ type: 'SET_AUTH', payload: true });
      dispatch({ type: 'SET_USER', payload: { id: '1', name: username, email: username, phone: '' } });
      localStorage.setItem('medmeu_token', 'demo_token');
      history.replace('/tabs/home');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    // TODO: Integrate Google OAuth
    await new Promise(r => setTimeout(r, 1200));
    setGoogleLoading(false);
    // dispatch({ type: 'SET_AUTH', payload: true });
    setError('Google login coming soon.');
  };

  return (
    <IonPage>
      <IonContent className="auth-content" fullscreen>
        {/* Top gradient area with logo */}
        <div className="auth-top">
          <div className="auth-logo">
            <img src={Logo} alt='logo'/>
          </div>
        </div>

        {/* White card */}
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue</p>

          {/* Username / Email */}
          <div className="input-group">
            <label className="input-label">Username or Email Address</label>
            <div className="input-wrap">
              <IonIcon icon={personOutline} className="input-icon" />
              <input
                className="auth-field"
                type="text"
                placeholder="Enter username or email"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrap">
              <IonIcon icon={lockClosedOutline} className="input-icon" />
              <input
                className="auth-field"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <IonIcon
                icon={showPass ? eyeOffOutline : eyeOutline}
                className="input-icon-right"
                onClick={() => setShowPass(!showPass)}
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-link" onClick={() => {}}>
            Forgot Password?
          </div>

          {/* Error */}
          {error && (
            <IonText color="danger">
              <p className="error-text">⚠️ {error}</p>
            </IonText>
          )}

          {/* Login Button */}
          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? <IonSpinner name="crescent" style={{ color: 'white', width: 22, height: 22 }} /> : 'Login'}
          </button>

          {/* Divider */}
          <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

          {/* Google Login */}
          <button className="btn-google" onClick={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? (
              <IonSpinner name="crescent" style={{ width: 20, height: 20 }} />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Register link */}
          <div className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => history.push('/register')}>Register Now</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default LoginPage;
