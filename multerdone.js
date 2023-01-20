// require the installed packages 
const express = require('express')
const multer = require('multer');
const fs = require('file-system');
//CREATE EXPRESS APP 
const app = express();

const multerSchema = new mongoose.Schema({
  
  image: {
    type: String,
    required: true,
  },
});

const ModelMulter = mongoose.model("ModelMulter", multerSchema);


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })


app.post('/uploadfile', upload.single('image'),async (req, res, next) => {
  const file = req.file

  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }


  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString('base64');

  // Define a JSONobject for the image attributes for saving to database 
  var finalImg = {
      contentType: req.file.mimetype,
      image: Buffer.from(encode_image, 'base64')
  };

  const data = await ModelMulter.create(finalImg);
  
    res.send({
      value:"success",
    })
 
})


//ROUTES WILL GO HERE 
app.get('/', function(req, res) {
    res.json({ message: 'WELCOME' });   
});
app.listen(3000, () => 
    console.log('Server started on port 3000')
);