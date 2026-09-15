from __future__ import annotations

from typing import Any

from app.services.advanced_analytics import (
    advanced_analytics_service,
)
from app.services.dataset_profiler import DatasetProfiler
from app.services.diagnostic_engine import DiagnosticEngine
from app.services.intelligence_engine import IntelligenceEngine


class OmniMindAgent:
    """
    Autonomous analysis orchestrator for OmniMind AI.

    The agent coordinates OmniMind's existing analytics
    engines and produces a unified intelligence package.
    """

    def _safe_profile(
        self,
        file_path: str,
    ) -> dict[str, Any]:
        try:
            profiler = DatasetProfiler(file_path)

            profile = profiler.profile()

            if isinstance(profile, dict):
                return profile

            return {}

        except Exception as error:
            return {
                "error": str(error),
            }

    def _safe_intelligence(
        self,
        file_path: str,
        question: str,
    ) -> dict[str, Any]:
        try:
            engine = IntelligenceEngine(
                file_path
            )

            result = engine.analyze(
                question
            )

            if isinstance(result, dict):
                return result

            return {}

        except Exception as error:
            return {
                "error": str(error),
            }

    def _safe_diagnostic(
        self,
        file_path: str,
        question: str,
    ) -> dict[str, Any]:
        try:
            engine = DiagnosticEngine(
                file_path
            )

            result = engine.analyze(
                question
            )

            if isinstance(result, dict):
                return result

            return {}

        except Exception as error:
            return {
                "error": str(error),
            }

    def _safe_advanced(
        self,
        file_path: str,
        question: str,
    ) -> dict[str, Any]:
        try:
            result = advanced_analytics_service.analyze(
                file_path,
                question,
            )

            if isinstance(result, dict):
                return result

            return {}

        except Exception as error:
            return {
                "error": str(error),
            }

    def run(
        self,
        file_path: str,
        question: str,
    ) -> dict[str, Any]:
        """
        Execute the complete OmniMind autonomous
        analysis workflow.
        """

        execution_log: list[dict[str, Any]] = []

        # ==================================================
        # STEP 1 — Dataset Profiling
        # ==================================================

        execution_log.append(
            {
                "step": 1,
                "name": "Dataset Profiling",
                "status": "running",
            }
        )

        profile = self._safe_profile(
            file_path
        )

        execution_log[-1]["status"] = (
            "completed"
            if "error" not in profile
            else "failed"
        )

        # ==================================================
        # STEP 2 — Intelligence Analysis
        # ==================================================

        execution_log.append(
            {
                "step": 2,
                "name": "Intelligence Analysis",
                "status": "running",
            }
        )

        intelligence = self._safe_intelligence(
            file_path,
            question,
        )

        execution_log[-1]["status"] = (
            "completed"
            if "error" not in intelligence
            else "failed"
        )

        # ==================================================
        # STEP 3 — Diagnostic Analysis
        # ==================================================

        execution_log.append(
            {
                "step": 3,
                "name": "Diagnostic Analysis",
                "status": "running",
            }
        )

        diagnostic = self._safe_diagnostic(
            file_path,
            question,
        )

        execution_log[-1]["status"] = (
            "completed"
            if "error" not in diagnostic
            else "failed"
        )

        # ==================================================
        # STEP 4 — Advanced Analytics
        # ==================================================

        execution_log.append(
            {
                "step": 4,
                "name": "Predictive & Advanced Analytics",
                "status": "running",
            }
        )

        advanced = self._safe_advanced(
            file_path,
            question,
        )

        execution_log[-1]["status"] = (
            "completed"
            if "error" not in advanced
            else "failed"
        )

        # ==================================================
        # STEP 5 — Collect Recommendations
        # ==================================================

        recommendations: list[Any] = []

        diagnostic_recommendations = diagnostic.get(
            "recommendations",
            [],
        )

        if isinstance(
            diagnostic_recommendations,
            list,
        ):
            recommendations.extend(
                diagnostic_recommendations
            )

        decision = advanced.get(
            "decision"
        )

        if isinstance(
            decision,
            dict,
        ):
            advanced_recommendations = decision.get(
                "recommendations",
                [],
            )

            if isinstance(
                advanced_recommendations,
                list,
            ):
                recommendations.extend(
                    advanced_recommendations
                )

        # Remove duplicates.
        unique_recommendations: list[Any] = []

        seen: set[str] = set()

        for recommendation in recommendations:
            key = str(recommendation)

            if key not in seen:
                seen.add(key)

                unique_recommendations.append(
                    recommendation
                )

        # ==================================================
        # STEP 6 — Evidence Package
        # ==================================================

        evidence = {
            "profile": profile,
            "intelligence": intelligence,
            "diagnostic": diagnostic,
            "advanced_analytics": advanced,
            "recommendations": unique_recommendations,
        }

        # ==================================================
        # STEP 7 — Execution Summary
        # ==================================================

        completed_steps = sum(
            1
            for item in execution_log
            if item["status"] == "completed"
        )

        failed_steps = sum(
            1
            for item in execution_log
            if item["status"] == "failed"
        )

        return {
            "success": failed_steps == 0,
            "question": question,
            "execution": execution_log,
            "completed_steps": completed_steps,
            "failed_steps": failed_steps,
            "evidence": evidence,
            "recommendations": unique_recommendations,
            "chart": advanced.get(
                "chart"
            ),
            "predictive": advanced.get(
                "predictive"
            ),
            "decision": advanced.get(
                "decision"
            ),
            "what_if": advanced.get(
                "what_if"
            ),
        }


omnimind_agent = OmniMindAgent()











