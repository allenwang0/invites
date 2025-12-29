import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// REPLACE THIS WITH YOUR ACTUAL PARTIFUL LINK
const PARTIFUL_LINK = 'https://partiful.com/e/YOUR_EVENT_ID';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Check if email exists
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // 2. Validate Domain (Case insensitive)
    if (!email.toLowerCase().endsWith('@alumni.stanford.edu')) {
      return NextResponse.json(
        { error: 'Access denied. Please use a valid @alumni.stanford.edu email.' },
        { status: 403 }
      );
    }

    // 3. Send Email
    // Note: If you haven't verified a domain on Resend, 'from' must be 'onboarding@resend.dev'
    // and 'to' can only be YOUR email (the one you signed up with).
    // Once you verify a domain (e.g., invites.allenwang.com), you can send to anyone.
    const { error } = await resend.emails.send({
      from: 'Alumni Event <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Invite: Stanford Alumni Event',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're on the list!</h2>
          <p>We verified your alumni status. Here is the private link to the event:</p>
          <p style="margin: 20px 0;">
            <a href="${PARTIFUL_LINK}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              RSVP on Partiful
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy this link: ${PARTIFUL_LINK}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}