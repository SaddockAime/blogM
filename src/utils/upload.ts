import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
config();

const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
const cloudinary_api_cloud_name = process.env.CLOUDINARY_API_NAME;

cloudinary.config({
  cloud_name: cloudinary_api_cloud_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
  secure: true,
});

export const uploadFile = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided for upload"));
      return;
    }

    // Use buffer instead of file path for memory storage
    cloudinary.uploader.upload_stream(
      {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("No secure URL returned from Cloudinary"));
          return;
        }
        resolve(result.secure_url);
      }
    ).end(file.buffer);
  });
};
