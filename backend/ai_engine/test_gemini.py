import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={
        "retry_options":{
            "attempts":1
        }
    }
)

resume_text = """
G. KATHIR VANAN
BCA Student

Skills:
Python, JavaScript, HTML, CSS, React.js, Django, MySQL

Projects:
HireX - AI Resume Analyzer & Job Matcher
LifeLoop - Nothing Goes to Waste

Education:
Bachelor of Computer Applications (BCA)
"""

prompt = f"""
Analyze this resume and return ONLY valid JSON.

Use exactly these fields:

{{
    "name": "",
    "email": "",
    "skills": [],
    "education": [],
    "projects": [],
    "certifications": [],
    "experience": [],
    "resume_score": 0,
    "strengths": [],
    "suggestions": []
}}

Rules:
1. Do not invent information.
2. If information is missing, use an empty string or empty list.
3. resume_score must be a number between 0 and 100.
4. Return ONLY JSON. No markdown and no explanation.

Resume:
{resume_text}
"""

response = client.interactions.create(
    model="gemini-3.5-flash-lite",
    input=prompt,generation_config={
        "thinking_level": "low",
    }
)

result = response.output_text

print(result)