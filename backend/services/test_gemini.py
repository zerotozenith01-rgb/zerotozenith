import os
from google import genai
from dotenv import load_dotenv

# Force load the .env file
load_dotenv()

def test_api():
    # Use GEMINI_API_KEY as the standard for 2026
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY is empty or not found in .env")
        return

    # Debug: Check if the key is loaded correctly (hiding the middle)
    print(f"DEBUG: Using key: {api_key[:5]}...{api_key[-4:]}")

    try:
        # Initialize the 2026 Client
        client = genai.Client(api_key=api_key)
        
        # In April 2026, gemini-2.5-flash is the stable free-tier model
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents="Say 'System Ready' if the key is valid."
        )
        
        print(f"✅ SUCCESS: {response.text}")

    except Exception as e:
        if "400" in str(e):
            print("❌ FAILED: The API key is invalid. Please double-check it in AI Studio.")
        elif "429" in str(e):
            print("⚠️ FAILED: Key is valid, but you are back in Quota Jail (429).")
        else:
            print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    test_api()