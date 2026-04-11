from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
load_dotenv()
c = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
for m in ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash-preview"]:
    try:
        r = c.models.generate_content(model=m, contents="Say hello", config=types.GenerateContentConfig(max_output_tokens=50, temperature=0.1))
        txt = r.text if r.text else "(no text)"
        print(f"{m}: OK -> {txt.strip()[:50]}")
    except Exception as e:
        print(f"{m}: FAIL -> {str(e)[:80]}")
