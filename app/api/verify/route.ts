import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure the Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // The App Password
  },
});

const PARTIFUL_LINK = 'https://partiful.com/e/YOUR_EVENT_ID_HERE';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Basic Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // 2. Stanford Domain Check
    if (!email.toLowerCase().endsWith('@alumni.stanford.edu')) {
      return NextResponse.json(
        { error: 'Access denied. Please use a valid @alumni.stanford.edu email.' },
        { status: 403 }
      );
    }

    // 3. Send Email via Gmail
    await transporter.sendMail({
      from: '"Stanford Event" <' + process.env.GMAIL_USER + '>', // Sender address
      to: email, // Receiver address
      subject: 'Your Invite: Stanford Alumni Event',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>You're on the list!</h2>
          <p>We verified your alumni status. Here is the link to the event:</p>
          <p style="margin: 20px 0;">
            <a href="${PARTIFUL_LINK}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              RSVP on Partiful
            </a>
          </p>
          <p>Or copy this link: ${PARTIFUL_LINK}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Email Error:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Double check your email address.' },
      { status: 500 }
    );
  }
}