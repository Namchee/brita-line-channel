export function capitalize(str: string): string {
  return str.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}
