type OtpTemplateParams = {
  otp: string;
};

export function otpEmailTemplate({ otp }: OtpTemplateParams) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your email</title>
      <style>
        body {
          background-color: #f8fafc;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          padding: 48px 24px 56px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          padding: 48px 40px 44px;
          text-align: center;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          margin: 0 auto 28px;
          border-radius: 28px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.6px;
        }
        .title {
          font-size: 26px;
          font-weight: 600;
          margin: 6px 0 12px;
          color: #0f172a;
        }
        .subtitle {
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .otp-box {
          display: inline-flex;
          gap: 12px;
          padding: 18px 26px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1px solid #cbd5f5;
          letter-spacing: 8px;
          font-size: 28px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 18px;
        }
        .meta {
          color: #64748b;
          font-size: 13px;
          margin-top: 24px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="brand-mark">Edupeak</div>
          <h1 class="title">Verify your email address</h1>
          <p class="subtitle">
            Enter the one-time passcode below to continue signing in to
            Edupeak. The code expires in 10 minutes for your security.
          </p>
          <div class="otp-box">${otp}</div>
          <p class="subtitle" style="margin-bottom: 6px;">
            If you did not initiate this, ignore this email.
          </p>
          <div class="meta">
            Need help? Reply to this email or contact
            <a href="mailto:sohag.zayan@gmail.com" style="color: #2563eb;">
              sohag.zayan@gmail.com
            </a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Edupeak. All rights
          reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

type FollowUpEmailParams = {
  to: string;
  studentName: string;
  courseName: string;
};

export function followUpEmailTemplate({
  studentName,
  courseName,
}: Omit<FollowUpEmailParams, "to">) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Continue Your Learning Journey</title>
      <style>
        body {
          background-color: #f8fafc;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          padding: 48px 24px 56px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          padding: 48px 40px 44px;
        }
        .title {
          font-size: 26px;
          font-weight: 600;
          margin: 6px 0 12px;
          color: #0f172a;
        }
        .subtitle {
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1 class="title">Hi ${studentName}!</h1>
          <p class="subtitle">
            We noticed you haven't been active in "${courseName}" recently. 
            Don't miss out on completing your learning journey!
          </p>
          <p class="subtitle">
            Continue where you left off and unlock your full potential.
          </p>
          <a href="#" class="button">Continue Learning</a>
          <p class="subtitle" style="margin-top: 24px; font-size: 13px; color: #64748b;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function sendFollowUpEmail(params: FollowUpEmailParams): Promise<void> {
  // TODO: Implement actual email sending using your email service (Resend, Brevo, etc.)
  // For now, this is a placeholder
  console.log("Sending follow-up email to:", params.to);
  console.log("Email template:", followUpEmailTemplate(params));
  // Example implementation:
  // await resend.emails.send({
  //   from: 'noreply@edupeak.com',
  //   to: params.to,
  //   subject: `Continue Your Learning: ${params.courseName}`,
  //   html: followUpEmailTemplate(params),
  // });
}

type InvitationEmailParams = {
  invitationLink: string;
  role: string;
  inviterName?: string;
};

export function invitationEmailTemplate({
  invitationLink,
  role,
  inviterName,
}: InvitationEmailParams) {
  const roleDisplay = role === "SuperAdmin" ? "Super Admin" : role;
  
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>You've been invited to join Edupeak</title>
      <style>
        body {
          background-color: #f8fafc;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          padding: 48px 24px 56px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          padding: 48px 40px 44px;
          text-align: center;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          margin: 0 auto 28px;
          border-radius: 28px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.6px;
        }
        .title {
          font-size: 26px;
          font-weight: 600;
          margin: 6px 0 12px;
          color: #0f172a;
        }
        .subtitle {
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .role-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 12px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          margin: 20px 0;
        }
        .meta {
          color: #64748b;
          font-size: 13px;
          margin-top: 24px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="brand-mark">Edupeak</div>
          <h1 class="title">You've been invited!</h1>
          <p class="subtitle">
            ${inviterName ? `${inviterName} has ` : "You have been "}invited to join Edupeak as a <strong>${roleDisplay}</strong>.
          </p>
          <div class="role-badge">${roleDisplay}</div>
          <p class="subtitle">
            Click the button below to accept the invitation and get started. This invitation will expire in 7 days.
          </p>
          <a href="${invitationLink}" class="button">Accept Invitation</a>
          <p class="meta">
            Or copy and paste this link into your browser:<br />
            <a href="${invitationLink}" style="color: #2563eb; word-break: break-all;">
              ${invitationLink}
            </a>
          </p>
          <p class="meta" style="margin-top: 24px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <div class="meta">
            Need help? Reply to this email or contact
            <a href="mailto:sohag.zayan@gmail.com" style="color: #2563eb;">
              sohag.zayan@gmail.com
            </a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Edupeak. All rights
          reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}


