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


# Normalize skill names for consistent matching
def normalize_skill(skill):
    if not isinstance(skill, str):
        return ""

    skill = skill.strip().casefold()

    aliases = {
        "react": "react.js",
        "reactjs": "react.js",
        "react.js": "react.js",
        "js": "javascript",
        "nodejs": "node.js",
        "node js": "node.js",
        "node.js": "node.js",
        "restful api": "rest api",
        "rest apis": "rest api",
        "rest api": "rest api",
        "mysql database": "mysql",
    }

    return aliases.get(skill, skill)


# Get the user's latest resume and analysis
def get_latest_resume_analysis(user):
    resume = (
        Resume.objects.filter(user=user)
        .order_by("-uploaded_at")
        .first()
    )

    if not resume:
        return None, None

    analysis = (
        ResumeAnalysis.objects.filter(resume=resume)
        .order_by("-id")
        .first()
    )

    return resume, analysis


# Get normalized resume skills
def get_resume_skills(analysis):
    if not analysis or not isinstance(analysis.skills, list):
        return set()

    return {
        normalized
        for skill in analysis.skills
        if (normalized := normalize_skill(skill))
    }


# Get unique required skills
# Returns (normalized_skill, display_name) pairs
def get_required_skills(job):
    if not isinstance(job.required_skills, list):
        return []

    unique_skills = {}

    for skill in job.required_skills:
        if not isinstance(skill, str):
            continue

        display_name = skill.strip()
        normalized = normalize_skill(display_name)

        if normalized and normalized not in unique_skills:
            unique_skills[normalized] = display_name

    return list(unique_skills.items())


# Calculate match score and skill gaps
def calculate_job_match(job, resume_skills):
    required_skills = get_required_skills(job)

    matched_skills = [
        display_name
        for normalized, display_name in required_skills
        if normalized in resume_skills
    ]

    missing_skills = [
        display_name
        for normalized, display_name in required_skills
        if normalized not in resume_skills
    ]

    total_required = len(required_skills)
    total_matched = len(matched_skills)

    match_score = (
        round(total_matched / total_required * 100, 2)
        if total_required
        else 0.0
    )

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required_skills": total_required,
        "total_matched_skills": total_matched,
        "total_missing_skills": len(missing_skills),
    }


# Calculate how relevant the job is to the resume skills.
# Job title matches receive more weight than description matches.
def calculate_job_relevance(job, resume_skills):
    title_text = normalize_skill(job.title)
    description_text = normalize_skill(job.description)

    title_relevance = sum(
        1
        for skill in resume_skills
        if skill and skill in title_text
    )

    description_relevance = sum(
        1
        for skill in resume_skills
        if skill and skill in description_text
    )

    return (title_relevance * 3) + description_relevance


# GET: List jobs ranked by match score and relevance
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def job_list(request):
    resume, analysis = get_latest_resume_analysis(request.user)

    # Without an analyzed resume, show newest jobs first
    if not resume or not analysis:
        jobs = Job.objects.order_by("-created_at")
        return Response(JobSerializer(jobs, many=True).data)

    resume_skills = get_resume_skills(analysis)
    ranked_jobs = []

    for job in Job.objects.all():
        match_details = calculate_job_match(job, resume_skills)
        relevance_score = calculate_job_relevance(
            job,
            resume_skills,
        )

        ranked_jobs.append({
            "job": job,
            "match_score": match_details["match_score"],
            "relevance_score": relevance_score,
        })

    # Priority:
    # 1. Highest match score
    # 2. Highest relevance score
    # 3. Newest job
    ranked_jobs.sort(
        key=lambda item: (
            item["match_score"],
            item["relevance_score"],
            item["job"].created_at,
        ),
        reverse=True,
    )

    response_data = []

    for item in ranked_jobs:
        job_data = JobSerializer(item["job"]).data
        job_data["match_score"] = item["match_score"]
        response_data.append(job_data)

    return Response(response_data)


# POST: Match a specific job with the latest resume
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def match_job(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    resume, analysis = get_latest_resume_analysis(request.user)

    if not resume:
        return Response(
            {"error": "Please upload your resume first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not analysis:
        return Response(
            {"error": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    match_details = calculate_job_match(
        job,
        get_resume_skills(analysis),
    )

    return Response({
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "resume_id": resume.id,
        **match_details,
    })


# GET: Analyze skill gaps for a specific job
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def skill_gap_analysis(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    resume, analysis = get_latest_resume_analysis(request.user)

    if not resume:
        return Response(
            {"error": "Please upload your resume first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not analysis:
        return Response(
            {"error": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    match_details = calculate_job_match(
        job,
        get_resume_skills(analysis),
    )

    return Response({
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "resume_id": resume.id,
        **match_details,
    })