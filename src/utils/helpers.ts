export const generateHash = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();
export const generateTicketKey = (customerId: string) =>
  `${customerId}-${generateHash()}`;
export const generateId = (prefix: string) =>
  `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};
