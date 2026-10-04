from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ai_engine.gemini_service import analyze_resume
from django.shortcuts import get_object_or_404

from .models import Resume, ResumeAnalysis
from .utils import extract_resume_text


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
        resume_score=analysis.get("resume_score", 0)
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
    })