from django.urls import path
from .views import (
    upload_resume,
    get_resume_analysis,
    get_latest_resume_analysis,
    create_learning_roadmap,
    roadmap_progress,
    get_resume_history,
)

urlpatterns = [
    path("upload/", upload_resume, name="resume-upload"),
    path(
        "learning-roadmap/",
        create_learning_roadmap,
        name="learning-roadmap",
    ),
    path(
        "latest-analysis/",
        get_latest_resume_analysis,
        name="latest-resume-analysis",
    ),
    path(
        "<int:resume_id>/analysis/",
        get_resume_analysis,
        name="resume-analysis",
    ),
    path(
        "roadmap-progress/",
        roadmap_progress,
        name="roadmap-progress",
    ),
    path(
        "history/",
        get_resume_history,
        name="resume-history",
    ),
]