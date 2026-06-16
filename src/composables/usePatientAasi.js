export const EAR_OPTIONS = [
  { value: 'right', label: 'Direita' },
  { value: 'left', label: 'Esquerda' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'unknown', label: 'Não informado' },
];

export function earLabel(value) {
  return EAR_OPTIONS.find((o) => o.value === value)?.label || value || '—';
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}
