from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ai_engine.gemini_service import (analyze_resume, generate_learning_roadmap,)
from django.shortcuts import get_object_or_404

from .models import Resume, ResumeAnalysis, RoadmapProgress
from .utils import extract_resume_text
from jobs.models import Job

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_resume(request):

    file = request.FILES.get("file")

    if not file:
        return Response(
            {"error": "Resume file is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save uploaded resume
    resume = Resume.objects.create(
        user=request.user,
        file=file
    )

    # Extract text from PDF/DOCX
    extracted_text = extract_resume_text(resume.file)

    # Save extracted text
    analysis = analyze_resume(extracted_text)

    ResumeAnalysis.objects.create(
        resume=resume,
        extracted_text=extracted_text,
        extracted_name=analysis.get("name", ""),
        extracted_email=analysis.get("email", ""),
        skills=analysis.get("skills", []),
        education=analysis.get("education", []),
        projects=analysis.get("projects", []),
        certifications=analysis.get("certifications", []),
        experience=analysis.get("experience", []),
        resume_score=analysis.get("resume_score", 0),

        strengths=analysis.get("strengths", []),
        suggestions=analysis.get("suggestions", [])
    )
    return Response(
        {
            "message": "Resume uploaded and text extracted successfully.",
            "resume_id": resume.id,
            "file_name": resume.file.name
        },
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_resume_analysis(request, resume_id):

    resume = get_object_or_404(
        Resume,
        id=resume_id,
        user=request.user
    )

    analysis = get_object_or_404(
        ResumeAnalysis,
        resume=resume
    )

    return Response({
        "resume_id": resume.id,
        "file_name": resume.file.name,
        "uploaded_at": resume.uploaded_at,
        "name": analysis.extracted_name,
        "email": analysis.extracted_email,
        "skills": analysis.skills,
        "education": analysis.education,
        "projects": analysis.projects,
        "certifications": analysis.certifications,
        "experience": analysis.experience,
        "resume_score": analysis.resume_score,
        "strengths": analysis.strengths,
        "suggestions": analysis.suggestions,
    })
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_latest_resume_analysis(request):
    resume = (
        Resume.objects.filter(user=request.user)
        .order_by("-uploaded_at")
        .first()
    )

    if not resume:
        return Response(
            {"message": "No resume uploaded yet."},
            status=status.HTTP_404_NOT_FOUND,
        )

    analysis = (
        ResumeAnalysis.objects.filter(resume=resume)
        .order_by("-id")
        .first()
    )

    if not analysis:
        return Response(
            {"message": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response({
        "resume_id": resume.id,
        "file_name": resume.file.name,
        "uploaded_at": resume.uploaded_at,
        "name": analysis.extracted_name,
        "email": analysis.extracted_email,
        "skills": analysis.skills,
        "education": analysis.education,
        "projects": analysis.projects,
        "certifications": analysis.certifications,
        "experience": analysis.experience,
        "resume_score": analysis.resume_score,
        "strengths": analysis.strengths,
        "suggestions": analysis.suggestions,
    })

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_learning_roadmap(request):
    resume = (
        Resume.objects.filter(user=request.user)
        .order_by("-uploaded_at")
        .first()
    )

    if not resume:
        return Response(
            {"error": "Please upload a resume first."},
            status=status.HTTP_404_NOT_FOUND,
        )

    analysis = (
        ResumeAnalysis.objects.filter(resume=resume)
        .order_by("-id")
        .first()
    )

    if not analysis:
        return Response(
            {"error": "Resume analysis not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    job_id = request.data.get("job_id")

    if not job_id:
        return Response(
            {"error": "Please select a target job."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        job = Job.objects.get(id=job_id)
    except (Job.DoesNotExist, ValueError, TypeError):
        return Response(
            {"error": "Selected job was not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    resume_data = {
        "skills": analysis.skills or [],
        "education": analysis.education or [],
        "projects": analysis.projects or [],
        "certifications": analysis.certifications or [],
        "experience": analysis.experience or [],
    }

    target_job = {
        "title": job.title,
        "company": job.company,
        "description": job.description,
        "required_skills": job.required_skills or [],
        "experience": job.experience,
        "job_type": job.job_type,
    }

    try:
        roadmap = generate_learning_roadmap(
            resume_data=resume_data,
            target_job=target_job,
        )
    except Exception:
        return Response(
            {"error": "Could not generate the roadmap. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if not isinstance(roadmap, dict) or not isinstance(
        roadmap.get("weeks"), list
    ) or len(roadmap["weeks"]) != 4:
        return Response(
            {"error": "AI returned an invalid roadmap. Please try again."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(roadmap, status=status.HTTP_200_OK)

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def roadmap_progress(request):
    if request.method == "GET":
        job_id = request.query_params.get("job_id")

        if not job_id or not job_id.isdigit():
            return Response(
                {"error": "A valid job_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        progress = RoadmapProgress.objects.filter(
            user=request.user,
            job_id=int(job_id),
        ).first()

        return Response({
            "job_id": int(job_id),
            "completed_topics": (
                progress.completed_topics if progress else []
            ),
            "updated_at": (
                progress.updated_at if progress else None
            ),
        })

    job_id = request.data.get("job_id")
    completed_topics = request.data.get("completed_topics")

    if (
        isinstance(job_id, bool)
        or not isinstance(job_id, int)
        or job_id <= 0
    ):
        return Response(
            {"error": "A valid job_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not isinstance(completed_topics, list):
        return Response(
            {"error": "completed_topics must be a list."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not all(
        isinstance(topic, str) and len(topic) <= 200
        for topic in completed_topics
    ):
        return Response(
            {"error": "Each topic ID must be a string of at most 200 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    completed_topics = list(dict.fromkeys(completed_topics))

    progress, _ = RoadmapProgress.objects.update_or_create(
        user=request.user,
        job_id=job_id,
        defaults={"completed_topics": completed_topics},
    )

    return Response(
        {
            "message": "Roadmap progress saved successfully.",
            "job_id": progress.job_id,
            "completed_topics": progress.completed_topics,
            "updated_at": progress.updated_at,
        },
        status=status.HTTP_200_OK,
    )