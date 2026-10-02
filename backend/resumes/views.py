from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

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
    ResumeAnalysis.objects.create(
        resume=resume,
        extracted_text=extracted_text
    )

    return Response(
        {
            "message": "Resume uploaded and text extracted successfully.",
            "resume_id": resume.id,
            "file_name": resume.file.name
        },
        status=status.HTTP_201_CREATED
    )