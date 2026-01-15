'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation'; // Import this

export function ResetPasswordForm() {
	const [password, setPassword] = useState('');
	const [passwordMatch, setPasswordMatch] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
  	const [sent, setSent] = useState(false);


	const searchParams = useSearchParams();
	const token = searchParams.get('token'); // This grabs the UUID from the URL bar

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent page reload

		setError(null);
		setLoading(true);

		try {
			// 1. Get the Backend URL from your env variables
			// Note: ensure this matches http://127.0.0.1:8000/api/v1


			const apiUrl = process.env.NEXT_PUBLIC_API_URL;

			// 2. Make the request to your Python backend
			const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reset_token: token, password: password }),
      });

			// 3. Handle the response
			if (!response.ok) {
				// If it's a 429 (Rate Limit), we can show a specific message
				if (response.status === 429) {
					throw new Error(
						'Too many requests. Please try again in an hour.'
					);
				}
				throw new Error('Something went wrong. Please try again.');
			}

			// 4. Success!
			// We show a success message regardless of whether the email exists
			// for security reasons (email enumeration protection).
		} catch (err: any) {
			setError(err.message || 'An unexpected error occurred.');
			console.error('Forgot Password Error:', err);
		} finally {
      setSent(true);
			setLoading(false);
		}
	};

	return (
		<Card className='w-full max-w-md shadow-lg'>
			<CardHeader className='space-y-1 text-center'>
				<CardTitle className='text-2xl font-bold tracking-tight'>
					UTESCA Portal
				</CardTitle>
				<CardDescription>
					University of Toronto Engineering Students Consulting
					Association
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					{error && (
						<Alert variant='destructive'>
							<AlertCircleIcon />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<div className='space-y-2'>
						<Label htmlFor='email'>New Password</Label>
						<Input
							id='password'
							type='password'
							placeholder='Enter new password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
							autoComplete='password'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='email'>Re-enter Password</Label>
						<Input
							id='password'
							type='password'
							placeholder='Enter password again'
							value={passwordMatch}
							onChange={(e) => setPasswordMatch(e.target.value)}
							required
							disabled={loading}
							autoComplete='password'
						/>
					</div>

					<Button
						type='submit'
						className='w-full'
						disabled={loading}
					>
						{loading ? 'Resetting' : 'Reset password'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
