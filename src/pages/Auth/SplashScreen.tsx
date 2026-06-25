import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Splash.css';
import Logo from '../../assets/logo.png';

const SplashScreen: React.FC = () => {
  const history = useHistory();
  const { state } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      history.replace(state.isAuthenticated ? '/tabs/home' : '/login');
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <IonPage>
      <IonContent className="splash-content" fullscreen>
        <div className="splash-wrap">
          {/* Floating medical cross particles in background */}
          <div className="splash-bg-icons">
            <span className="float-icon icon-1">✚</span>
            <span className="float-icon icon-2">✚</span>
            <span className="float-icon icon-3">✚</span>
            <span className="float-icon icon-4">✚</span>
          </div>

          <div className="splash-logo">
            <img src={Logo} alt="Medmeu" />
          </div>

          {/* Heartbeat / pulse line — universal medical signature */}
          <div className="pulse-wrap">
            <svg viewBox="0 0 300 60" className="pulse-svg">
              <polyline
                className="pulse-line"
                points="0,30 40,30 55,10 70,50 85,30 100,30 115,15 130,45 145,30 300,30"
                fill="none"
              />
              <circle className="pulse-dot" r="4" cx="0" cy="30">
                <animateMotion
                  dur="2.4s"
                  repeatCount="indefinite"
                  path="M0,30 L40,30 L55,10 L70,50 L85,30 L100,30 L115,15 L130,45 L145,30 L300,30"
                />
              </circle>
            </svg>
          </div>

          <p className="splash-tagline">Your Trusted Healthcare Partner</p>

          <div className="splash-loader">
            <div className="loader-bar" />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default SplashScreen;