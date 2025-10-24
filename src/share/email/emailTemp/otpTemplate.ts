export const otpTemplate = (otpCode: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your One-Time Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    h1 {
      color: #333333;
      font-size: 22px;
      text-align: center;
      margin-bottom: 16px;
    }
    .otp-box {
      background: #f0f7ff;
      border: 1px solid #007bff;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      letter-spacing: 3px;
      margin: 20px 0;
    }
    p {
      color: #555555;
      font-size: 15px;
      line-height: 1.6;
      text-align: center;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Your Verification Code</h1>
    <p>Use the following One-Time Password (OTP) to verify your account:</p>
    <div class="otp-box">${otpCode}</div>
    <p>This code will expire in <strong>30 minutes</strong>. Please do not share it with anyone for security reasons.</p>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Smart System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
