from django.contrib import admin
from .models import Resume, ResumeAnalysis


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "file", "uploaded_at")
    list_filter = ("uploaded_at",)
    search_fields = ("user__username", "file")
    ordering = ("-uploaded_at",)


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "resume",
        "extracted_name",
        "extracted_email",
        "resume_score",
        "created_at",
    )

    list_filter = ("created_at",)

    search_fields = (
        "extracted_name",
        "extracted_email",
    )

    ordering = ("-created_at",)