setTimeout(() => {

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.interimResults = true;

    recognition.continuous = true;



    let mic = document.querySelector("#circlein");
    let start_btn = document.getElementById('start_btn');
    let speechToText = "";

    const xhr = new XMLHttpRequest();
    const url = `http://127.0.0.1:3000/speech`;
    recognition.addEventListener("result", e => {
        let interimTranscript = '';
        for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
            let transcript = e.results[i][0].transcript;
            console.log(transcript, e.result)
            if (e.results[i].isFinal) {
                speechToText += transcript;
                if ((i + 1) == e.results.length) {
                    // create paragraph while speaking
                    let p = document.createElement("div");
                    p.classList.add("command");
                    let command = document.querySelector(".content");
                    p.innerHTML = transcript;
                    command.append(p);
                    fetchResponseToSpeech(xhr, url, transcript.toLowerCase());
                }
            } else {
                interimTranscript += transcript;
                if ((i + 1) == e.results.length) console.log("not final", transcript);
            }
        }


        recognition.addEventListener('soundend', (e) => {
            mic.style.backgroundColor = null;
            console.log('====on Sound end');
        });


        recognition.addEventListener('soundstart', (e) => {
            // mic.style.backgroundColor = null;
            console.log('===listening');
        });


        recognition.addEventListener('end', (e) => {
            // mic.style.backgroundColor = null;
            console.log('===stop');

            // recognition.start();
        });

        // create paragraph while speaking
        let p = document.createElement("div");
        p.classList.add("command");
        let command = document.querySelector(".content");
        p.innerHTML = interimTranscript;
        command.append(p);

        console.log("==1", speechToText, "==2", interimTranscript);
        // document.querySelector(".para").innerHTML = speechToText + interimTranscript
    })


    recognition.addEventListener("onend", (e) => {
        console.log(e, "on end==");
    });


    start_btn.addEventListener("click", () => {
        recognition.start();
        console.log("listening ======");
        mic.style.backgroundColor = "#6BD6E1"
    })

    stop_btn.addEventListener("click", () => {
        recognition.stop();
        mic.style.backgroundColor = null;
    });
}, 1000);


function fetchResponseToSpeech(xhr, url, transcript) {
    xhr.open("GET", `${url}/${transcript}`);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

    // 3. Send the request over the network
    xhr.send();

    // 4. This will be called after the response is received
    xhr.onload = function () {
        if (xhr.status != 200) { // analyze HTTP status of the response
            alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else { // show the result
            console.log(xhr.response);
            let pre = document.createElement("pre");
            pre.classList.add('reply');
            let response = document.querySelector(".content");
            pre.innerHTML = xhr.response['result'];
            response.append(pre);

            // document.querySelector(".reply").innerHTML = xhr.response['result'];
            // alert(`Done, got ${xhr.response} bytes`); // response is the server response
        }
    };

    xhr.onprogress = function (event) {
        // if (event.lengthComputable) {
        //     alert(`Received ${event.loaded} of ${event.total} bytes`);
        // } else {
        //     alert(`Received ${event.loaded} bytes`); // no Content-Length
        // }
    };

    xhr.onerror = function (err) {
        console.log(err);
        alert("Request failed");
    };
}