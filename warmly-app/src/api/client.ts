import { z } from 'zod';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const deviceKey = 'warmly_device_id';

export async function registerDevice() {
  const existing = await getDeviceId();
  if (existing) return existing;
  const res = await fetch(`${BASE_URL}/api/auth/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'ru', timezone: 'UTC' }),
  });
  if (!res.ok) throw new Error('Failed to register device');
  const data: { deviceId: string } = await res.json();
  await setDeviceId(data.deviceId);
  return data.deviceId;
}

function setDeviceId(id: string) {
  return Promise.resolve(localStorage.setItem(deviceKey, id));
}

function getDeviceId() {
  return Promise.resolve(localStorage.getItem(deviceKey));
}

export type Phrase = {
  id: string;
  lang: 'ru' | 'en';
  part: 'morning' | 'day' | 'evening';
  text: string;
};

export async function getPhrases(params: { lang?: 'ru' | 'en'; part?: 'morning' | 'day' | 'evening'; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.lang) q.set('lang', params.lang);
  if (params.part) q.set('part', params.part);
  if (params.limit) q.set('limit', String(params.limit));
  const res = await fetch(`${BASE_URL}/api/phrases?${q.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch phrases');
  return (await res.json()) as Phrase[];
}

export async function addFavorite(phraseId: string) {
  const deviceId = await getDeviceId();
  if (!deviceId) throw new Error('No device');
  const res = await fetch(`${BASE_URL}/api/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, phraseId }),
  });
  if (!res.ok) throw new Error('Failed to favorite');
  return res.json();
}

export async function getFavorites() {
  const deviceId = await getDeviceId();
  if (!deviceId) throw new Error('No device');
  const res = await fetch(`${BASE_URL}/api/favorites?deviceId=${deviceId}`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function sendWarmth(body: { text: string; fromName?: string; toAlias?: string }) {
  const res = await fetch(`${BASE_URL}/api/warm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to send');
  return res.json();
}