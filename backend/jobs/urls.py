from django.urls import path
from .views import job_list, match_job, skill_gap_analysis

urlpatterns = [
    path("", job_list, name="job-list"),
    path("<int:job_id>/match/", match_job, name="job-match"),
    path("<int:job_id>/skill-gap/", skill_gap_analysis, name="skill-gap-analysis"),
]