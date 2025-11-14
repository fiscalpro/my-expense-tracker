export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatCompetencia = (competencia: string): string => {
  const [mes, ano] = competencia.split('/');
  const meses: { [key: string]: string } = {
    'JANEIRO': 'Jan',
    'FEVEREIRO': 'Fev',
    'MARÇO': 'Mar',
    'ABRIL': 'Abr',
    'MAIO': 'Mai',
    'JUNHO': 'Jun',
    'JULHO': 'Jul',
    'AGOSTO': 'Ago',
    'SETEMBRO': 'Set',
    'OUTUBRO': 'Out',
    'NOVEMBRO': 'Nov',
    'DEZEMBRO': 'Dez'
  };
  return `${meses[mes] || mes} ${ano}`;
};
