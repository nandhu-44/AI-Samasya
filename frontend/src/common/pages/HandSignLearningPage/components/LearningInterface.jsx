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
  const thumbnailRef = useRef(null);
  const [accuracy, setAccuracy] = useState(0);
  const [handposeModel, setHandposeModel] = useState(null);
  const [referencePose, setReferencePose] = useState(null);

  useEffect(() => {
    const initializeHandpose = async () => {
      const model = await handpose.load();
      setHandposeModel(model);
      startWebcam();
      extractReferencePose(model);
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

    const extractReferencePose = async (model) => {
      if (!thumbnailRef.current) return;
      try {
        const predictions = await model.estimateHands(thumbnailRef.current);
        const landmarks = getHandLandmarks(predictions);
        if (landmarks) {
          setReferencePose(landmarks);
          console.log("Reference pose extracted:", landmarks);
        }
      } catch (error) {
        console.error("Error extracting reference pose:", error);
      }
    };

    const detectHands = async () => {
      if (!videoRef.current || !canvasRef.current || !handposeModel || !referencePose) return;

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
              const accuracy = compareHandPoses(landmarks, referencePose);
              setAccuracy(accuracy);
              drawHandLandmarks(context, landmarks);
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

  const compareHandPoses = (currentPose, referencePose) => {
    const keyPoints = [0, 4, 8, 12, 16]; // Important landmarks
    let totalSimilarity = 0;

    keyPoints.forEach((point) => {
      const currentPoint = currentPose[point];
      const referencePoint = referencePose[point];
      const distance = calculateDistance(currentPoint, referencePoint);
      // Normalize distance to 0-1 range (closer to 1 means more similar)
      const similarity = Math.max(0, 1 - (distance / 100));
      totalSimilarity += similarity;
    });

    return Math.round((totalSimilarity / keyPoints.length) * 100);
  };

  const drawHandLandmarks = (context, landmarks) => {
    landmarks.forEach(point => {
      context.beginPath();
      context.arc(point[0], point[1], 3, 0, 2 * Math.PI);
      context.fillStyle = 'red';
      context.fill();
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <img
            ref={thumbnailRef}
            src={sign.thumbnail}
            alt={sign.name}
            className="w-full rounded-lg mb-4"
          />
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