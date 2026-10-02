from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resumes"
    )

    file = models.FileField(upload_to="resumes/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Resume"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name="analysis"
    )

    extracted_text = models.TextField(blank=True)

    extracted_name = models.CharField(
        max_length=150,
        blank=True
    )

    extracted_email = models.EmailField(
        blank=True
    )

    skills = models.JSONField(
        default=list,
        blank=True
    )

    education = models.JSONField(
        default=list,
        blank=True
    )

    projects = models.JSONField(
        default=list,
        blank=True
    )

    certifications = models.JSONField(
        default=list,
        blank=True
    )

    experience = models.JSONField(
        default=list,
        blank=True
    )

    resume_score = models.FloatField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Analysis - {self.resume}"