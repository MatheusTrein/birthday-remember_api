import path from "path";
import crypto from "crypto";
import multer, { StorageEngine } from "multer";

const tmpFolder = path.join(__dirname, "..", "..", "tmp");

interface IUploadConfig {
  driver: "disk" | "s3";

  tmpFolder: string;
  uploadFolder: string;

  multer: {
    storage: StorageEngine;
  };

  config: {
    disk: {};
    aws: {
      bucket: string;
      region: string;
    };
  };
}

export default {
  driver:
    process.env.NODE_ENV === "test"
      ? "disk"
      : process.env.STORAGE_DRIVER || "disk",
  tmpFolder,
  uploadFolder: path.resolve(tmpFolder, "upload"),
  config: {
    disk: {},
    aws: {
      bucket: process.env.AWS_S3_AVATARS_BUCKETS,
      region: process.env.AWS_REGION,
    },
  },
  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename(request, file, callback) {
        let fileName = file.originalname.replace(/\s/g, "");
        const fileHash = crypto.randomBytes(10).toString("hex");
        fileName = `${fileHash}-${fileName}`;
        return callback(null, fileName);
      },
    }),
  },
} as IUploadConfig;
