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
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <IonPage>
      <IonContent className="splash-content" fullscreen>
        <div className="splash-wrap">
          <div className="splash-logo">
            <img src={Logo} alt='logo'/>
          </div>
          <div className="splash-dots">
            <span /><span /><span />
          </div>
          <p className="splash-tagline">Quality. Care. Delivered.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default SplashScreen;
