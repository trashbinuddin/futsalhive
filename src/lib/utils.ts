import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime12h(time24: string) {
  if (!time24 || typeof time24 !== 'string') return time24;
  const parts = time24.split(':');
  if (parts.length !== 2) return time24;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}
