const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

//firebase config
const firebase = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('./fileuploader.json');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: "gs://fileuploader-901cb.appspot.com"
});

// Get a reference to the storage service
const Firestorage = firebase.storage();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
//   },
// });

const storage = multer.memoryStorage()

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
  // const url = req.protocol + "://" + req.get("host");
  // const img = url + "/upload/" + req.file.filename;
  console.log(req.file)


  const fileRef = Firestorage.bucket().file(`images/${req.file.originalname}`);

  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  // Write the file to Firebase
  stream.on('error', (err) => {
    console.error(err);
    res.status(500).send(err);
  });

  stream.on('finish',async () => {

     imageURL = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    res.send(imageURL);

    // console.log(`File ${req.file.originalname} uploaded successfully.`);

  });

  stream.end(req.file.buffer);


  // res.send({
  //   status: "success",
  //   upload : uploadDone(),
  //   // name : req.body.name
  // });
  
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
// https://nayeem-multer-backend.up.railway.app/

// memory address  verify that what type things i need 

// const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).single('file');

// app.post('/upload', (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(400).send(err);
//     }

//     if (!acceptedImageTypes.includes(req.file.mimetype)) {
//       return res.status(415).send('Invalid file type. Only jpeg, jpg and png images are accepted.');
//     }

//     // continue with the rest of your code
//   });
// });
