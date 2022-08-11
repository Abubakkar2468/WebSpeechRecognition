const express = require('express')
// const { spawn } = require('child_process');
const app = express()
const path = require('path')
const cors = require('cors')
const os = require('os');
const port = 3000
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))
app.get('/speech', (req, res) => {

    console.log(req.baseUrl, req.path, req.params);

    // console.log(os.userInfo());
    // var dataToSend;
    // // spawn new child process to call the python script
    // const python = spawn('python', ['script1.py']);
    // // collect data from script
    // python.stdout.on('data', function (data) {
    //     console.log('Pipe data from python script ...');
    //     dataToSend = data.toString();
    // });
    // // in close event we are sure that stream from child process is closed
    // python.on('close', (code) => {
    //     console.log(`child process close all stdio with code ${code}`);
    //     // send data to browser
    //     res.send(dataToSend)
    // });
    // res.header("Content-Type", "text/css; text/html; text/javascript");
    // res.sendFile(path.join(__dirname+'/index.html'));
    res.sendFile(path.join(__dirname, 'index.html'))

});

app.get('/speech/:id', (req, res) => {

    console.log(req.baseUrl, req.path, req.params);
    const speech_word = req['params']['id'];

    const obj = {};

    if (speech_word.includes("home") || speech_word.includes("home directory")) {
        obj['result'] = os.userInfo()['homedir']; 
    } else if (speech_word.includes("username")) {
        obj['result'] = os.userInfo()['username']
    } else {
        obj['result'] = "command not found";
    }

    // res.sendFile(path.join(__dirname+'/index.html'));
    res.send(obj);

});
app.listen(port, () => console.log(`Example app listening on port 
${port}!`))