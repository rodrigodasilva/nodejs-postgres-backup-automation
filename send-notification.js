import { resend } from './resend.js'

async function sendNotification({ subject, text }) {
  return resend.emails.send({
    from: `Logempenho <hello@resend.dev>`,
    to: process.env.NOTIFICATION_DESTINATION_EMAIL,
    subject,
    text
  })
}

export { sendNotification }