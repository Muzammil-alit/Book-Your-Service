  'use client'

import React, { useEffect, useMemo, useState } from 'react';

function Iframe() {  
  const [iframeUrl, setIframeUrl] = useState(() => {
    return sessionStorage.getItem('iframeURL') || `${process.env.NEXT_PUBLIC_APP_URL}/client/login`;
  });

  useEffect(() => {
    const saveIframeURL = () => {
      const iframe = document.getElementById('my-iframe') as HTMLIFrameElement | null;
      try {
        const currentURL = iframe?.contentWindow?.location?.href;
        if (currentURL) {
          sessionStorage.setItem('iframeURL', currentURL);
        }
      } catch (err) {
        console.warn('Could not access iframe content for saving URL.', err);
      }
    };
  
    window.addEventListener('beforeunload', saveIframeURL);
    return () => window.removeEventListener('beforeunload', saveIframeURL);
  }, []);
  

  const iframeElement = useMemo(() => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>

    <iframe
      id="my-iframe"
      src={iframeUrl}
      width="80%"
      height="90%"
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        scrollbarWidth: 'thin',
        display: 'flex',
        alignItems: 'center'
      }}
      title="Login Page"
      />
      </div>
  ), [iframeUrl]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        overflow: 'auto',
      }}
    >
      {iframeElement}
    </div>
  );
}

export default Iframe;
