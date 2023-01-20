const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2

//storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

//main upload

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const imageSupport = /png|jpg/;

    const ext = path.extname(file.originalname);

    if (imageSupport.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("png and jpg only"));
    }
  },
  limits: {
    fileSize: 5000000,
  },
});

const app = express();

app.use(express.json());
app.use(cors());

app.use("/upload", express.static(path.join(__dirname, "uploads")));

mongoose.set("strictQuery", false);

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/multerLearning");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

main()
  .then(() => console.log("connect successfully.."))
  .catch((err) => console.log(err));

const multerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: {
    type: String,
    required: true,
  },
});

const ModelMulter = mongoose.model("ModelMulter", multerSchema);

app.get("/", async (req, res) => {
  try {
    const value = await ModelMulter.find({});

    res.send({
      status: "success",
      value,
    });
  } catch (error) {}

  res.send("hellow");
});

app.post("/", upload.single("images"), async (req, res) => {
  const url = req.protocol + "://" + req.get("host");
  const img = url + "/upload/" + req.file.filename;

  try {
    const value = {
      name: req.body.name,
      images :img,
    };

    const data =await ModelMulter.create(value);

    res.send({
      status: "success",
      // data,
      value,
    });
  } catch (error) {
    res.send({
      message: error.message,
    });
  }
});

app.listen(4000);
