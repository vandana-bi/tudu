import cloudinary from "../config/cloudinary.config.js";

export const uploadFileToCloudinary = async (fileBuffer, folder = "tudu") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
