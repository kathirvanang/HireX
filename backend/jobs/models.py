from django.db import models

class Job(models.Model):

    JOB_TYPE_CHOICES = [
        ('Full Time', 'Full Time'),
        ('Part Time', 'Part Time'),
        ('Internship', 'Internship'),
    ]

    EXPERIENCE_CHOICES = [
        ("Fresher", "Fresher"),
        ("0-1 years", "0-1 years"),
        ("1-3 years", "1-3 years"),
        ("3-5 years", "3-5 years"),
        ("3+ years", "3+ years"),
    ]

    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.JSONField(default=list)
    location = models.CharField(max_length=150)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    experience = models.CharField(max_length=50, choices=EXPERIENCE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.company}"
