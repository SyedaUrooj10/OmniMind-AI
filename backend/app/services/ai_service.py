import requests

from app.core.config import settings


def generate_ai_response(message: str) -> str:
    """
    Generate an AI response using the local Ollama server.
    No OpenAI billing or API credits are required.
    """

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": message,
                "stream": False,
            },
            timeout=120,
        )

        response.raise_for_status()

        data = response.json()

        return data.get(
            "response",
            "I couldn't generate a response.",
        ).strip()

    except requests.exceptions.ConnectionError:
        return (
            "⚠️ OmniMind AI cannot connect to Ollama. "
            "Please make sure Ollama is running."
        )

    except requests.exceptions.Timeout:
        return (
            "⚠️ The AI took too long to respond. "
            "Please try again."
        )

    except requests.exceptions.RequestException as error:
        print(f"Ollama request error: {error}")

        return (
            "⚠️ There was a problem communicating "
            "with the local AI model."
        )

    except Exception as error:
        print(f"Unexpected AI error: {error}")

        return (
            "⚠️ Something went wrong while generating "
            "the AI response."
        )
    