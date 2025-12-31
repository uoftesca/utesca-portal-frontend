'use client';

/**
 * RSVP Link Display Component
 *
 * Displays the RSVP confirmation link for accepted applications
 * with copy-to-clipboard functionality
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RsvpLinkDisplayProps {
  id: string;
  baseUrl?: string;
}

export function RsvpLinkDisplay({
  id,
  baseUrl = 'https://utesca.ca',
}: Readonly<RsvpLinkDisplayProps>) {
  const [copied, setCopied] = useState(false);
  const rsvpUrl = `${baseUrl}/rsvp/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
      <Label className="text-sm font-medium text-green-900">
        RSVP Link (send to attendee)
      </Label>
      <div className="flex items-center gap-2 mt-1">
        <Input
          readOnly
          value={rsvpUrl}
          className="flex-1 text-sm bg-white"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className={copied ? 'bg-green-100' : ''}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-green-700 mt-2">
        The attendee must click this link to confirm their attendance.
      </p>
    </div>
  );
}
