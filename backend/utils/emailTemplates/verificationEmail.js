const verificationEmailTemplate = (name, code) => `
  <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <h2 style="color: #4CAF50; text-align: center;">Verify Your Email</h2>
      
      <p style="font-size: 16px; color: #333;">
        Hello <strong>${name}</strong>,
      </p>

      <p style="font-size: 15px; color: #555;">
        Thank you for registering! Please use the verification code below to activate your account.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <span style="font-size: 28px; font-weight: bold; color: #4CAF50;">${code}</span>
      </div>

      <p style="font-size: 14px; color: #888;">
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <hr>

      <p style="font-size: 13px; color: #aaaaaa; text-align: center;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  </div>
`;

export default verificationEmailTemplate;
