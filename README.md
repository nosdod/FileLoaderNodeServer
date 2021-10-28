** File Loader concept apps

Run server.js from within Code
Open a browser at http://localhost:3000/entropy-status to see status response.
http://localhost:3000/send-file endpoint expects a POST request with a body containg '{ newfile : <filename>}'
The server code copies the file to the file set in the settings file. It then returns the new entropy-status value.

This is the server side for the Concept Powershell GUI which is in the 'FileLoaderPowershell' repository

There is a second application within the code, which is the earlier web based fileuploader.
http://localhost:3000/express-uploader brings up a form where you select a file and the click Upload.
The selected file is uploaded to the server and saved in thame location as above.