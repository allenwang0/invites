'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Check if user already submitted
  useEffect(() => {
    const sent = localStorage.getItem('inviteSent');
    if (sent) {
      setHasSubmitted(true);
      setStatus('success');
      setMessage('You have already requested an invite. Check your inbox!');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend Validation: Checks for any "stanford.edu" domain
    if (!email.toLowerCase().endsWith('stanford.edu')) {
      setStatus('error');
      setMessage('Please enter a valid @stanford.edu or @alumni.stanford.edu address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // Success
      setStatus('success');
      setMessage('Success! The Partiful link has been sent to your inbox.');
      setEmail('');
      localStorage.setItem('inviteSent', 'true'); // Prevent double submission
      setHasSubmitted(true);

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('inviteSent');
    setHasSubmitted(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Alumni Event RSVP
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Exclusive to Stanford Grads. Enter your Stanford email below to receive the invite.
            </p>
          </div>

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="leland@stanford.edu"
                  className={`block w-full rounded-lg border px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition sm:text-sm ${
                    status === 'error'
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {status === 'loading' ? 'Verifying...' : 'Get Invite'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
               <div className="rounded-md bg-green-50 p-4 text-center">
                 <p className="text-sm font-medium text-green-800">Invite Sent!</p>
                 <p className="mt-1 text-xs text-green-700">Check your inbox for the link.</p>
               </div>
               <button
                 onClick={handleReset}
                 className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
               >
                 Send to a different email
               </button>
            </div>
          )}

          {status === 'error' && !hasSubmitted && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-center text-red-700">
              {message}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Having trouble? DM the host directly.
          </p>
        </div>
      </div>
    </main>
  );
}