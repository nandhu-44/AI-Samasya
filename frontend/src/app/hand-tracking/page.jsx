"use client";

import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";

const HandSignDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [detectedSign, setDetectedSign] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let intervalId;

    const runHandpose = async () => {
      await tf.ready(); // Ensure TensorFlow.js is ready
      const net = await handpose.load();
      console.log("Handpose model loaded.");

      if (isDetecting) {
        intervalId = setInterval(() => {
          detect(net);
        }, 100); // Adjust interval as needed
      }

      return () => {
        clearInterval(intervalId);
      };
    };

    if (isDetecting) {
      runHandpose();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isDetecting]);

  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (hand.length > 0) {
        drawHand(hand, ctx);
        const posList = hand[0].landmarks;
        const result = recognizeSign(posList);
        setDetectedSign(result);
      } else {
        setDetectedSign("");
      }
    }
  };

  const drawHand = (predictions, ctx) => {
    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;

      for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 3 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  const recognizeSign = (posList) => {
    let result = "";
    const fingers = [];

    const finger_mcp = [5, 9, 13, 17];
    const finger_dip = [6, 10, 14, 18];
    const finger_pip = [7, 11, 15, 19];
    const finger_tip = [8, 12, 16, 20];

    for (let id = 0; id < 4; id++) {
      if (posList[finger_tip[id]][1] + 25 < posList[finger_dip[id]][1] && posList[16][2] < posList[20][2]) {
        fingers.push(0.25);
      } else if (posList[finger_tip[id]][2] > posList[finger_dip[id]][2]) {
        fingers.push(0);
      } else if (posList[finger_tip[id]][2] < posList[finger_pip[id]][2]) {
        fingers.push(1);
      } else if (posList[finger_tip[id]][1] > posList[finger_pip[id]][1] && posList[finger_tip[id]][1] > posList[finger_dip[id]][1]) {
        fingers.push(0.5);
      }
    }

    if (posList[3][2] > posList[4][2] && posList[3][1] > posList[6][1] && posList[4][2] < posList[6][2] && fingers.filter(f => f === 0).length === 4) {
      result = "A";
    } else if (posList[3][1] > posList[4][1] && fingers.filter(f => f === 1).length === 4) {
      result = "B";
    } else if (posList[3][1] > posList[6][1] && fingers.filter(f => f === 0.5).length >= 1 && posList[4][2] > posList[8][2]) {
      result = "C";
    } else if (fingers[0] === 1 && fingers.filter(f => f === 0).length === 3 && posList[3][1] > posList[4][1]) {
      result = "D";
    } else if (posList[3][1] < posList[6][1] && fingers.filter(f => f === 0).length === 4 && posList[12][2] < posList[4][2]) {
      result = "E";
    } else if (fingers.filter(f => f === 1).length === 3 && fingers[0] === 0 && posList[3][2] > posList[4][2]) {
      result = "F";
    } else if (fingers[0] === 0.25 && fingers.filter(f => f === 0).length === 3) {
      result = "G";
    } else if (fingers[0] === 0.25 && fingers[1] === 0.25 && fingers.filter(f => f === 0).length === 2) {
      result = "H";
    } else if (posList[4][1] < posList[6][1] && fingers.filter(f => f === 0).length === 3 && fingers.length === 4 && fingers[3] === 1) {
      result = "I";
    } else if (posList[4][1] < posList[6][1] && posList[4][1] > posList[10][1] && fingers.filter(f => f === 1).length === 2) {
      result = "K";
    } else if (fingers[0] === 1 && fingers.filter(f => f === 0).length === 3 && posList[3][1] < posList[4][1]) {
      result = "L";
    } else if (posList[4][1] < posList[16][1] && fingers.filter(f => f === 0).length === 4) {
      result = "M";
    } else if (posList[4][1] < posList[12][1] && fingers.filter(f => f === 0).length === 4) {
      result = "N";
    } else if (posList[4][1] > posList[12][1] && posList[4][2] < posList[6][2] && fingers.filter(f => f === 0).length === 4) {
      result = "T";
    } else if (posList[4][1] > posList[12][1] && posList[4][2] < posList[12][2] && fingers.filter(f => f === 0).length === 4) {
      result = "S";
    } else if (posList[4][2] < posList[8][2] && posList[4][2] < posList[12][2] && posList[4][2] < posList[16][2] && posList[4][2] < posList[20][2]) {
      result = "O";
    } else if (fingers[2] === 0 && posList[4][2] < posList[12][2] && posList[4][2] > posList[6][2] && fingers.length === 4 && fingers[3] === 0) {
      result = "P";
    } else if (fingers[1] === 0 && fingers[2] === 0 && fingers[3] === 0 && posList[8][2] > posList[5][2] && posList[4][2] < posList[1][2]) {
      result = "Q";
    } else if (posList[8][1] < posList[12][1] && fingers.filter(f => f === 1).length === 2 && posList[9][1] > posList[4][1]) {
      result = "R";
    } else if (posList[4][1] < posList[6][1] && posList[4][1] < posList[10][1] && fingers.filter(f => f === 1).length === 2 && posList[3][2] > posList[4][2] && posList[8][1] - posList[11][1] <= 50) {
      result = "U";
    } else if (posList[4][1] < posList[6][1] && posList[4][1] < posList[10][1] && fingers.filter(f => f === 1).length === 2 && posList[3][2] > posList[4][2]) {
      result = "V";
    } else if (posList[4][1] < posList[6][1] && posList[4][1] < posList[10][1] && fingers.filter(f => f === 1).length === 3) {
      result = "W";
    } else if (fingers[0] === 0.5 && fingers.filter(f => f === 0).length === 3 && posList[4][1] > posList[6][1]) {
      result = "X";
    } else if (fingers.filter(f => f === 0).length === 3 && posList[3][1] < posList[4][1] && fingers.length === 4 && fingers[3] === 1) {
      result = "Y";
    }

    return result;
  };

  const handleStartDetection = () => {
    setIsDetecting(true);
  };

  const handleStopDetection = () => {
    setIsDetecting(false);
  };

  return (
    <div className="relative w-80 h-60 mx-auto mt-10">
      <h1 className="text-center text-2xl font-bold mb-4">Hand Sign Language Detection</h1>
      <Webcam
        ref={webcamRef}
        className="absolute left-0 top-0 w-full h-full z-10"
        videoConstraints={{ facingMode: "user" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 w-full h-full z-20"
      />
      <div className="absolute top-2 left-2 z-30 flex space-x-2">
        <button
          onClick={handleStartDetection}
          disabled={isDetecting}
          className={`px-4 py-2 rounded ${isDetecting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white`}
        >
          Start Detection
        </button>
        <button
          onClick={handleStopDetection}
          disabled={!isDetecting}
          className={`px-4 py-2 rounded ${!isDetecting ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-700'} text-white`}
        >
          Stop Detection
        </button>
      </div>
      <h2 className="text-center text-xl font-semibold mt-4">Detected Sign: {detectedSign}</h2>
    </div>
  );
};

export default HandSignDetection;
