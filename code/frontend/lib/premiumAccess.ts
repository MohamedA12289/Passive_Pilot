export function isPremiumUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('premium_unlocked') === 'true';
}

export function unlockPremium(_code?: string): boolean {
  if (typeof window === 'undefined') return false;
  localStorage.setItem('premium_unlocked', 'true');
  return true;
}

export function getPremiumStatus(): { unlocked: boolean } {
  return { unlocked: isPremiumUnlocked() };
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('user_id') || '';
}
