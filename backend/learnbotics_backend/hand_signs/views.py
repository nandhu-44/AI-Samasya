from django.http import JsonResponse
from rest_framework.decorators import api_view
from .HandTrackingModule import handDetector
import cv2
import numpy as np  # Add this import
import base64  # Add this import

@api_view(['POST'])
def process_hand_sign(request):
    try:
        # Process image frame sent as an uploaded file
        frame_file = request.FILES['frame']
        if frame_file.size > MAX_FRAME_SIZE:  # Define MAX_FRAME_SIZE appropriately
            return JsonResponse({'error': 'Frame size too large'}, status=400)
        frame_bytes = frame_file.read()
        np_img = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        detector = handDetector()
        frame_with_hands = detector.findHands(frame)
        position = detector.findPosition(frame)

        # After drawing landmarks on the image, encode it to base64
        _, buffer = cv2.imencode('.jpg', frame_with_hands)
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        return JsonResponse({'position': position, 'processed_image': encoded_image})
    except Exception as e:
        print('Error processing the frame:', e)
        return JsonResponse({'error': str(e)}, status=500)
