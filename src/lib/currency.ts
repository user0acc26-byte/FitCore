export const CURRENCY_CODE = 'PKR';

export function formatPKR(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `PKR ${num.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
