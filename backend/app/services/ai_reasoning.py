
import json
import os
import urllib.error
import urllib.request
from typing import Any


class AIReasoningService:
    """
    Evidence-grounded reasoning layer powered by local Ollama.

    OmniMind's analytical engines calculate the actual statistics,
    trends, correlations, and insights. Ollama is used only to turn
    that evidence into a clear business-oriented explanation.
    """

    def __init__(
        self,
        model: str | None = None,
        ollama_url: str | None = None,
    ):
        # Use an environment variable when available.
        # Otherwise use a lightweight model suitable for low-RAM machines.
        self.model = model or os.getenv(
            "OLLAMA_MODEL",
            "qwen2.5:0.5b",
        )

        self.ollama_url = ollama_url or os.getenv(
            "OLLAMA_URL",
            "http://127.0.0.1:11434/api/generate",
        )

    def _build_prompt(
        self,
        question: str,
        evidence: dict[str, Any],
    ) -> str:
        evidence_json = json.dumps(
            evidence,
            indent=2,
            default=str,
        )

        return f"""
You are OmniMind AI, an enterprise AI Decision Intelligence assistant.

Your job is to explain business data using ONLY the evidence supplied
by OmniMind's analytical engines.

USER QUESTION:

{question}

ANALYTICAL EVIDENCE:

{evidence_json}

STRICT RULES:

1. Use only the supplied analytical evidence.

2. Do NOT invent numbers, trends, causes, correlations, or business facts.

3. Do NOT claim causation when the evidence only shows correlation.

4. If the evidence is insufficient, explicitly say that it is insufficient.

5. Preserve numerical values from the evidence accurately.

6. Do not create fake statistics.

7. Distinguish clearly between:
   - observed facts
   - likely drivers
   - recommendations

8. Recommendations must be based on the available evidence.

9. Keep the explanation business-oriented and concise.

10. Never mention that you are "hallucination-free".

11. Do not introduce external knowledge that is not present in the evidence.

12. If a numerical result is available in the evidence, use that result
    instead of estimating or calculating a different number.

13. If the evidence shows correlation, describe it as correlation and
    explicitly avoid presenting it as proven causation.

Return your answer using exactly these sections:

EXECUTIVE SUMMARY:

A concise explanation of the answer.

KEY EVIDENCE:

- Important evidence from the dataset.

LIKELY DRIVERS:

- Evidence-supported drivers.
- Clearly state when a relationship is correlation rather than proven causation.

RISKS:

- Important risks or uncertainties visible from the evidence.

RECOMMENDATIONS:

- Practical business actions based on the evidence.

CONFIDENCE:

High, Medium, or Low.

CONFIDENCE REASON:

One short explanation for the confidence level.
"""

    def generate_reasoning(
        self,
        question: str,
        evidence: dict[str, Any],
    ) -> dict[str, Any]:
        prompt = self._build_prompt(
            question=question,
            evidence=evidence,
        )

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_ctx": 2048,
            },
        }

        request = urllib.request.Request(
            self.ollama_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=120,
            ) as response:
                response_data = json.loads(
                    response.read().decode("utf-8")
                )

                answer = response_data.get(
                    "response",
                    "",
                ).strip()

                if not answer:
                    raise RuntimeError(
                        "Ollama returned an empty response."
                    )

                return {
                    "success": True,
                    "model": self.model,
                    "answer": answer,
                }

        except urllib.error.HTTPError as exc:
            try:
                error_body = exc.read().decode("utf-8")
            except Exception:
                error_body = ""

            return {
                "success": False,
                "model": self.model,
                "answer": (
                    "Ollama returned an HTTP error while "
                    "generating the AI response."
                ),
                "error": (
                    f"HTTP {exc.code}: "
                    f"{error_body or str(exc)}"
                ),
            }

        except urllib.error.URLError as exc:
            return {
                "success": False,
                "model": self.model,
                "answer": (
                    "Ollama could not be reached. "
                    "Make sure Ollama is running and the "
                    f"{self.model} model is available."
                ),
                "error": str(exc),
            }

        except TimeoutError as exc:
            return {
                "success": False,
                "model": self.model,
                "answer": (
                    "Ollama took too long to generate the "
                    "AI response."
                ),
                "error": str(exc),
            }

        except Exception as exc:
            return {
                "success": False,
                "model": self.model,
                "answer": (
                    "The AI reasoning service encountered "
                    "an unexpected error."
                ),
                "error": str(exc),
            }



