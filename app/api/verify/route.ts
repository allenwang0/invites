import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure the Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const PARTIFUL_LINK = 'https://partiful.com/e/O7quZS46xjzssWIWb5b8';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Basic Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // 2. Stanford Domain Check (Generic)
    // This covers @stanford.edu, @alumni.stanford.edu, @cs.stanford.edu, etc.
    if (!email.toLowerCase().endsWith('stanford.edu')) {
      return NextResponse.json(
        { error: 'Access denied. Please use a valid Stanford email.' },
        { status: 403 }
      );
    }

    // 3. Send Email via Gmail
    await transporter.sendMail({
      from: `"Stanford Event" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER,
      subject: 'Your Invite: Stanford Alumni Event',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="margin-bottom: 24px;">You're on the list!</h2>
          <p>We verified your Stanford status. Here is the link to the event:</p>
          <p style="margin: 24px 0;">
            <a href="${PARTIFUL_LINK}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              RSVP on Partiful
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Link not working? Copy this:<br>
            <a href="${PARTIFUL_LINK}" style="color: #666;">${PARTIFUL_LINK}</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('Email Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` },
      { status: 500 }
    );
  }
}