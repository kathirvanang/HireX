import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai


BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_resume(resume_text):
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

STRENGTHS:
4. Generate 5 to 7 specific strengths based ONLY on the resume.
5. Strengths must be based on actual skills, projects, education, experience, certifications, or achievements found in the resume.
6. Do not repeat the same strength using different words.
7. Make each strength specific and useful, not generic statements.

SUGGESTIONS:
8. Generate 5 to 7 specific improvement suggestions.
9. Suggestions should identify realistic missing information, weak areas, missing keywords, project-description improvements, skill gaps, or resume presentation improvements.
10. Do not repeat the same suggestion using different words.
11. If something important is missing from the resume, mention that it is missing instead of assuming it exists.
12. Do not invent experience, certifications, skills, achievements, or metrics.
13. Keep each strength and suggestion concise, around one or two sentences.

14. Return ONLY valid JSON.
15. No markdown and no explanation.

Resume:
{resume_text}
"""

    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt
    )

    result = response.output_text

    return json.loads(result)

# learning roadmap generation function

def generate_learning_roadmap(resume_data, target_job):
    prompt = f"""
You are an expert full-stack developer mentor.

Create a personalized 4-week learning roadmap using the
candidate's resume and selected target job.

RESUME DATA:
{json.dumps(resume_data, ensure_ascii=False)}

TARGET JOB:
{json.dumps(target_job, ensure_ascii=False)}

Return ONLY valid JSON with exactly this structure:

{{
    "target_job": "",
    "current_skills": [],
    "missing_skills": [],
    "weeks": [
        {{
            "week": 1,
            "title": "",
            "goal": "",
            "topics": [
                {{
                    "title": "",
                    "description": "",
                    "task": ""
                }}
            ]
        }}
    ]
}}

Rules:
1. Generate exactly 4 weeks.
2. Include 3 to 5 topics per week.
3. Prioritize skills required by the target job that are
   missing from the resume.
4. Build on skills the candidate already knows.
5. Include practical coding tasks and a final project.
6. Keep the plan suitable for a beginner-to-intermediate learner.
7. Do not claim the candidate has skills not listed in the resume.
8. Do not invent job requirements.
9. Return only valid JSON, without Markdown.
"""

    response = client.interactions.create(
        model="gemini-3.5-flash-lite",
        input=prompt
    )

    return json.loads(response.output_text)