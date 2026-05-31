import { useEffect, useState } from 'react';

const FB_APP_ID  = import.meta.env.VITE_FACEBOOK_APP_ID ?? '';
const FB_VERSION = 'v20.0';
const SCRIPT_ID  = 'facebook-jssdk';

export default function useFacebookSDK() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.FB);

  useEffect(() => {
    if (window.FB) {
      setReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB.init({
        appId:   FB_APP_ID,
        cookie:  true,
        xfbml:   false,
        version: FB_VERSION,
      });
      setReady(true);
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const script    = document.createElement('script');
      script.id       = SCRIPT_ID;
      script.src      = 'https://connect.facebook.net/en_US/sdk.js';
      script.async    = true;
      script.defer    = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }
  }, []);

  return ready;
}