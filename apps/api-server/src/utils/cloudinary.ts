import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: any, folder: string) => {
  const { createReadStream, filename } = await file;

  return new Promise<{ url: string; public_id: string; format: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          public_id: filename.split(".")[0],
        },
        (error, result) => {
          if (error || !result) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
            });
          }
        }
      );

      createReadStream().pipe(stream);
    }
  );
};
