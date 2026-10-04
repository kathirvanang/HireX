from django.urls import path
from .views import upload_resume, get_resume_analysis

urlpatterns = [
    path('upload/', upload_resume, name='resume-upload'),
    path('<int:resume_id>/analysis/', get_resume_analysis, name='resume-analysis'),
]