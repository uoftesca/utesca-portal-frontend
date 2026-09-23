'use client'

/**
 * Check-In Scanner Component
 *
 * Scanner for event ticket QR codes and marking registrations as checked-in
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Html5Qrcode } from 'html5-qrcode';
import { useCheckIn } from '@/hooks/use-registrations';
import { TicketInfo } from '@/types/registration';

export function TicketScanner() {
  const isMobile = useIsMobile();

  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const checkInMutation = useCheckIn();
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

      try {
        await checkInMutation.mutateAsync(
          { registrationId: info.registrationId, data: {ticket_token: info.ticketToken} }
        )
      } catch {}

      setTimeout(() => {
        checkInMutation.reset();
        onCooldownRef.current = false;
        scannerRef.current?.resume();
      }, 1500);

    } catch (e) {
      console.error(e);
    }
  }

  const startScanner = async () => {
    if (!scannerRef.current || scannerRef.current.isScanning || isScanning) return;

    setIsStarting(true);
    setIsScanning(true);

    const qrBoxSize = isMobile ? 200 : 250;

    await scannerRef.current?.start(
      { 'facingMode': 'environment' },
      {
        fps: 10,
        qrbox: { width: qrBoxSize, height: qrBoxSize }
      },
      onScanSuccess,
      () => {}
    ).catch((e) => {
      console.error('Failed to start scanner:', e);
    });

    setIsStarting(false);
  }

  const stopScanner = async () => {
    // TODO: Improve checks (and probably add cooldown) to prevent pressing stop right after start from breaking the scanner

    if (isStarting) return;

    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch((e) => {
        console.error('Failed to stop scanner:', e);
      });
    }

    setIsScanning(false);
  }

  const aspectClass = isMobile ? "aspect-[3/4]" : "aspect-[4/3]"

  // TODO: Improve style to match rest of website (hover effect, corners, etc.)
  // TODO: Add placeholder text when camera is not active
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      {checkInMutation.isSuccess && (
        <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-destructive text-sm p-3 rounded-md">
          {/* TODO: Replace registration id with registration name or something */}
          Successfully checked in registration {checkInMutation.data.id}
        </div>
      )}

      {checkInMutation.isError && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {checkInMutation.error instanceof Error
            ? checkInMutation.error.message
            : 'Failed to check in'}
        </div>
      )}

      <div className={`w-full ${aspectClass} overflow-hidden rounded-xl bg-muted border border-border relative flex items-center justify-center`}>
        {(!isScanning || isStarting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/90 backdrop-blur-xs text-muted-foreground text-sm p-4 text-center z-10">
            {isStarting ? "Starting camera..." : "Camera is off."}
          </div>
        )}

        <div id="qr-reader" className="w-full h-auto max-w-full max-h-full" />
      </div>

      <Button
        onClick={isScanning ? stopScanner : startScanner}
        className="px-6 py-2.5"
      >
        {isScanning ? "Stop Camera" : "Start Camera"}
      </Button>
    </div>
  )
}
