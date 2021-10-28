const express = require('express');
const settings = require('./settings.json');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const app = express();

// Get entropy status based on configured thresholds
function getEntropyStatus( entropySize ) {
  if ( entropySize < settings.thresholds.critical ) {
    return "CRITICAL"
  } else if ( entropySize < settings.thresholds.warning ) {
    return "WARNING"
  } else {
    return "NORMAL"
  }
};

function getFileSizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

app.use(fileUpload({createParentPath:true}));
app.use(express.urlencoded());
app.use(express.json());

// Serve the files on port 3000.
app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});

app.get('/express-uploader', function(req,res){
  res.sendFile('views/upload.html', {root:__dirname});
});

app.post('/send-new', function(req,res) {
  console.log( "Client requested new file : " + req.body.newfile );
  const newFile = req.body.newfile;
  if ( newFile ) {
    if ( fs.access(newFile) ) {
      console.log( "About to copy " + newFile + " " + getFileSizeInBytes(newFile) + " Bytes");
      fs.copyFileSync(newFile,settings.destination + '/' + settings.entropyFile);
      console.log( "Completed copy of " + newFile);
      const response = buildEntropyStatusResponse();
      res.status(200).send(JSON.stringify(response));
    } else {
      console.log( "Could not access " + newFile);
      res.status(404); // Return file does not exist
    }
  } else {
    console.log( "Bad request " + req.body);
    res.status(500); // Return server error
  }
});

function buildEntropyStatusResponse() {
  // Get the size of the entropy file
  const entropySize = getFileSizeInBytes(settings.destination + '/' + settings.entropyFile);
  const entropyStatus = getEntropyStatus( entropySize );
  const response = { 
    entropySize : entropySize,
    entropyStatus : entropyStatus
  }
  return response;
}

// Endpoint to return entropy status
app.get('/entropy-status', function(req,res){
  console.log( 'INFO : Client requested status report, response was');
  const response = buildEntropyStatusResponse();
  console.log( response );
  res.status(200).send( JSON.stringify(response) );
});

// express-uploader backend
app.post('/upload',function(req,res){
  let newFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field on the form is used to retrieve the uploaded file
  newFile = req.files.newFile;
  if ( settings.entropyFile ) {
    uploadPath = settings.destination + '/' + settings.entropyFile;
  } else { 
    // No name change
    uploadPath = settings.destination + '/' + req.files.newFile.name;
  }

  // Use the mv() method to place the file somewhere on your server
  newFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send(uploadPath + ' - Upload complete');
  });
});
