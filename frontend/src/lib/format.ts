// Formatacao monetaria padrao (BRL) reutilizada em todo o app.
export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
