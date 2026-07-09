export function formatWon(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0)
}

export function formatRate(value) {
  const number = Number(value ?? 0)
  return `${number > 0 ? '+' : ''}${number.toFixed(2)}%`
}
