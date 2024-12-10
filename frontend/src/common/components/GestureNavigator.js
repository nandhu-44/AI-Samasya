import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const GestureNavigator = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const [gestureState, setGestureState] = useState({
    pages: ["/", "/page1", "/page2", "/page3"], // Update with your Next.js routes
    currentPage: "/",
  });

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults(handleHandResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  const handleHandResults = (results) => {
    if (!results.multiHandLandmarks.length) return;

    const landmarks = results.multiHandLandmarks[0];
    const gesture = detectGesture(landmarks);

    if (gesture) handleGestureNavigation(gesture);
  };

  const detectGesture = (landmarks) => {
    if (detectHomePose(landmarks)) return "HOME";
    return detectSlidePose(landmarks);
  };

  const detectHomePose = (landmarks) => {
    const fingertips = [
      landmarks[4], // Thumb
      landmarks[8], // Index
      landmarks[12], // Middle
      landmarks[16], // Ring
      landmarks[20], // Pinky
    ];

    return fingertips.every((tip, index) => tip.y < landmarks[index * 4 + 5].y);
  };

  const detectSlidePose = (landmarks) => {
    const wrist = landmarks[0];
    const indexTip = landmarks[8];

    const angle =
      Math.atan2(indexTip.y - wrist.y, indexTip.x - wrist.x) * (180 / Math.PI);

    if (Math.abs(angle) > 30) {
      return angle > 0 ? "RIGHT" : "LEFT";
    }

    return null;
  };

  const handleGestureNavigation = (gesture) => {
    const { pages, currentPage } = gestureState;
    const currentPageIndex = pages.indexOf(currentPage);

    let newPage = currentPage;
    if (gesture === "HOME") newPage = "/";
    if (gesture === "RIGHT") newPage = pages[(currentPageIndex + 1) % pages.length];
    if (gesture === "LEFT") {
      newPage =
        pages[(currentPageIndex - 1 + pages.length) % pages.length];
    }

    if (newPage !== currentPage) {
      setGestureState((prevState) => ({ ...prevState, currentPage: newPage }));
      router.push(newPage);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "auto" }}
      ></video>
      <p>Use gestures to navigate: Open palm for Home, swipe left or right for pages.</p>
    </div>
  );
};

export default GestureNavigator;
