'use client';

import { useState, useEffect, useRef } from 'react';

type Domain = '@stanford.edu' | '@alumni.stanford.edu';

export default function Home() {
  // sunetId now holds the FULL value (e.g., "leland@stanford.edu")
  const [sunetId, setSunetId] = useState('');
  const [domain, setDomain] = useState<Domain>('@stanford.edu');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sent = localStorage.getItem('inviteSent');
    if (sent) {
      setHasSubmitted(true);
      setStatus('success');
    }
  }, []);

  // If user switches domain toggle while typing, update the suffix in the input
  useEffect(() => {
    if (sunetId.includes('@')) {
      const prefix = sunetId.split('@')[0];
      setSunetId(`${prefix}${domain}`);
    }
  }, [domain]); // Only re-run when domain changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // 1. Detect if user is starting to type from empty
    // If we went from empty "" to something "a", append the domain immediately
    if (sunetId === '' && newValue.length === 1) {
      const char = newValue;
      setSunetId(`${char}${domain}`);

      // We must manually set the cursor position after the character they just typed
      // otherwise it might jump to the end of the email
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(1, 1);
        }
      });
      return;
    }

    // 2. Standard typing behavior
    // Allow them to edit, but if they delete the whole prefix, reset to empty
    if (newValue === domain || newValue === '@') {
        setSunetId('');
    } else {
        setSunetId(newValue);
    }

    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Since the domain is literally in the text box, we just use sunetId directly
    if (!sunetId || sunetId === domain) {
      setStatus('error');
      setMessage('Please enter your SUNet ID.');
      inputRef.current?.focus();
      return;
    }

    // Double check it ends with correct domain (in case they edited it weirdly)
    // If they messed it up, we can auto-fix or error. Let's auto-fix.
    let finalEmail = sunetId;
    if (!finalEmail.endsWith('stanford.edu')) {
        const prefix = finalEmail.split('@')[0];
        finalEmail = `${prefix}${domain}`;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setStatus('success');
      setSunetId('');
      localStorage.setItem('sentEmail', finalEmail);
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

      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-enter relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-cardinal" />

        <div className="p-8 sm:p-10">
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

              {/* SUNet ID Input Area */}
              <div className="relative group">
                <label htmlFor="sunetId" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  SUNet ID
                </label>

                <div className="relative flex items-center">

                  {/* The actual Input Field */}
                  <input
                    ref={inputRef}
                    type="text"
                    id="sunetId"
                    value={sunetId}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={handleInputChange}
                    placeholder={isFocused ? '' : 'leland'}
                    autoComplete="username"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className={`block w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-300 outline-none transition-all shadow-sm z-10 ${
                      status === 'error'
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-gray-200 focus:border-cardinal focus:ring-2 focus:ring-cardinal/10'
                    }`}
                    required
                    disabled={status === 'loading'}
                  />

                  {/* Visual Suffix (Gray Ghost Text)
                      Only visible when:
                      1. Field is empty (sunetId length is 0)
                      2. AND user is NOT focused (per user request: "click into it... ending disappears")
                  */}
                  <span
                    className={`absolute right-4 pointer-events-none select-none text-base sm:text-sm text-gray-300 transition-opacity duration-200 z-20 ${
                      (sunetId.length === 0 && !isFocused) ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {domain}
                  </span>

                </div>
              </div>

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

        <div className="bg-gray-50/80 px-8 py-4 border-t border-gray-100 flex justify-center">
           <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
             Questions? DM the host
           </a>
        </div>
      </div>
    </main>
  );
}