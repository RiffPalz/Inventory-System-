import multer from "multer";
import path from "path";

// ensure uploads folder exists
import fs from "fs";
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
    },
});

// OPTIONAL: restrict to images only
const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image uploads are allowed"), false);
};

// OPTIONAL: size limit (3 MB)
const limits = {
    fileSize: 3 * 1024 * 1024, // 3MB
};

export const upload = multer({
    storage,
    fileFilter,
    limits,
});
