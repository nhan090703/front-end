
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};
export const formatText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const formatTime = (value) => {
  if (!value) return '';
  return value.toString().substring(0, 5);
};