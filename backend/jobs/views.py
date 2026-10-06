from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Job
from .serializers import JobSerializer


@api_view(["GET"])
def job_list(request):
    jobs = Job.objects.all().order_by("-created_at")

    serializer = JobSerializer(jobs, many=True)

    return Response(serializer.data)