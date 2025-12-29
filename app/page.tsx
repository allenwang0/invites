'use client';

import { useState, useEffect, useRef } from 'react';

type Domain = '@stanford.edu' | '@alumni.stanford.edu';

export default function Home() {
  const [sunetId, setSunetId] = useState('');
  const [domain, setDomain] = useState<Domain>('@stanford.edu');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // State for the "stick to cursor" effect
  const [textWidth, setTextWidth] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  // Ref for a hidden span used to measure text width exactly
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sent = localStorage.getItem('inviteSent');
    if (sent) {
      setHasSubmitted(true);
      setStatus('success');
    }
  }, []);

  // Effect to calculate text width whenever input changes
  useEffect(() => {
    if (measureRef.current) {
      // Get the width of the hidden span text
      const width = measureRef.current.offsetWidth;
      setTextWidth(width);
    }
  }, [sunetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId = sunetId.split('@')[0].trim();

    if (!cleanId) {
      setStatus('error');
      setMessage('Please enter your SUNet ID.');
      inputRef.current?.focus();
      return;
    }

    const fullEmail = `${cleanId}${domain}`;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setStatus('success');
      setSunetId('');
      localStorage.setItem('sentEmail', fullEmail);
      localStorage.setItem('inviteSent', 'true');
      setHasSubmitted(true);

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
      if (error.message.includes('valid')) {
         inputRef.current?.focus();
      }
    }
  };

  const handleReset = () => {
    localStorage.removeItem('inviteSent');
    setHasSubmitted(false);
    setStatus('idle');
    setMessage('');
    setSunetId('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 selection:bg-cardinal/10 selection:text-cardinal">

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-enter relative">

        {/* Stanford Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-cardinal" />

        <div className="p-8 sm:p-10">

          {/* Header Section */}
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Stanford Alumni Mixer
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              February 2026 • San Francisco<br />
              <span className="opacity-80">Welcome to all Stanford community members</span>
            </p>
          </div>

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Domain Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Select Email Type
                </label>
                <div className="bg-gray-100 p-1 rounded-lg flex relative">
                  <button
                    type="button"
                    onClick={() => setDomain('@stanford.edu')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 text-center ${
                      domain === '@stanford.edu'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Stanford
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomain('@alumni.stanford.edu')}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 text-center ${
                      domain === '@alumni.stanford.edu'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Alumni
                  </button>
                </div>
              </div>

              {/* SUNet ID Input */}
              <div className="relative group">
                <label htmlFor="sunetId" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  SUNet ID
                </label>

                <div className="relative flex items-center">
                  {/* Hidden span to measure text width exactly.
                    Must match input font/padding exactly to align perfectly.
                  */}
                  <span
                    ref={measureRef}
                    className="absolute opacity-0 pointer-events-none whitespace-pre px-4 text-base sm:text-sm font-normal"
                    aria-hidden="true"
                  >
                    {sunetId || 'leland'} {/* Use placeholder width if empty to position correctly? No, stick to empty */}
                    {/* Actually better to measure just the value. If value empty, width is 0 */}
                    {sunetId}
                  </span>

                  <input
                    ref={inputRef}
                    type="text"
                    id="sunetId"
                    value={sunetId}
                    onChange={(e) => {
                      setSunetId(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="leland"
                    autoComplete="username"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className={`block w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-300 outline-none transition-all shadow-sm z-10 bg-transparent ${
                      status === 'error'
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-gray-200 focus:border-cardinal focus:ring-2 focus:ring-cardinal/10'
                    }`}
                    required
                    disabled={status === 'loading'}
                  />

                  {/* Dynamic Suffix */}
                  <span
                    className={`absolute pointer-events-none select-none transition-colors duration-200 z-0 text-base sm:text-sm ${
                      sunetId.length > 0 ? 'text-black' : 'text-gray-300'
                    }`}
                    style={{
                      // 16px is the left padding (px-4)
                      // We limit the left position to prevent overflow if they type a novel
                      left: `${Math.min(textWidth + 16, 300)}px`,
                      // If empty, show it at the start (16px)? Or maybe ghosted right after placeholder?
                      // Let's keep it right after the cursor. If cursor is at 0, it's at 16px.
                    }}
                  >
                    {domain}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              <div aria-live="polite" className="min-h-[20px]">
                {status === 'error' && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                    </svg>
                    {message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full relative overflow-hidden rounded-lg bg-cardinal px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-cardinal-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cardinal disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Get Invite Link'
                )}
              </button>

            </form>
          ) : (
            /* Success State */
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Sent!</h3>
              <p className="text-sm text-gray-600 mb-8">
                We've sent the private Partiful link to <br/>
                <span className="font-semibold text-gray-900">{localStorage.getItem('sentEmail') || 'your email'}</span>.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 mb-8 border border-gray-100">
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">1</span>
                  <span>Check your inbox</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">2</span>
                  <span>Look for subject: "Stanford Alumni Event"</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">3</span>
                  <span>If missing, check Spam/Promotions</span>
                </div>
              </div>

              <button
                 onClick={handleReset}
                 className="text-xs font-medium text-gray-400 hover:text-cardinal underline transition-colors"
               >
                 Send to a different email address
               </button>
            </div>
          )}

        </div>

        {/* Footer in Card */}
        <div className="bg-gray-50/80 px-8 py-4 border-t border-gray-100 flex justify-center">
           <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
             Questions? DM the host
           </a>
        </div>
      </div>
    </main>
  );
}