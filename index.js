const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
// https://nayeem-multer-backend.up.railway.app/
// http://localhost:3000

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

mongoose.set("strictQuery", true);

async function main() {
  const uri =
    "mongodb+srv://connect-db:1xp5KCxVCGVC2QgE@cluster0.teacx.mongodb.net/multerLearning";
  await mongoose.connect(uri);

  // await mongoose.connect("mongodb+srv://connect-db:1xp5KCxVCGVC2QgE@cluster0.teacx.mongodb.net/multerLearning");
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
  console.log(img)
  res.send(img);
  // try {
  //   const value = {
  //     name: req.body.name,
  //     images: img,
  //   };

  //   const data = new ModelMulter(value);
  //   const result = await data.save();

  //   // const data =await ModelMulter.create(value);

  //   res.send({
  //     status: "success",
  //     // data,
  //     value,
  //   });

  // } catch (error) {
  //   res.send({
  //     message: error.message,
  //   });
  // }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
// https://nayeem-multer-backend.up.railway.app/
