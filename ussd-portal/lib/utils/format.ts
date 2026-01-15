import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch {
    return "N/A";
  }
};

export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  } catch {
    return "N/A";
  }
};

export const formatRelativeTime = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "N/A";
  }
};

export const formatCurrency = (
  amount: string | number | undefined,
  currency: string = "XOF"
): string => {
  if (!amount) return "0";
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export const formatNumber = (num: number | string | undefined): string => {
  if (!num) return "0";
  const number = typeof num === "string" ? parseFloat(num) : num;
  return new Intl.NumberFormat("en-US").format(number);
};
