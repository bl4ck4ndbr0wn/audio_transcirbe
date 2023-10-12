import "./App.css";

import React, { useEffect, useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

import axios from "axios";
import useWebSocket from "react-use-websocket";
import logo from "./logo.svg";

const SOCKET_URL_ONE = "ws://127.0.0.1:8000/ws/transcribe/";

function App() {
  const [currentSocketUrl, setCurrentSocketUrl] = useState(null);
  const [audioMessageHistory, setAudidoMessageHistory] = useState([]);
  const { receive_json, getWebSocket } = useWebSocket(currentSocketUrl, {
    share: true,
    shouldReconnect: () => false,
  });

  useEffect(() => {
    setCurrentSocketUrl(SOCKET_URL_ONE);

    receive_json &&
      setAudidoMessageHistory((prev) => prev.concat(receive_json.data));
  }, [receive_json]);

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

      <span>The WebSocket is currently </span>

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
      <ul>
        {audioMessageHistory.map((message, idx) => (
          <li key={idx}>{message ? message : null}</li>
        ))}
      </ul>
      {receive_json}
    </div>
  );
}

export default App;
