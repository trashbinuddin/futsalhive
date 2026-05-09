import { formatTime12h } from '../lib/utils';

export async function sendToGoogleSheets(booking: any) {
  try {
    const payload = {
      id: booking.id || '',
      userName: booking.userName || 'Unknown',
      userEmail: booking.userEmail || '',
      email: booking.userEmail || '',
      userPhone: booking.userPhone || '',
      date: booking.date || '',
      time: `${formatTime12h(booking.startTime || '')} - ${formatTime12h(booking.endTime || '')}`,
      startTime24: booking.startTime || '',
      price: String(booking.price || 0),
      advanceAmount: String(booking.advanceAmount || 0),
      paymentMethod: booking.paymentMethod || '',
      transactionId: booking.transactionId || '',
      paymentPhoneLast4: booking.paymentPhoneLast4 || '',
      status: String(booking.status || 'pending'),
      confirmedBy: booking.confirmedBy || 'System/User'
    };

    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('Successfully dispatched Google Sheets webhook');
    } else {
      console.error('Failed to send data to Google Sheets API route');
    }
  } catch (error) {
    console.error('Failed to send data to Google Sheets:', error);
  }
}
