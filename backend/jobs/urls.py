from django.urls import path
from .views import job_list, job_match_history, match_job, skill_gap_analysis, delete_job_match_history

urlpatterns = [
    path("", job_list, name="job-list"),
    path("<int:job_id>/match/", match_job, name="job-match"),
    path("<int:job_id>/skill-gap/", skill_gap_analysis, name="skill-gap-analysis"),
    path("match-history/", job_match_history, name="job-match-history"),
    path("match-history/<int:history_id>/delete/", delete_job_match_history, name="delete-job-match-history"),
]
