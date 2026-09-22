export function formatNaira(kobo = 0) {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function nairaToKobo(naira) {
  return Math.round(Number(naira) * 100);
}
