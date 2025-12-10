function getStatusEmailHTML(statusInfo, order, status) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #4CAF50; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #071018 0%, #0b2a1a 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="color: #FFD700; margin: 0; font-size: 28px;">jeevaLeaf</h1>
            <p style="color: #4CAF50; margin: 5px 0;">Bring life in our home 🌿</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #4CAF50; margin-top: 0;">${statusInfo.subject}</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              <strong>Hello ${order.deliveryName || 'Valued Customer'},</strong><br/>
              ${statusInfo.message}
            </p>
            <div style="background: #f9f9f9; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order._id}</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> <span style="background: #4CAF50; color: white; padding: 4px 12px; border-radius: 4px;">${String(status).toUpperCase()}</span></p>
              <p style="margin: 8px 0;"><strong>Total:</strong> ₹${Number(order.total || 0).toFixed(2)}</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Thank you for shopping with jeevaLeaf!</p>
          </div>
          <div style="background: #f5f5f5; border-top: 1px solid #ddd; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 5px 0;">For support: <strong>support@jeevaleaf.com</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = { getStatusEmailHTML };