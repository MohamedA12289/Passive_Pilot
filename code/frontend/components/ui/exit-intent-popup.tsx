
'use client';

import { useState, useEffect } from 'react';
import EmailCapture from './email-capture';

export default function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('exitPopupShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if cursor is moving towards top of viewport (attempting to close tab/window)
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!showPopup) return null;

  return (
    <EmailCapture
      variant="popup"
      title="Wait! Before You Go..."
      description="Get my FREE Ultimate Wholesaling Starter Kit with cold calling scripts, buyer list strategies, and the Deal Analyzer."
      buttonText="Send Me The Free Kit"
      onClose={() => setShowPopup(false)}
    />
  );
}
