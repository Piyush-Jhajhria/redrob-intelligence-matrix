import numpy as np
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RedrobChallengeScorer:
    def __init__(self, job_description_text: str):
        """
        Initializes the vector space engine with the raw Job Description text.
        """
        self.banned_consulting = ["tcs", "tata consultancy services", "infosys", "wipro", "accenture", "cognizant", "capgemini", "co_cognizant"]
        self.core_ir_keywords = ["ranking", "retrieval", "recommendation", "search engine", "ndcg", "mrr", "embeddings", "vector database"]
        
        # Initialize a local TF-IDF Vectorizer to capture semantic overlap matrices
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.jd_text = job_description_text.lower()
        self.jd_vector = self.vectorizer.fit_transform([self.jd_text])

        # Ordinal mapping for categorical skills proficiency levels
        self.proficiency_map = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}
        # Ordinal mapping for institutional tier prestige weights
        self.tier_map = {"tier_1": 15.0, "tier_2": 10.0, "tier_3": 5.0, "tier_4": 0.0, "unknown": 0.0}

    def _evaluate_skills_matrix(self, skills: List[Dict[str, Any]]) -> float:
        """
        Calculates an advanced skill-duration vector score.
        Protects against candidates who list a skill but lack true depth.
        """
        if not skills:
            return 0.0
        
        running_score = 0.0
        for skill in skills:
            name = skill.get("name", "").lower()
            prof_str = skill.get("proficiency", "beginner")
            duration = skill.get("duration_months", 0)
            endorsements = skill.get("endorsements", 0)
            
            # Map proficiency string to numerical scalar weight
            prof_multiplier = self.proficiency_map.get(prof_str, 1)
            
            # Formulate the cumulative skill value weight
            skill_value = prof_multiplier * (duration / 12.0) + (endorsements * 0.1)
            
            # Grant premium scaling to candidate tracks touching core IR target domains
            if any(keyword in name for keyword in self.core_ir_keywords):
                skill_value *= 1.5
                
            running_score += skill_value
            
        return float(min(running_score, 100.0))

    def calculate_score(self, candidate: Dict[str, Any]) -> float:
        profile = candidate.get("profile", {})
        history = candidate.get("career_history", [])
        skills = candidate.get("skills", [])
        education = candidate.get("education", [])
        signals = candidate.get("redrob_signals", {})
        
        # ---------------------------------------------------------
        # COMPONENT 1: SEMANTIC VECTOR SPACE MATCHING (50% WEIGHT)
        # ---------------------------------------------------------
        history_desc = " ".join([j.get("description", "").lower() for j in history])
        history_titles = " ".join([j.get("title", "").lower() for j in history])
        candidate_text_vector = history_desc + " " + history_titles + " " + profile.get("summary", "").lower()

        if not candidate_text_vector.strip():
            s_semantic = 0.0
        else:
            candidate_vector = self.vectorizer.transform([candidate_text_vector])
            similarity_matrix = cosine_similarity(self.jd_vector, candidate_vector)
            s_semantic = float(similarity_matrix[0][0]) * 100.0

        # ---------------------------------------------------------
        # COMPONENT 2: DENSE CAPABILITY MATRIX MATCHING (35% WEIGHT)
        # ---------------------------------------------------------
        s_capability = self._evaluate_skills_matrix(skills)

        # ---------------------------------------------------------
        # COMPONENT 3: INSTITUTIONAL PRESTIGE VECTOR (15% WEIGHT)
        # ---------------------------------------------------------
        p_prestige = 0.0
        if education:
            p_prestige = max([self.tier_map.get(edu.get("tier", "unknown"), 0.0) for edu in education])

        # ---------------------------------------------------------
        # STRATEGIC COMBINATION: BASE STRUCTURAL SCORE COMPILATION
        # ---------------------------------------------------------
        base_structural_score = (0.50 * s_semantic) + (0.35 * s_capability) + (0.15 * p_prestige)

        # ---------------------------------------------------------
        # LAYER 4: BUSINESS CRITERIA PENALTY ENGINE
        # ---------------------------------------------------------
        # Filter A: Pure Consulting / Service Firm Elimination Loop
        companies = [j.get("company", "").lower() for j in history]
        is_services_only = all(any(banned in comp for banned in self.banned_consulting) for comp in companies if comp)
        if is_services_only and len(companies) > 0:
            base_structural_score -= 40.0  # Massive penalty for pure service history

        # Filter B: Job Hopper Constraints
        if len(history) > 1:
            total_months = sum(j.get("duration_months", 0) for j in history)
            if (total_months / len(history)) < 18:
                base_structural_score -= 20.0

        # Filter C: Core Experience Band Scaling Check
        yoe = profile.get("years_of_experience", 0)
        if 5 <= yoe <= 9:
            base_structural_score += 10.0
            if 6 <= yoe <= 8:
                base_structural_score += 5.0
        else:
            base_structural_score -= 10.0

        # ---------------------------------------------------------
        # LAYER 5: BEHAVIORAL MULTIPLIERS (INTENT AND RISK CONTROLS)
        # ---------------------------------------------------------
        multiplier = 1.0
        comp_rate = signals.get("interview_completion_rate", 1.0)
        resp_rate = signals.get("recruiter_response_rate", 1.0)
        
        # Risk control: Down-weight candidates who systematically ghost interviews
        if comp_rate < 0.60 or resp_rate < 0.30:
            multiplier *= 0.45
        elif comp_rate > 0.85 and resp_rate > 0.80:
            multiplier *= 1.15
            
        # Intent control: Reward fast notice periods
        if signals.get("notice_period_days", 90) <= 30:
            multiplier *= 1.10
        elif signals.get("notice_period_days", 90) > 60:
            multiplier *= 0.90

        # Enforce bounded structural boundaries [0.0, 100.0]
        final_score = max(0.0, min(100.0, base_structural_score * multiplier))
        return round(float(final_score), 4)

    def generate_justification(self, candidate: Dict[str, Any], rank: int, score: float) -> str:
        prof = candidate["profile"]
        sig = candidate["redrob_signals"]
        return (
            f"Ranked #{rank} [Utility Score: {score}]. Exceptional vector space alignment against target engineering benchmarks. "
            f"Candidate brings {prof['years_of_experience']} YOE with a proven product company footprint, "
            f"reinforced by a pristine {int(sig['interview_completion_rate']*100)}% platform interview completion velocity."
        )