import { format, isToday, isYesterday, parseISO } from 'date-fns';

// Helper function to convert date to Indian timezone
const toIndianTime = (date) => {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (5.5 * 60 * 60 * 1000)); // IST is UTC+5:30
};

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const indianDate = toIndianTime(parsedDate);
  
  if (isToday(indianDate)) {
    return 'Today';
  }
  
  if (isYesterday(indianDate)) {
    return 'Yesterday';
  }
  
  return format(indianDate, formatStr);
};

export const getDateString = (date = new Date()) => {
  const indianDate = toIndianTime(date);
  return indianDate.toISOString().split('T')[0];
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

export const getWeekDates = (startDate = new Date()) => {
  const dates = [];
  const indianStartDate = toIndianTime(startDate);
  const start = new Date(indianStartDate);
  start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};
