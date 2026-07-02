#!/usr/bin/env python3
"""
Advanced Execution Pipeline for Redrob Candidate Discovery Challenge.
Implements optimized multi-key dataframe sorting to eliminate tie-break drift.
"""

import json
import csv
import pandas as pd
from pathlib import Path
from src.scorer import RedrobChallengeScorer

def run_pipeline(use_production_data: bool = False):
    if use_production_data:
        data_in = Path("candidates.jsonl")
        print("[INGESTION] Target Context: Deploying full 475MB Production Line Array streaming...")
    else:
        data_in = Path("sample_candidates.json")
        print("[INGESTION] Target Context: Deploying Sandbox prototyping Sample Matrix...")

    if not data_in.exists():
        print(f"[ERROR] Target dataset missing at root workspace: {data_in.absolute()}")
        return

    # Ingest anchored Job Description profile constraints to build the Vector Engine
    jd_anchor = """
    Senior AI Engineer — Founding Team. Own the intelligence layer of Redrob's product.
    Ranking, retrieval, and matching systems that decide what recruiters see.
    Deep technical depth in modern ML systems — embeddings, retrieval, ranking, LLMs, fine-tuning.
    Hybrid retrieval, vector databases, hybrid search infrastructure — Pinecone, Weaviate, Qdrant, Milvus, OpenSearch, Elasticsearch.
    Evaluation infrastructure — offline benchmarks, online A/B testing, recruiter-feedback loops, NDCG, MRR, MAP.
    Strong Python, code quality. Product-engineering attitude, shipper archetypes.
    """
    
    scorer = RedrobChallengeScorer(job_description_text=jd_anchor)
    evaluated_pool = []

    # Stream processing implementation to preserve RAM efficiency
    if data_in.suffix == ".jsonl":
        with open(data_in, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                clean_line = line.strip()
                if not clean_line:
                    continue
                try:
                    entity = json.loads(clean_line)
                    score = scorer.calculate_score(entity)
                    evaluated_pool.append({
                        "candidate_id": entity["candidate_id"],
                        "score": score,
                        "raw_payload": entity
                    })
                except json.JSONDecodeError as e:
                    print(f"[LINE ERROR] Skipping malformed record on line {line_no}: {e}")
    else:
        with open(data_in, "r", encoding="utf-8") as f:
            candidates_list = json.load(f)
            for entity in candidates_list:
                score = scorer.calculate_score(entity)
                evaluated_pool.append({
                    "candidate_id": entity["candidate_id"],
                    "score": score,
                    "raw_payload": entity
                })

    print(f"[PROCESSING] Ingestion terminated safely. Total items parsed: {len(evaluated_pool)}")
    df = pd.DataFrame(evaluated_pool)

    # CRITICAL GUARDRAIL: Enforce absolute monotonic sorting and ascending candidate_id tie-breaker
    # This matches rows 95-114 of validate_submission.py perfectly
    df = df.sort_values(by=["score", "candidate_id"], ascending=[False, True]).reset_index(drop=True)

    # Dynamic row allocation slice to prevent dimension assignment crashes
    df_shortlist = df.head(100).copy()
    df_shortlist["rank"] = range(1, len(df_shortlist) + 1)

    print("[PROCESSING] Compiling multi-modal feature justifications...")
    df_shortlist["reasoning"] = df_shortlist.apply(
        lambda r: scorer.generate_justification(r["raw_payload"], r["rank"], r["score"]), axis=1
    )

    # Order exactly to target output submission format
    csv_out = Path("team_prime.csv")
    final_output = df_shortlist[["candidate_id", "rank", "score", "reasoning"]]
    
    final_output.to_csv(csv_out, index=False, encoding="utf-8", quoting=csv.QUOTE_MINIMAL)
    print(f"[SUCCESS] Shortlist compiled. Submission file ready at: {csv_out}")

if __name__ == "__main__":
    # Flip to True to stream through the full 100,000 candidate production dataset
    run_pipeline(use_production_data=True)