

from django.conf import settings
from django.db import models

class Workout(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workouts')

    def __str__(self):
        return self.name


class Exercise(models.Model):
    workout = models.ForeignKey(Workout, related_name='exercises', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight = models.FloatField(help_text="Weight in kg")

    def __str__(self):
        return f"{self.name} - {self.sets}x{self.reps} @ {self.weight}kg"
