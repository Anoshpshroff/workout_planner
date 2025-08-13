import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Workout, Exercise
from .serializers import WorkoutSerializer, ExerciseSerializer
from django.conf import settings
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_workout(request, workout_id):
    try:
        # Get workout and verify ownership
        workout = Workout.objects.get(pk=workout_id, user=request.user)
        exercises = Exercise.objects.filter(workout=workout)
        
        if not exercises.exists():
            return Response({'error': 'No exercises found in this workout'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare workout data for AI analysis
        workout_data = {
            'workout_name': workout.name,
            'exercises': []
        }
        
        for exercise in exercises:
            workout_data['exercises'].append({
                'name': exercise.name,
                'sets': exercise.sets,
                'reps': exercise.reps,
                'weight': exercise.weight
            })
        
        # Create AI prompt
        prompt = f"""
        Analyze this workout and provide detailed feedback:
        
        Workout Name: {workout.name}
        
        Exercises:
        """
        for exercise in exercises:
            prompt += f"- {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg\n"
        
        prompt += """
        
        Please provide analysis on:
        1. **Workout Structure**: Is this a well-balanced workout?
        2. **Volume Analysis**: Are the sets/reps appropriate for the goals?
        3. **Exercise Selection**: Do these exercises work well together?
        4. **Progression Suggestions**: How can this workout be improved?
        5. **Form & Safety**: Any important form cues or safety considerations?
        6. **Recovery**: Rest time recommendations between exercises?
        
        Format your response in clear sections with practical advice. Be encouraging but constructive.
        """
        
        # Call Gemini AI
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return Response({
            'analysis': response.text,
            'workout_name': workout.name,
            'exercise_count': exercises.count()
        })
        
    except Workout.DoesNotExist:
        return Response({'error': 'Workout not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'AI analysis failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Add this
def workout_list(request):
    if request.method == 'GET':
        workouts = Workout.objects.filter(user=request.user)
        serializer = WorkoutSerializer(workouts, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = WorkoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  # Add this
def workout_detail(request, pk):
    try:
        workout = Workout.objects.get(pk=pk, user=request.user)  # Add user filter
    except Workout.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    # ... rest of your existing code

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])  # Add this
def exercise_list(request):
    if request.method == 'GET':
        # FIX: Only show user's exercises
        exercises = Exercise.objects.filter(workout__user=request.user)
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])  # Add this
def exercise_detail(request, pk):
    try:
        exercise = Exercise.objects.get(pk=pk, workout__user=request.user)  # Add user filter
    except Exercise.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    # ... rest of your existing code
