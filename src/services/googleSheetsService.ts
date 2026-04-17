export const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw4IPNWOvRW7W30U3Mo7O3qn7iRD10DaVU2x86VprDlXsF1o_iNVQgaJDpLZsqUSZ0D/exec';

export async function sendToGoogleSheets(booking: any) {
  try {
    const payload = {
      userName: booking.userName || 'Unknown',
      userPhone: booking.userPhone || '',
      date: booking.date || '',
      time: `${booking.startTime || ''} - ${booking.endTime || ''}`,
      price: booking.price || 0,
      status: booking.status || 'pending'
    };

    // We use mode: 'no-cors' because Google Apps Script typically blocks standard 
    // cross-origin requests from the browser. This allows "fire and forget".
    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Successfully pinged Google Sheets API');
  } catch (error) {
    console.error('Failed to send data to Google Sheets:', error);
  }
}
