/**
 * Check-In Scanner Component
 *
 * Scanner for event ticket QR codes and marking registrations as checked-in
 */

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiClient } from '@/lib/api-client';

export function CheckInScanner() {
  useEffect(() => {
    function onScanSuccess(text: string) {
      const info = text.split('_');
      if (info.length !== 2) return;

      const [registrationId, token] = info;

      // Do some validation here before wasting an API request
      // Add a cooldown

      apiClient.checkIn(registrationId, token);
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 250, height: 250} },
      false
    )

    html5QrcodeScanner.render(onScanSuccess, () => {})
  })

  return <div id="qr-reader"></div>
}
