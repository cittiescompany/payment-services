import admin from 'firebase-admin';
import 'dotenv/config';
import multer from 'multer';
import sharp from 'sharp';
import axios from 'axios';
import path, {dirname} from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { s3Client } from './utilis.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILE_SIZE_LIMITS = {
  is_video: 2 * 1024 * 1024 * 1024, // 2GB for videos
  is_image: 1 * 1024 * 1024 * 1024, // 1GB for images
  is_pdf: 20 * 1024 * 1024, // 20MB for PDFs
};

// Define the allowed MIME types\

const VALID_MIME_TYPES = {
  is_video: [
    'video/mp4',
    'video/avi',
    'video/mkv',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mpg',
    'video/mpeg',
    'video/m4v',
    'video/3gp',
    'video/3g2',
    'video/f4v',
    'video/f4p',
    'video/f4a',
    'video/f4b',
    'video/ogv',
    'video/mxf',
    'video/vob',
    'video/rm',
  ],
  is_image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream',
  ],
};

const MIME_TYPES = {
  mp4: "video/mp4",
  avi: "video/avi",
  mkv: "video/mkv",
  mov: "video/mov",
  wmv: "video/wmv",
  flv: "video/flv",
  webm: "video/webm",
  mpg: "video/mpg",
  mpeg: "video/mpeg",
  m4v: "video/m4v",
  "3gp": "video/3gp",
  "3g2": "video/3g2",
  f4v: "video/f4v",
  f4p: "video/f4p",
  f4a: "video/f4a",
  f4b: "video/f4b",
  ogv: "video/ogv",
  mxf: "video/mxf",
  vob: "video/vob",
  rm: "video/rm",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  svg: "image/svg+xml",
};

const correctMimeType = (file) => {
  const ext = file.originalname.split(".").pop()?.toLowerCase();
  return MIME_TYPES[ext] ?? 
    (VALID_MIME_TYPES.is_image.includes(file.mimetype) 
      ? file.mimetype 
      : "application/octet-stream");
};

export const upload = multer({
  fileFilter: (req, file, cb) => {
    let validTypes = [];
    for (const type in VALID_MIME_TYPES) {
      validTypes = validTypes.concat(VALID_MIME_TYPES[type]);
    }
    if (!validTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Please upload a valid file.'));
    }
    if (file.size > 2147483648) {
      return cb(new Error('Invalid file type. Please upload a valid file.'));
    }
    cb(null, true);
  },
  limits: {
    fieldSize: 2147483648,
  },
});

export const uploadImage = (file, folderName = 'images') => {
  return new Promise(async (resolve, reject) => {
    try {
      let maxFileSize = 0;
      let data = {
        is_video: false,
        is_pdf: false,
        is_image: false,
      };
      file.mimetype = correctMimeType(file);
      for (const type in VALID_MIME_TYPES) {
        if (VALID_MIME_TYPES[type].includes(file.mimetype)) {
          maxFileSize = FILE_SIZE_LIMITS[type];
          let is_true = false;
          Object.keys(data).map((val) => {
            is_true = type == val;
            data[val] = type == val;
          });
          if (is_true) {
            break;
          }
        }
      }
      if (file.size > maxFileSize) {
        return reject('File size exceeds limit. Please upload a smaller file.');
      }
      const filePath = `${folderName}/${randomUUID()}${(file.originalname || file.filename).split(' ').join('-')}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${filePath}`;

      return resolve({ media: url, ...data });
    } catch (error) {
      reject('failed to upload the file' + error.message);
    }
  });
};

export const reSizeImage = (file, width = 300, height = 300) => {
  return new Promise((resolve, reject) => {
    sharp(file)
      .resize({ width, height }) // Adjust dimensions as needed
      .toBuffer()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        console.log(error.message);
        reject('error 000');
      });
  });
};
export async function uploadImageFromUrl(imageUrl, fileName) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType:response.headers["content-type"],
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;
    return url;
  } catch (error) {
    console.error("Error uploading image:", error.message);
    throw new Error("Failed to upload image to S3");
  }
}