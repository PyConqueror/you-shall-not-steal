import { Resend } from "resend";
import { AppError } from "@/errors/app-error";
import type { PackageDocument } from "@/types/documents";

type SendPickupDetailsEmailInput = {
  resendApiKey: string;
  from: string;
  customerEmail: string;
  agentId: string;
  packageRecord: PackageDocument;
  lockerId: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPackageSize(packageSize: string) {
  return packageSize.charAt(0).toUpperCase() + packageSize.slice(1);
}

function buildDropoffEmailText({
  agentId,
  packageRecord,
  lockerId,
}: Pick<SendPickupDetailsEmailInput, "agentId" | "packageRecord" | "lockerId">) {
  return [
    "Your package has been dropped off successfully.",
    "",
    `Agent ID: ${agentId}`,
    `Locker ID: ${lockerId}`,
    `Pickup Code: ${packageRecord.pickupCode}`,
    `Package Size: ${packageRecord.packageSize}`,
    "",
    "Storage charges:",
    "- First 24 hours: Free",
    "- First 5 days after that: RM2/day",
    "- Next 5 days: RM4/day",
    "- After 10 days: RM6/day",
  ].join("\n");
}

function buildDropoffEmailHtml({
  agentId,
  packageRecord,
  lockerId,
}: Pick<SendPickupDetailsEmailInput, "agentId" | "packageRecord" | "lockerId">) {
  const packageSize = escapeHtml(formatPackageSize(packageRecord.packageSize));
  const pickupCode = escapeHtml(packageRecord.pickupCode);
  const safeAgentId = escapeHtml(agentId);
  const safeLockerId = escapeHtml(lockerId);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your package is ready for pickup</title>
  </head>
  <body style="margin:0; padding:0; background-color:#fff7df; font-family:Arial, Helvetica, sans-serif; color:#5b4313;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(180deg, #fffdf3 0%, #fff3c9 100%); padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px; background-color:#fffefa; border-radius:24px; overflow:hidden; border:1px solid rgba(239, 201, 95, 0.35);">
            <tr>
              <td style="padding:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(180deg, #f4ffd9 0%, #c9f38a 100%); text-align:center;">
                  <tr>
                    <td style="padding:32px 28px 28px;">
                      <div style="display:inline-block; padding:6px 14px; border-radius:999px; background-color:rgba(47, 93, 12, 0.12); color:#2f5d0c; font-size:12px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase;">
                        Success
                      </div>
                      <h1 style="margin:16px 0 12px; color:#2f5d0c; font-size:32px; line-height:1.2;">
                        Package safely stored!
                      </h1>
                      <p style="margin:0; font-size:18px; line-height:1.6; color:#5b4313;">
                        Package dropped off successfully.<br />
                        <strong>Use this pickup code to collect the package.</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fffdf7; border:3px solid rgba(239, 201, 95, 0.48); border-radius:20px;">
                  <tr>
                    <td style="padding:20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="padding:0 0 10px; font-size:16px; line-height:1.6;">
                            <strong>Agent ID:</strong> ${safeAgentId}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 10px; font-size:16px; line-height:1.6;">
                            <strong>Package Size:</strong> ${packageSize}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 10px; font-size:16px; line-height:1.6;">
                            <strong>Locker ID:</strong> ${safeLockerId}
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:18px; border-radius:16px; background:linear-gradient(180deg, #fff8dc 0%, #ffe8a2 100%);">
                        <tr>
                          <td style="padding:18px; text-align:center;">
                            <div style="color:#8b6a2d; font-size:12px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase; margin-bottom:8px;">
                              Pickup Code
                            </div>
                            <div style="color:#f77f00; font-size:40px; font-weight:900; letter-spacing:4px; line-height:1.1;">
                              ${pickupCode}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 20px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fffdf7; border:3px solid rgba(239, 201, 95, 0.48); border-radius:20px;">
                  <tr>
                    <td style="padding:20px;">
                      <h2 style="margin:0 0 12px; color:#f77f00; font-size:22px; line-height:1.3;">
                        Storage charges may apply
                      </h2>
                      <p style="margin:0 0 14px; color:#8b6a2d; font-size:15px; line-height:1.7;">
                        Packages are free to store for the first 24 hours.<br />
                        After that, storage charges are calculated daily.
                      </p>
                      <ul style="margin:0; padding-left:18px; color:#5b4313; font-size:15px; line-height:1.8;">
                        <li><strong>First 5 days:</strong> RM2/day</li>
                        <li><strong>Next 5 days:</strong> RM4/day</li>
                        <li><strong>After 10 days:</strong> RM6/day</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 28px; text-align:center; color:#8b6a2d; font-size:13px; line-height:1.6;">
                Keep this email for your records and present the pickup code when collecting the package.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export async function sendPickupDetailsEmail({
  resendApiKey,
  from,
  customerEmail,
  agentId,
  packageRecord,
  lockerId,
}: SendPickupDetailsEmailInput) {
  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from,
      to: customerEmail,
      subject: "Your package is ready for pickup",
      html: buildDropoffEmailHtml({
        agentId,
        packageRecord,
        lockerId,
      }),
      text: buildDropoffEmailText({
        agentId,
        packageRecord,
        lockerId,
      }),
    });

    if (error) {
      throw new AppError({
        code: "CUSTOMER_EMAIL_SEND_FAILED",
        message: "We couldn't send the email right now. Please try again.",
        statusCode: 502,
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError({
      code: "CUSTOMER_EMAIL_SEND_FAILED",
      message: "We couldn't send the email right now. Please try again.",
      statusCode: 502,
    });
  }
}
