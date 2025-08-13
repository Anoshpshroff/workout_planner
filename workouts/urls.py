from django.urls import path
from . import views
from . import auth_views  # Make sure this line exists and is correct
from . import ai_views

urlpatterns = [
    # Authentication URLs
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    
    # Workout URLs
    path('workouts/', views.workout_list, name='workout-list'),
    path('workouts/<int:pk>/', views.workout_detail, name='workout-detail'),
    path('exercises/', views.exercise_list, name='exercise-list'),
    path('exercises/<int:pk>/', views.exercise_detail, name='exercise-detail'),
    
    # AI URLs
    path('workouts/<int:workout_id>/analyze/', ai_views.analyze_workout, name='analyze-workout'),
    path('workouts/generate/', ai_views.generate_workout, name='generate-workout'),  # New endpoint
]
