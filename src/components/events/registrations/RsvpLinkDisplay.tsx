'use client';

/**
 * RSVP Link Display Component
 *
 * Displays the RSVP confirmation link for accepted applications
 * with copy-to-clipboard functionality
 */

import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface RsvpLinkDisplayProps {
  id: string;
}

export function RsvpLinkDisplay({
  id,
}: Readonly<RsvpLinkDisplayProps>) {
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_URL || 'https://utesca.ca';
  const rsvpUrl = `${baseUrl}/rsvp/${id}`;
  const { copied, copy } = useCopyToClipboard({ timeout: 2000 });

  const handleCopy = () => copy(rsvpUrl);

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
