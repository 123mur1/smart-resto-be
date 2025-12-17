# Email Configuration Guide

This guide will help you set up email sending for the Smart Campus Restaurant system.

## Quick Setup

1. **Create a `.env` file** in the `Smart-be` directory (if it doesn't exist)

2. **Add these SMTP configuration variables** to your `.env` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME="Smart Campus Restaurant"
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select your device
4. Click "Generate"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
6. **Use this App Password** (not your regular Gmail password) in `SMTP_PASS`

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=youremail@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=youremail@gmail.com
SMTP_FROM_NAME="Smart Campus Restaurant"
```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
SMTP_FROM_NAME="Smart Campus Restaurant"
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
SMTP_FROM_NAME="Smart Campus Restaurant"
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME="Smart Campus Restaurant"
```

## Verification

After setting up your `.env` file:

1. **Restart your NestJS server**
2. **Check the logs** - You should see:
   ```
   [MailService] SMTP transporter verified
   ```
3. **If you see an error**, check:
   - Are the credentials correct?
   - Is 2-Step Verification enabled (for Gmail)?
   - Are you using an App Password (not regular password)?
   - Is the SMTP port correct?
   - Is your firewall blocking the connection?

## Testing Email

You can test email sending by:
1. Registering a new user (will send OTP email)
2. Using the resend OTP endpoint
3. Using the password reset feature

## Troubleshooting

### Error: "SMTP credentials missing"
- Make sure your `.env` file is in the `Smart-be` directory
- Check that `SMTP_USER` and `SMTP_PASS` are set
- Restart the server after updating `.env`

### Error: "535-5.7.8 Username and Password not accepted"
- For Gmail: Use an App Password, not your regular password
- Make sure 2-Step Verification is enabled
- Double-check the App Password (no spaces, all 16 characters)

### Error: "Connection timeout"
- Check your firewall settings
- Verify the SMTP host and port are correct
- Try a different port (587 instead of 465, or vice versa)

### Error: "SMTP transporter verify failed"
- Check your internet connection
- Verify SMTP credentials are correct
- Try using a different email provider
- Check if your email provider requires specific security settings

## Security Notes

- **Never commit your `.env` file to git** (it should be in `.gitignore`)
- **Use App Passwords** instead of regular passwords when possible
- **Keep your SMTP credentials secure**
- **Rotate passwords regularly**

## Support

If you continue to have issues:
1. Check the NestJS server logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a different email account
4. Contact your email provider's support for SMTP configuration help

