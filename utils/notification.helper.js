import { sendMail } from "../utils/mailer.js";

export const sendSignupNotification = async (user) => {
  return await sendMail({
    to: user.email,
    subject: "🎉 Welcome to Tudu",
    text: `Hi ${user.name},\n\nYou have successfully signed up for Tudu. 🎉\n\nStay productive,\nTeam Tudu`,
  });
};
