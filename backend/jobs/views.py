from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from resumes.models import Resume, ResumeAnalysis
from .models import Job
from .serializers import JobSerializer


# Get all available jobs
@api_view(["GET"])
def job_list(request):
    jobs = Job.objects.all().order_by("-created_at")
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)


# Match user's latest resume with a selected job
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def match_job(request, job_id):

    job = get_object_or_404(Job, id=job_id)

    resume = Resume.objects.filter(
        user=request.user
    ).order_by("-uploaded_at").first()

    if not resume:
        return Response(
            {"error": "Please upload your resume first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        analysis = ResumeAnalysis.objects.get(resume=resume)
    except ResumeAnalysis.DoesNotExist:
        return Response(
            {"error": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    resume_skills = {
        skill.strip().casefold()
        for skill in analysis.skills
        if isinstance(skill, str) and skill.strip()
    }

    required_skills = [
        skill.strip()
        for skill in job.required_skills
        if isinstance(skill, str) and skill.strip()
    ]

    matched_skills = [
        skill
        for skill in required_skills
        if skill.casefold() in resume_skills
    ]

    missing_skills = [
        skill
        for skill in required_skills
        if skill.casefold() not in resume_skills
    ]

    match_score = (
        round(len(matched_skills) / len(required_skills) * 100, 2)
        if required_skills
        else 0
    )

    return Response({
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "resume_id": resume.id,
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required_skills": len(required_skills),
    })

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def skill_gap_analysis(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    resume = Resume.objects.filter(
        user=request.user
    ).order_by("-uploaded_at").first()

    if not resume:
        return Response(
            {"error": "Please upload your resume first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        analysis = ResumeAnalysis.objects.get(resume=resume)
    except ResumeAnalysis.DoesNotExist:
        return Response(
            {"error": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    resume_skills = {
        skill.strip().casefold()
        for skill in analysis.skills
        if isinstance(skill, str) and skill.strip()
    }

    required_skills = [
        skill.strip()
        for skill in job.required_skills
        if isinstance(skill, str) and skill.strip()
    ]

    matched_skills = [
        skill for skill in required_skills
        if skill.casefold() in resume_skills
    ]

    missing_skills = [
        skill for skill in required_skills
        if skill.casefold() not in resume_skills
    ]

    return Response({
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "resume_id": resume.id,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required_skills": len(required_skills),
        "total_matched_skills": len(matched_skills),
        "total_missing_skills": len(missing_skills),
    })