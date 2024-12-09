import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

const getHandLandmarks = (predictions) => {
  if (!predictions.length) return null;
  return predictions[0].landmarks;
};

const calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) +
    Math.pow(point1[1] - point2[1], 2) +
    Math.pow(point1[2] - point2[2], 2)
  );
};

const LearningInterface = ({ sign, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [accuracy, setAccuracy] = useState(0);
  const [handposeModel, setHandposeModel] = useState(null);

  useEffect(() => {
    const initializeHandpose = async () => {
      const model = await handpose.load();
      setHandposeModel(model);
      startWebcam();
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        detectHands();
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const detectHands = async () => {
      if (!videoRef.current || !canvasRef.current || !handposeModel) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detect = async () => {
        if (video.readyState === 4) {
          // Draw current video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          try {
            const predictions = await handposeModel.estimateHands(canvas);
            const landmarks = getHandLandmarks(predictions);
            if (landmarks) {
              const accuracy = calculateAccuracy(landmarks, sign.name);
              setAccuracy(accuracy);
            }
          } catch (error) {
            console.error("Hand detection error:", error);
          }
        }
        requestAnimationFrame(detect);
      };
      detect();
    };

    initializeHandpose();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [sign.name]);

  const calculateAccuracy = (landmarks, gestureName) => {
    // Define expected landmark positions for each gesture
    const gestureTemplates = {
      'Hello': {
        // Example positions for "Hello" gesture
        expectedPositions: [
          [0, 0, 0],  // thumb base
          [50, 0, 0], // index finger tip
          [50, 0, 0], // middle finger tip
          [50, 0, 0], // ring finger tip
          [50, 0, 0]  // pinky tip
        ],
        tolerance: 20 // distance threshold in pixels
      },
      'Thank You': {
        // Different positions for "Thank You" gesture
        expectedPositions: [
          [0, 0, 0],
          [30, 0, 0],
          [30, 0, 0],
          [30, 0, 0],
          [30, 0, 0]
        ],
        tolerance: 20
      }
    };

    const template = gestureTemplates[gestureName];
    if (!template) return 0;

    // Compare key landmark positions
    const keyPoints = [0, 4, 8, 12, 16]; // Thumb base, and all fingertips
    let totalDistance = 0;
    let maxDistance = template.tolerance * keyPoints.length;

    keyPoints.forEach((point, i) => {
      const userPosition = landmarks[point];
      const expectedPosition = template.expectedPositions[i];
      const distance = calculateDistance(userPosition, expectedPosition);
      totalDistance += Math.min(distance, template.tolerance);
    });

    // Convert to percentage (100% - error%)
    const accuracy = Math.max(0, Math.round((1 - totalDistance / maxDistance) * 100));
    return accuracy;
  };

  return (
    <div className="space-y-4">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <video 
            autoPlay 
            loop 
            muted 
            controls 
            className="w-full rounded-lg"
            src={sign.videoUrl}
          />
          <Card className="mt-2">
            <CardContent className="text-center py-3">
              Tutorial Video
            </CardContent>
          </Card>
        </div>

        <div>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            className="w-full rounded-lg transform scale-x-[-1]"
          />
          <canvas 
            ref={canvasRef}
            className="hidden"
          />
          <Card className="mt-2">
            <CardContent className="text-center py-3">
              Accuracy: {accuracy}%
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;