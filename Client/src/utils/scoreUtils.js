/**
 * Returns tier info from a numeric score (0-1000)
 */
export function getTierFromScore(score) {
  if (score <= 200) return { label: 'Anon',        color: '#666',    textColor: '#888' };
  if (score <= 400) return { label: 'New Wallet',  color: '#4ade80', textColor: '#4ade80' };
  if (score <= 600) return { label: 'Established', color: '#60a5fa', textColor: '#60a5fa' };
  if (score <= 800) return { label: 'Trusted',     color: '#8b5cf6', textColor: '#8b5cf6' };
  return               { label: 'OG',           color: '#f59e0b', textColor: '#f59e0b' };
}

/**
 * Returns CSS color variable name for tier bar fill
 */
export function getTierBarColor(score) {
  if (score <= 200) return '#555';
  if (score <= 400) return '#4ade80';
  if (score <= 600) return '#60a5fa';
  if (score <= 800) return '#8b5cf6';
  return '#f59e0b';
}

/**
 * Normalises score to 0-1 fraction
 */
export function scoreToFraction(score, max = 1000) {
  const numScore = Number(score) || 0;
  return Math.min(Math.max(numScore / max, 0), 1);
}