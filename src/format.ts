export function polishPlural(count: number, forms: [string, string, string]): string {
  if (count === 1) return forms[0];
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? forms[1] : forms[2];
}
export function cardCount(count: number): string {
  return `${count} ${polishPlural(count, ['karta', 'karty', 'kart'])}`;
}
