import { Resend } from "resend";
import { formatCents } from "@/lib/bundles";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Nicho Halloween Festival <hello@nichohalloween.com.au>";

type OrderEmailParams = {
  to: string;
  name: string;
  orderNumber: string;
  tokens: number;
  amountPaid: number; // cents
};

export async function sendOrderConfirmation({
  to,
  name,
  orderNumber,
  tokens,
  amountPaid,
}: OrderEmailParams) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your Nicho Halloween tokens are confirmed. ${orderNumber}`,
    html: buildConfirmationHtml({ name, orderNumber, tokens, amountPaid }),
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}

// Plain, readable HTML email. No heavy template, no images to load.
// Matches the site's voice: warm, direct, no fluff.
function buildConfirmationHtml({
  name,
  orderNumber,
  tokens,
  amountPaid,
}: Omit<OrderEmailParams, "to">) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0; padding:0; background-color:#F4EBD9; font-family:Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4EBD9; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#EDE3CE; max-width:560px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1F2A20; padding:28px 32px;">
              <h1 style="margin:0; font-size:22px; color:#EDE3CE; font-family:Georgia, serif; letter-spacing:1px;">
                Nicho Halloween Festival
              </h1>
              <p style="margin:6px 0 0; font-size:12px; color:#A8AC9F; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:2px;">
                Saturday 24 October 2026 &middot; 3pm to 7pm
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px; font-size:17px; color:#1A1A1A; line-height:1.6;">
                Hi ${escapeHtml(name)},
              </p>
              <p style="margin:0 0 24px; font-size:17px; color:#1A1A1A; line-height:1.6;">
                You're all set. Here are your order details:
              </p>

              <!-- Order details box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4EBD9; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#5A6B4F; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:1px;">Order number</td>
                        <td style="padding:6px 0; font-size:17px; color:#1A1A1A; font-family:'Courier New', monospace; font-weight:bold; text-align:right;">${escapeHtml(orderNumber)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#5A6B4F; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:1px;">Tokens</td>
                        <td style="padding:6px 0; font-size:17px; color:#1A1A1A; font-family:Georgia, serif; text-align:right;">${tokens}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0; font-size:13px; color:#5A6B4F; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:1px;">Amount paid</td>
                        <td style="padding:6px 0; font-size:17px; color:#1A1A1A; font-family:Georgia, serif; text-align:right;">${formatCents(amountPaid)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 12px; font-size:16px; color:#B85C2E; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:2px;">
                How to collect
              </h2>
              <p style="margin:0 0 20px; font-size:16px; color:#3A3A3A; line-height:1.6;">
                Bring this email to the <strong>Token Booth</strong> at the festival entrance. Show your order number, and we'll hand you ${tokens} physical tokens. We can't wait to see you!
              </p>

              <p style="margin:0 0 8px; font-size:14px; color:#5A6B4F; line-height:1.5;">
                Nicholson Street Public School<br />
                23 Nicholson Street, Balmain East<br />
                Saturday 24 October 2026, 3pm to 7pm
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; border-top:1px dashed #A8AC9F;">
              <p style="margin:0; font-size:12px; color:#5A6B4F; line-height:1.5;">
                Tokens aren't redeemable for cash. Refunds are only available if the festival is cancelled. Questions? Reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Task assignment notification ───────────────────────

type TaskAssignmentParams = {
  to: string;
  assigneeName: string;
  assignerName: string;
  taskTitle: string;
  bucket: string;
  dueDate?: string | null;
};

export async function sendTaskAssignment({
  to,
  assigneeName,
  assignerName,
  taskTitle,
  bucket,
  dueDate,
}: TaskAssignmentParams) {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `New task: ${taskTitle}`,
    html: buildTaskAssignmentHtml({ assigneeName, assignerName, taskTitle, bucket, dueDate }),
  });

  if (error) {
    // Log but don't throw. Assignment notification is not critical
    // enough to block the task creation.
    console.error("Task assignment email failed:", error);
  }
}

function buildTaskAssignmentHtml({
  assigneeName,
  assignerName,
  taskTitle,
  bucket,
  dueDate,
}: Omit<TaskAssignmentParams, "to">) {
  const dueLine = dueDate
    ? `<p style="margin:0 0 8px; font-size:14px; color:#5A6B4F; font-family:'Courier New', monospace;">Due: ${escapeHtml(new Date(dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }))}</p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Task Assigned</title>
</head>
<body style="margin:0; padding:0; background-color:#F4EBD9; font-family:Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4EBD9; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#EDE3CE; max-width:560px; width:100%;">
          <tr>
            <td style="background-color:#1F2A20; padding:28px 32px;">
              <h1 style="margin:0; font-size:22px; color:#EDE3CE; font-family:Georgia, serif; letter-spacing:1px;">
                Nicho Halloween Festival
              </h1>
              <p style="margin:6px 0 0; font-size:12px; color:#A8AC9F; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:2px;">
                Task assigned to you
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px; font-size:17px; color:#1A1A1A; line-height:1.6;">
                Hi ${escapeHtml(assigneeName)},
              </p>
              <p style="margin:0 0 24px; font-size:17px; color:#1A1A1A; line-height:1.6;">
                ${escapeHtml(assignerName)} assigned you a task:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4EBD9; margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px; font-size:19px; color:#1A1A1A; font-weight:bold; line-height:1.4;">
                      ${escapeHtml(taskTitle)}
                    </p>
                    <p style="margin:0 0 8px; font-size:13px; color:#B85C2E; font-family:'Courier New', monospace; text-transform:uppercase; letter-spacing:1px;">
                      ${escapeHtml(bucket)}
                    </p>
                    ${dueLine}
                  </td>
                </tr>
              </table>
              <p style="margin:0; font-size:15px; color:#3A3A3A; line-height:1.6;">
                Head to the admin dashboard to see the full details.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; border-top:1px dashed #A8AC9F;">
              <p style="margin:0; font-size:12px; color:#5A6B4F; line-height:1.5;">
                You're receiving this because you're on the Nicho Halloween Festival committee.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
