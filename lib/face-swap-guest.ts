import { createHmac, randomBytes } from 'crypto';
import type { NextResponse } from 'next/server';

export const GUEST_TRIAL_COOKIE = 'fs_guest_trial';
export const GUEST_PAID_CREDIT_COOKIE = 'fs_paid_credit';

const PAID_CREDIT_MAX_AGE_SEC = 24 * 60 * 60;

function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required for guest face swap payments');
  }
  return secret;
}

export function isGuestTrialUsed(trialCookieValue?: string): boolean {
  return trialCookieValue === '1';
}

export function createPaidCreditToken(): string {
  const payload = `${Date.now()}:${randomBytes(16).toString('hex')}`;
  const signature = createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function isValidPaidCreditToken(token?: string): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac('sha256', getSigningSecret()).update(payload).digest('hex');

  if (signature !== expected) return false;

  const [timestamp] = payload.split(':');
  const createdAt = Number(timestamp);
  if (!Number.isFinite(createdAt)) return false;

  return Date.now() - createdAt <= PAID_CREDIT_MAX_AGE_SEC * 1000;
}

export function setGuestTrialCookie(response: NextResponse): void {
  response.cookies.set(GUEST_TRIAL_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  });
}

export function setGuestPaidCreditCookie(response: NextResponse, token: string): void {
  response.cookies.set(GUEST_PAID_CREDIT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: PAID_CREDIT_MAX_AGE_SEC,
    path: '/',
  });
}

export function clearGuestPaidCreditCookie(response: NextResponse): void {
  response.cookies.set(GUEST_PAID_CREDIT_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function getPayPalAuthHeader(): string {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const secret = process.env.PAYPAL_SECRET || '';
  return `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`;
}

export function getPayPalApiBase(): string {
  return process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
}
