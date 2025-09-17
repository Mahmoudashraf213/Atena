// import module
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import multer, { diskStorage } from "multer";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif", "image/jpg",  "image/webp", "image/svg+xml", "image/tiff", "image/bmp", "image/AVIF"],
};

export const fileUpload = ({ folder, allowFile = fileValidation.image }) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const fullpath = path.resolve(`uploads/${folder}`);
      if (!fs.existsSync(fullpath)) {
        fs.mkdirSync(fullpath, { recursive: true });
      }
      cb(null, fullpath);
    },
    filename: (req, file, cb) => {
      cb(null, nanoid() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    // console.log("File mimetype:", file.mimetype);
    if (allowFile.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("invalid file format"), false);  //todo add this messege in constant 
  };

  return multer({ storage, fileFilter });
};