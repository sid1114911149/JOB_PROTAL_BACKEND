const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// ✅ file filter (PDF for resume, image for profile)
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "resume") {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Resume must be PDF"), false);
        }
    } else if (file.fieldname === "profilePhoto") {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Profile must be image"), false);
        }
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024   // ✅ 500KB limit
    }
});

module.exports = upload;