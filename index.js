const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const os = require('os');
const {exec} = require('child_process');
const commands = require(path.join(__dirname, 'commands.json'));
const port = 3000
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let applicationMap = {};

app.get('/speech', async(req, res) => {

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

app.get('/speech/:id', async(req, res) => {

    console.log(req.baseUrl, req.path, req.params);
    let speech_word = req['params']['id'];

    const obj = {};
    speech_word = speech_word.trim();

    if (!Object.keys(applicationMap).length) {
        try {
            let applicationsStr =  await executeCmd("ls /usr/share/applications | awk -F '.desktop' ' { print $1}' -");
            if (applicationsStr.includes("\n")) {
                const applicationsStrFormat = applicationsStr.replace(/-/g, ' ').split("\n");
                applicationsStr = applicationsStr.split("\n");
                for(let i = 0; i < applicationsStrFormat.length; i++) {
                    applicationMap[applicationsStrFormat[i]] = applicationsStr[i];
                }
            }
        } catch(e) {
            console.log(e);
        }    
    }
    console.log(commands[speech_word], speech_word);
    if (commands[speech_word]) {
        try {
            obj['result'] = await executeCmd(commands[speech_word]);
        } catch(e) {
            console.log(e);
            obj['result'] = e;
        }
    } else if (speech_word.includes("open")) {
        const temp = speech_word.split('open');
        let applicationName = temp[temp.length - 1];
        try {
            applicationName = applicationName.trim();
            console.log(applicationName, applicationMap[applicationName], "==========");
            obj['result'] = await executeCmd(applicationMap[applicationName]);
        } catch(e) {
            console.log(e['Error']);
            obj['result'] = e;
        }
    } else if (speech_word.includes("kill")) {
        const temp = speech_word.split('kill');
        let applicationName = temp[temp.length - 1];
        try {
            applicationName = applicationName.trim();
            console.log(applicationName, applicationMap[applicationName], "==========");
            obj['result'] = await executeCmd(`killall ${applicationMap[applicationName]}`);
        } catch(e) {
            console.log(e['Error']);
            obj['result'] = e;
        }
    } else if (speech_word.includes("existing commands") || speech_word.includes("help")) {
        obj['result'] = Object.keys(commands).join("\n");
    } else if (speech_word.includes("home") || speech_word.includes("home directory")) {
        obj['result'] = os.homedir(); 
    } else if (speech_word.includes("username")) {
        obj['result'] = os.userInfo()['username']
    } else if (speech_word.includes("hostname")){
        obj['result'] = os.hostname();
    } else if (speech_word.includes("platform") || speech_word.includes("operating system")) {
        obj['result'] = os.type();
    } else if (speech_word.includes("architecture")) {
        obj['result'] = os.arch();
    } else {
        obj['result'] = "command not found";
    }

    // res.sendFile(path.join(__dirname+'/index.html'));
    res.send(obj);

});


function executeCmd(str) {
    return new Promise((resolve, reject) => {
        exec(`${str}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              reject(stderr);
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
            console.error(`stderr: ${stderr}`);
          });
    });
}

app.listen(port, () => console.log(`Example app listening on port 
${port}!`))