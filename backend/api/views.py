from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def hello_api(request):
    return Response({
        "message": "Hello to HireX API",
        "status": "success"})