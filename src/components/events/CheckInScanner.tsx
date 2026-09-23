/**
 * Check-In Scanner Component
 *
 * Scanner for event ticket QR codes and marking registrations as checked-in
 */

import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { apiClient } from '@/lib/api-client';
import { TicketInfo } from '@/types/registration';

export function TicketScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const onCooldownRef = useRef<boolean>(false);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scannerRef.current = null;

        if (scanner.isScanning) {
          scanner.stop().catch(() => {});
        }

        try {
          scanner.clear();
        } catch (e) {}
      }
    }
  }, []);

  const onScanSuccess = async (text: string) => {
    if (onCooldownRef.current) return;

    try {
      onCooldownRef.current = true;

      if (scannerRef.current?.isScanning) scannerRef.current.pause(true);

      const info = JSON.parse(text) as TicketInfo;

      await apiClient.checkIn(
        info.registrationId,
        { ticket_token: info.ticketToken }
      ).catch((error) => {
        console.error("Failed to check in:", error);
      });

      // TODO: Add success toast notification

      setTimeout(() => {
        onCooldownRef.current = false;

        scannerRef.current?.resume();
      }, 1000);

    } catch (error) {
      // TODO: Add error toast notification

      console.error(error);
    }
  }

  const startScanner = async () => {
    if (!scannerRef.current || scannerRef.current.isScanning || isScanning) return;

    setIsStarting(true);
    setIsScanning(true);

    const qrBoxSize = window.innerWidth < 640 ? 200 : 250;

    await scannerRef.current?.start(
      { 'facingMode': 'environment' },
      {
        fps: 10,
        qrbox: { width: qrBoxSize, height: qrBoxSize }
      },
      onScanSuccess,
      () => {}
    ).catch((error) => {
      console.error('Failed to start scanner:', error);
    });

    setIsStarting(false);
  }

  const stopScanner = async () => {
    // TODO: Improve checks (and probably add cooldown) to prevent pressing stop right after start from breaking the scanner

    if (isStarting) return;

    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch((error) => {
        console.error('Failed to stop scanner:', error);
      });
    }

    setIsScanning(false);
  }

  // TODO: Improve style to match rest of website (hover effect, corners, etc.)
  // TODO: Add placeholder text when camera is not active
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <div className="w-full aspect-[4/3] overflow-hidden rounded-xl bg-muted border border-border relative flex items-center justify-center">
        <div id="qr-reader" className="w-full" />
      </div>

      <button 
        onClick={isScanning ? stopScanner : startScanner}
        className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-lg font-medium transition-colors"
      >
        {isStarting ? "Loading..." : (isScanning ? "Stop Camera" : "Start Camera")}
      </button>
    </div>
  )
}
