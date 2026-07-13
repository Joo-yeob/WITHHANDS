import { db } from '@/api/dbClient';

const STORAGE_KEY = 'dailydex_profile_id';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateFriendCode() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function generateUniqueFriendCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateFriendCode();
    const existing = await db.entities.UserProfile.filter({ friend_code: code });
    if (existing.length === 0) return code;
  }
  return generateFriendCode();
}

export function getStoredProfileId() {
  return localStorage.getItem(STORAGE_KEY);
}

export async function getCurrentProfile() {
  const id = getStoredProfileId();
  if (!id) return null;
  try {
    return await db.entities.UserProfile.get(id);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function loginWithCredentials(loginId, password) {
  const results = await db.entities.UserProfile.filter({ login_id: loginId });
  if (results.length === 0) return { status: 'not_found' };
  const profile = results[0];
  if (profile.password !== password) return { status: 'wrong_password' };
  localStorage.setItem(STORAGE_KEY, profile.id);
  return { status: 'ok', profile };
}

export async function createProfileWithCredentials({ loginId, password, nickname, status_message, profile_image_url }) {
  const code = await generateUniqueFriendCode();
  const profile = await db.entities.UserProfile.create({
    login_id: loginId,
    password,
    friend_code: code,
    nickname,
    status_message: status_message || '',
    profile_image_url: profile_image_url || '',
  });
  localStorage.setItem(STORAGE_KEY, profile.id);
  return profile;
}

export async function updateCurrentProfile(data) {
  const id = getStoredProfileId();
  if (!id) return null;
  return await db.entities.UserProfile.update(id, data);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}