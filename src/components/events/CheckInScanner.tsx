/**
 * Check-In Scanner Component
 *
 * Scanner for event ticket QR codes and marking registrations as checked-in
 */

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiClient } from '@/lib/api-client';

interface TicketInfo {
  registrationId: string,
  ticketToken: string
};

export function CheckInScanner() {
  useEffect(() => {
    let scanner: Html5QrcodeScanner;

    async function onScanSuccess(text: string) {
      scanner.pause(true);

      try {
        const info = JSON.parse(text) as TicketInfo;

        console.log(info);

        await apiClient.checkIn(info.registrationId, info.ticketToken);

      } catch (error) {
        // TODO: Add proper error popup here
        console.error(error);
      }

      scanner.resume();
    }

    scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 500, height: 500} },
      false
    );

    scanner.render(onScanSuccess, () => { console.log("Fail"); });

    return () => {
      scanner.clear();
    }
  }, []);

  return <div id="qr-reader"></div>
}
