import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // STRICT VALIDATION:
    // Must end with ".stanford.edu" to catch @stanford.edu AND @alumni.stanford.edu
    // AND @cs.stanford.edu, etc.
    // Also ensures it includes an '@' symbol.
    if (!emailLower.endsWith('.stanford.edu') || !emailLower.includes('@')) {
       return NextResponse.json(
        { error: 'Access denied. Please use a valid Stanford email.' },
        { status: 403 }
      );
    }

    await transporter.sendMail({
      from: `"Stanford Event" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Invite: Stanford Alumni Event',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="color: #8C1515; margin-bottom: 24px;">You're on the list!</h2>
          <p>We verified your Stanford status. Here is your private link:</p>
          <p style="margin: 24px 0;">
            <a href="${PARTIFUL_LINK}" style="background-color: #8C1515; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              RSVP on Partiful
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            Link not working? <a href="${PARTIFUL_LINK}" style="color: #666;">${PARTIFUL_LINK}</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('Email Error:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}