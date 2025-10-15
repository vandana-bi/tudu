import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI,
  GMAIL_REFRESH_TOKEN,
  SENDER_EMAIL,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

export async function sendMail({ to, subject, text, html }) {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token || accessTokenResponse;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: `Tudu <${SENDER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw new Error("Error sending meil!");
  }
}
