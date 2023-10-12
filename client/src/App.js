import "./App.css";

import React, { useEffect, useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

import axios from "axios";
import useWebSocket from "react-use-websocket";
import logo from "./logo.svg";

const SOCKET_URL_ONE = "ws://127.0.0.1:8000/ws/transcribe";
const READY_STATE_OPEN = 1;

let gumStream = null;
let recorder = null;
let audioContext = null;

function App() {
  const [currentSocketUrl, setCurrentSocketUrl] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [audioMessageHistory, setAudidoMessageHistory] = useState([]);
  const [inputtedMessage, setInputtedMessage] = useState("");
  const { sendMessage, lastMessage, readyState, receive_json, getWebSocket } =
    useWebSocket(currentSocketUrl, {
      share: true,
      shouldReconnect: () => false,
    });

  useEffect(() => {
    setCurrentSocketUrl(SOCKET_URL_ONE);

    lastMessage && setMessageHistory((prev) => prev.concat(lastMessage.data));

    receive_json &&
      setAudidoMessageHistory((prev) => prev.concat(receive_json.data));
  }, [lastMessage, receive_json]);

  const readyStateString = {
    0: "CONNECTING",
    1: "OPEN",
    2: "CLOSING",
    3: "CLOSED",
  }[readyState];

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err) // onNotAllowedOrFound
  );
  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);

    console.log("uploading...");

    const formData = new FormData();

    formData.append("file", blob);

    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    axios.post("http://127.0.0.1:8000/api/recorder/files/", formData, config);
  };

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <p>Audio Recorder and Transcriber</p>

      <span>The WebSocket is currently {readyStateString}</span>

      <div>
        <AudioRecorder
          onRecordingComplete={(blob) => addAudioElement(blob)}
          recorderControls={recorderControls}
          // downloadOnSavePress={true}
          // downloadFileExtension="mp3"
          showVisualizer={true}
        />
        <br />
      </div>

      <div>
        <input
          type={"text"}
          value={inputtedMessage}
          onChange={(e) => setInputtedMessage(e.target.value)}
        />
        <button
          onClick={() => sendMessage(inputtedMessage)}
          disabled={readyState !== READY_STATE_OPEN}
        >
          Send
        </button>
      </div>
      {/* <ul>
        {messageHistory.map((message, idx) => (
          <li key={idx}>{message ? message : null}</li>
        ))}
      </ul> */}
      {receive_json}
    </div>
  );
}

export default App;
