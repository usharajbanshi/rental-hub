exports.bookingConfirmationEmail = (renterName, listingTitle, startDate, endDate, totalPrice) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: #e0e7ff; margin: 8px 0 0; }
    .body { padding: 40px; }
    .detail-box { background: #f0f0ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e7ff; }
    .detail-row:last-child { border-bottom: none; font-weight: bold; color: #4f46e5; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Booking Confirmed!</h1>
      <p>Your reservation has been successfully created</p>
    </div>
    <div class="body">
      <p>Hi <strong>${renterName}</strong>,</p>
      <p>Great news! Your booking request has been received. Here are your booking details:</p>
      <div class="detail-box">
        <div class="detail-row">
          <span>🏠 Property</span>
          <span>${listingTitle}</span>
        </div>
        <div class="detail-row">
          <span>📅 Check-in</span>
          <span>${new Date(startDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span>📅 Check-out</span>
          <span>${new Date(endDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span>💰 Total Price</span>
          <span>Rs. ${totalPrice}</span>
        </div>
      </div>
      <p>Your booking is currently <strong>pending</strong> and will be confirmed by the owner shortly.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/renter" class="btn">View My Bookings</a>
    </div>
    <div class="footer">
      <p>© 2026 RentalHub Nepal 🇳🇵 | Built with ❤️</p>
    </div>
  </div>
</body>
</html>
`;

exports.bookingStatusEmail = (renterName, listingTitle, status) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .status { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; background: ${status === 'confirmed' ? '#d1fae5' : status === 'cancelled' ? '#fee2e2' : '#dbeafe'}; color: ${status === 'confirmed' ? '#065f46' : status === 'cancelled' ? '#991b1b' : '#1e40af'}; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${status === 'confirmed' ? '✅' : status === 'cancelled' ? '❌' : '🎉'} Booking ${status.charAt(0).toUpperCase() + status.slice(1)}!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${renterName}</strong>,</p>
      <p>Your booking for <strong>${listingTitle}</strong> has been updated:</p>
      <br/>
      <span class="status">${status.toUpperCase()}</span>
      <br/>
      <p>${
        status === 'confirmed' ? 'Great news! The owner has confirmed your booking. Get ready for your stay!' :
        status === 'cancelled' ? 'Your booking has been cancelled. We hope to see you again soon!' :
        'Your stay is complete! We hope you had a great experience. Please leave a review!'
      }</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/renter" class="btn">View My Bookings</a>
    </div>
    <div class="footer">
      <p>© 2026 RentalHub Nepal 🇳🇵 | Built with ❤️</p>
    </div>
  </div>
</body>
</html>
`;

exports.newBookingOwnerEmail = (ownerName, renterName, listingTitle, startDate, endDate, totalPrice) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .detail-box { background: #f0f0ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e7ff; }
    .detail-row:last-child { border-bottom: none; font-weight: bold; color: #4f46e5; }
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Booking Request!</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>You have a new booking request for your listing!</p>
      <div class="detail-box">
        <div class="detail-row">
          <span>👤 Renter</span>
          <span>${renterName}</span>
        </div>
        <div class="detail-row">
          <span>🏠 Listing</span>
          <span>${listingTitle}</span>
        </div>
        <div class="detail-row">
          <span>📅 Check-in</span>
          <span>${new Date(startDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span>📅 Check-out</span>
          <span>${new Date(endDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span>💰 Total Price</span>
          <span>Rs. ${totalPrice}</span>
        </div>
      </div>
      <p>Please login to your dashboard to confirm or manage this booking.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/owner" class="btn">View Booking</a>
    </div>
    <div class="footer">
      <p>© 2026 RentalHub Nepal 🇳🇵 | Built with ❤️</p>
    </div>
  </div>
</body>
</html>
`;