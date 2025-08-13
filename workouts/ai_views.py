import google.generativeai as genai
import time
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Workout, Exercise

# Configure Gemini AI
genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
import json
import time
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Workout, Exercise
from .serializers import WorkoutSerializer, ExerciseSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_workout(request):
    """Generate a complete AI workout with exercises"""
    
    try:
        workout_type = request.data.get('workout_type', '').strip()
        
        if not workout_type:
            return Response({'error': 'Workout type is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # If AI is not available, use fallback
        if not AI_AVAILABLE:
            return create_fallback_workout(request, workout_type)
        
        # Configure AI
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        
        # Create AI prompt
        prompt = f"""Create a complete workout plan for: {workout_type}

Generate a workout with 4-6 exercises. For each exercise, provide:
- Exercise name (common gym exercises)
- Sets (2-5 sets)
- Reps (6-15 reps)  
- Weight in kg (realistic weights: 10-150kg)

Format your response as JSON only:
{{
    "workout_name": "descriptive workout name",
    "exercises": [
        {{"name": "Exercise Name", "sets": 3, "reps": 10, "weight": 60}},
        {{"name": "Exercise Name", "sets": 4, "reps": 8, "weight": 80}}
    ]
}}

Return only valid JSON, no markdown or additional text."""
        
        # Call AI with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                
                # Extract and clean JSON from AI response
                ai_text = response.text.strip()
            
                
                # Parse JSON
                workout_data = json.loads(ai_text)
                
                # Validate structure
                if 'workout_name' not in workout_data or 'exercises' not in workout_:
                    raise ValueError("Invalid workout structure from AI")
                
                if not isinstance(workout_data['exercises'], list) or len(workout_data['exercises']) == 0:
                    raise ValueError("No exercises in AI response")
                
                # Create workout in database
                workout_serializer = WorkoutSerializer(data={'name': workout_data['workout_name']})
                if workout_serializer.is_valid():
                    workout = workout_serializer.save(user=request.user)
                else:
                    raise ValueError(f"Workout validation failed: {workout_serializer.errors}")
                
                # Create exercises
                created_exercises = []
                for exercise_data in workout_data['exercises']:
                    # Validate exercise data
                    required_fields = ['name', 'sets', 'reps', 'weight']
                    if not all(field in exercise_data for field in required_fields):
                        continue  # Skip invalid exercises
                    
                    exercise_data['workout'] = workout.id
                    exercise_serializer = ExerciseSerializer(data=exercise_data)
                    if exercise_serializer.is_valid():
                        exercise = exercise_serializer.save()
                        created_exercises.append(exercise_serializer.data)
                    else:
                        print(f"Failed to create exercise {exercise_data.get('name', 'Unknown')}: {exercise_serializer.errors}")
                
                return Response({
                    'success': True,
                    'workout': workout_serializer.data,
                    'exercises': created_exercises,
                    'message': f'Generated "{workout_data["workout_name"]}" with {len(created_exercises)} exercises',
                    'ai_generated': True
                })
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                print(f"AI parsing attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    # Wait before retry with exponential backoff
                    time.sleep(2 ** attempt + random.uniform(0, 1))
                    continue
                else:
                    # Final attempt failed, use fallback
                    return create_fallback_workout(request, workout_type)
                    
            except Exception as ai_error:
                print(f"AI API attempt {attempt + 1} failed: {str(ai_error)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt + random.uniform(0, 1))
                    continue
                else:
                    return create_fallback_workout(request, workout_type)
        
    except Exception as e:
        return Response({'error': f'Workout generation failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def create_fallback_workout(request, workout_type):
    """Create fallback workout when AI fails"""
    
    fallback_workouts = {
        'push': {
            'name': 'Push Day Workout',
            'exercises': [
                {'name': 'Bench Press', 'sets': 4, 'reps': 8, 'weight': 70},
                {'name': 'Overhead Press', 'sets': 3, 'reps': 10, 'weight': 50},
                {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': 12, 'weight': 30},
                {'name': 'Tricep Dips', 'sets': 3, 'reps': 12, 'weight': 0},
                {'name': 'Lateral Raises', 'sets': 3, 'reps': 15, 'weight': 15}
            ]
        },
        'pull': {
            'name': 'Pull Day Workout',
            'exercises': [
                {'name': 'Pull-ups', 'sets': 4, 'reps': 8, 'weight': 0},
                {'name': 'Barbell Rows', 'sets': 4, 'reps': 10, 'weight': 60},
                {'name': 'Lat Pulldowns', 'sets': 3, 'reps': 12, 'weight': 50},
                {'name': 'Face Pulls', 'sets': 3, 'reps': 15, 'weight': 20},
                {'name': 'Bicep Curls', 'sets': 3, 'reps': 12, 'weight': 25}
            ]
        },
        'legs': {
            'name': 'Leg Day Workout',
            'exercises': [
                {'name': 'Squats', 'sets': 4, 'reps': 10, 'weight': 80},
                {'name': 'Romanian Deadlifts', 'sets': 3, 'reps': 10, 'weight': 70},
                {'name': 'Leg Press', 'sets': 3, 'reps': 12, 'weight': 120},
                {'name': 'Leg Curls', 'sets': 3, 'reps': 12, 'weight': 40},
                {'name': 'Calf Raises', 'sets': 4, 'reps': 15, 'weight': 40}
            ]
        },
        'upper': {
            'name': 'Upper Body Workout',
            'exercises': [
                {'name': 'Push-ups', 'sets': 3, 'reps': 15, 'weight': 0},
                {'name': 'Pull-ups', 'sets': 3, 'reps': 8, 'weight': 0},
                {'name': 'Dumbbell Press', 'sets': 3, 'reps': 12, 'weight': 25},
                {'name': 'Dumbbell Rows', 'sets': 3, 'reps': 12, 'weight': 30},
                {'name': 'Plank', 'sets': 3, 'reps': 30, 'weight': 0}
            ]
        },
        'full': {
            'name': 'Full Body Workout',
            'exercises': [
                {'name': 'Squats', 'sets': 3, 'reps': 12, 'weight': 60},
                {'name': 'Push-ups', 'sets': 3, 'reps': 12, 'weight': 0},
                {'name': 'Pull-ups', 'sets': 3, 'reps': 8, 'weight': 0},
                {'name': 'Overhead Press', 'sets': 3, 'reps': 10, 'weight': 40},
                {'name': 'Planks', 'sets': 3, 'reps': 30, 'weight': 0}
            ]
        }
    }
    
    # Find matching fallback or create generic
    workout_key = workout_type.lower()
    for key in fallback_workouts.keys():
        if key in workout_key:
            workout_data = fallback_workouts[key]
            break
    else:
        # Generic fallback
        workout_data = {
            'name': f'{workout_type.title()} Workout',
            'exercises': [
                {'name': 'Push-ups', 'sets': 3, 'reps': 15, 'weight': 0},
                {'name': 'Squats', 'sets': 3, 'reps': 15, 'weight': 0},
                {'name': 'Lunges', 'sets': 3, 'reps': 12, 'weight': 0},
                {'name': 'Plank', 'sets': 3, 'reps': 30, 'weight': 0}
            ]
        }
    
    try:
        # Create workout
        workout_serializer = WorkoutSerializer(data={'name': workout_data['name']})
        if workout_serializer.is_valid():
            workout = workout_serializer.save(user=request.user)
            
            # Create exercises
            created_exercises = []
            for exercise_data in workout_data['exercises']:
                exercise_data['workout'] = workout.id
                exercise_serializer = ExerciseSerializer(data=exercise_data)
                if exercise_serializer.is_valid():
                    exercise = exercise_serializer.save()
                    created_exercises.append(exercise_serializer.data)
            
            return Response({
                'success': True,
                'workout': workout_serializer.data,
                'exercises': created_exercises,
                'message': f'Generated fallback "{workout_data["name"]}" with {len(created_exercises)} exercises',
                'ai_generated': False,
                'fallback': True
            })
        else:
            return Response({'error': 'Failed to create fallback workout'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({'error': f'Fallback workout creation failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        
        # Call Gemini AI with retry logic
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Try gemini-flash first (more reliable than gemini-pro)
                model = genai.GenerativeModel(model_name="gemini-1.5-flash")
                response = model.generate_content(prompt)
                
                return Response({
                    'analysis': response.text,
                    'workout_name': workout.name,
                    'exercise_count': exercises.count()
                })
                
            except Exception as ai_error:
                print(f"AI API attempt {attempt + 1} failed: {str(ai_error)}")
                
                if attempt < max_retries - 1:
                    # Wait with exponential backoff + jitter
                    sleep_time = retry_delay * (2 ** attempt) + random.uniform(0, 1)
                    time.sleep(sleep_time)
                    continue
                else:
                    # Final attempt failed, try alternative approach
                    return Response({
                        'error': 'AI analysis is temporarily unavailable due to high demand. Please try again in a few minutes.',
                        'retry_suggested': True
                    }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
    except Workout.DoesNotExist:
        return Response({'error': 'Workout not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Analysis failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


