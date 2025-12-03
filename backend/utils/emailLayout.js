export const adminVerifyCode = (verificationCode) => {
  const LOGO_URL = "../utils/logo.png"; // Update with actual logo path or URL
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Axis Tech Supplies — Security Code</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="720" style="max-width:720px;width:100%;font-family:Arial, Helvetica, sans-serif;color:#4b5962;">
          <tr>
            <td style="padding:0 0 18px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding:0; line-height:0;">
                    <img src="${LOGO_URL}" alt="Axis Tech Supplies" width="44" height="44" style="display:block;border:0;outline:none;text-decoration:none;">
                  </td>
                  <td style="width:10px;font-size:0;line-height:0;">&nbsp;</td>
                  <td valign="middle" style="padding:0;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:26px; font-weight:700; color:#4f46e5; letter-spacing:0.5px; margin:0; white-space:nowrap;">
                      AXIS TECH SUPPLIES
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 36px 0;">
              <div style="height:2px;background:rgba(0,0,0,0.06);width:100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 4px 0 4px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:0 0 12px 0;">
                    <div style="font-family: Roboto, Arial, Helvetica, sans-serif; font-size:18px; color:#2b3942; font-weight:600;">
                      Your ATS Security Code:
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 28px 0;">
                    <div style="font-family: Roboto, Arial, Helvetica, sans-serif; font-size:56px; line-height:1; color:#17202a; font-weight:700; letter-spacing:3px;">
                      ${verificationCode}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 30px 0;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:14px; line-height:1.6; color:#4b5962;">
                      You’re receiving this email as part of a verification process to secure your account. This message is not promotional or marketing content.
                      Please use the verification code provided within <strong style="color:#111111;font-weight:700;">60 seconds</strong> to complete your authentication and ensure the safety of your information.
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 0 8px 0;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size:13px; line-height:1.5; color:#6b7280;">
                      If you did not request this code, you can safely ignore this email or contact support at <a href="mailto:support@axis.com" style="color:#4f46e5;text-decoration:none;">support@axis.com</a>.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td style="padding-top:40px;padding-bottom:18px;">
              <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#9aa3a9; text-align:center;">
                © 2025 Axis Tech Supplies
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
