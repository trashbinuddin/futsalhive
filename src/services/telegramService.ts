/// <reference types="vite/client" />

import { formatTime12h } from '../lib/utils';

export async function sendTelegramNotification(message: string) {
  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export function formatBookingMessage(booking: any, type: 'new' | 'update') {
  const title = type === 'new' ? '<b>NEW BOOKING!</b>' : '<b>BOOKING UPDATED!</b>';
  
  const updatedByLine = type === 'update' && booking.confirmedBy 
    ? `\n<b>Updated By:</b> ${booking.confirmedBy}`
    : '';

  return `${title}
--------------------------
<b>Player:</b> ${booking.userName}
<b>Phone:</b> ${booking.userPhone}
<b>Date:</b> ${booking.date}
<b>Time:</b> ${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}
<b>Price:</b> ৳${booking.price}
<b>Advance:</b> ৳${booking.advanceAmount || 0}
<b>Method:</b> ${booking.paymentMethod?.toUpperCase() || 'N/A'} (Last 4: ${booking.paymentPhoneLast4 || 'N/A'})
<b>TrxID:</b> ${booking.transactionId || 'N/A'}
<b>Status:</b> ${booking.status.toUpperCase()}${updatedByLine}
--------------------------
<i>Futsal Hive Arena</i>`;
}
