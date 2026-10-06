from django.contrib import admin
from .models import Job


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "company",
        "location",
        "job_type",
        "experience",
        "created_at",
    )

    list_filter = (
        "job_type",
        "experience",
        "created_at",
    )

    search_fields = (
        "title",
        "company",
        "location",
    )

    ordering = ("-created_at",)