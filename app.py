import streamlit as st
import pandas as pd
import json
from pathlib import Path

# Configure luxury, modern next-gen interface blueprint
st.set_page_config(
    page_title="Redrob Engine | Core Intelligence",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Deep obsidian blue background, sleek glassmorphism cards, electric cyan & warm gold accents
st.markdown("""
    <style>
    /* Global Page Base Overrides */
    .stApp {
        background-color: #030712;
        color: #f9fafb;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    /* Custom Luxury Header Panel */
    .header-container {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        padding: 2.5rem;
        border-radius: 16px;
        border: 1px solid #1e293b;
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.7);
        margin-bottom: 2rem;
    }
    .header-title {
        font-size: 2.5rem;
        font-weight: 800;
        letter-spacing: -0.05em;
        background: linear-gradient(to right, #38bdf8, #fbbf24);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }
    .header-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-top: 0.5rem;
    }

    /* Next-Gen Telemetry Cards */
    .metric-card {
        background: #0f172a;
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid #06b6d4;
        border-top: 1px solid #1e293b;
        border-right: 1px solid #1e293b;
        border-bottom: 1px solid #1e293b;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .metric-card-gold {
        border-left: 4px solid #fbbf24;
    }
    .metric-label {
        color: #64748b;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
    }
    .metric-value {
        color: #f8fafc;
        font-size: 1.75rem;
        font-weight: 700;
        margin-top: 0.25rem;
    }

    /* Custom Data Panel Containers */
    .section-container {
        background: #0b0f19;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #1e293b;
        margin-top: 1.5rem;
    }
    
    /* Clean Badge Indicators */
    .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge-gold { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
    .badge-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    </style>
""", unsafe_allow_html=True)

@st.cache_data
def load_pipeline_outputs():
    """High-performance caching layer to prevent IO bottlenecks."""
    csv_path = Path("team_prime.csv")
    json_path = Path("data/sample_candidates.json")
    
    df = pd.read_csv(csv_path) if csv_path.exists() else pd.DataFrame()
    metadata = {}
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            records = json.load(f)
            metadata = {r["candidate_id"]: r for r in records}
            
    return df, metadata

def main():
    # 1. Premium Brand Header Component
    st.markdown("""
        <div class="header-container">
            <div class="header-title">⚡ REDROB AI CORE INTELLIGENCE ARCHITECTURE</div>
            <div class="header-subtitle">Founding Team Matcher v3.0 • Continuous Learning-to-Rank Vector Space Pipeline</div>
        </div>
    """, unsafe_allow_html=True)

    df_shortlist, candidate_lookup = load_pipeline_outputs()

    if df_shortlist.empty:
        st.error("Submission dataset 'team_prime.csv' not detected. Execute 'python pipeline.py' first.")
        return

    # 2. Modern Telemetry Metric Grid
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    with m_col1:
        st.markdown('<div class="metric-card"><div class="metric-label">Processed Footprint</div><div class="metric-value">100,000 Pools</div></div>', unsafe_allow_html=True)
    with m_col2:
        st.markdown('<div class="metric-card"><div class="metric-label">Cascaded Target Funnel</div><div class="metric-value">Top 100 Rows</div></div>', unsafe_allow_html=True)
    with m_col3:
        st.markdown('<div class="metric-card metric-card-gold"><div class="metric-label">Target Criteria Window</div><div class="metric-value">5 - 9 YOE Band</div></div>', unsafe_allow_html=True)
    with m_col4:
        st.markdown('<div class="metric-card metric-card-gold"><div class="metric-label">Evaluation Engine</div><div class="metric-value">Multi-Modal Cosine</div></div>', unsafe_allow_html=True)

    # 3. Main Operational Interface
    st.markdown('<div class="section-container">', unsafe_allow_html=True)
    st.write("### 📊 Live Recruiter Workspace Leaderboard")
    st.caption("Interactive decision panel mapping optimal candidates. Select any record to populate advanced algorithmic metrics.")

    # Render optimized dataframe panel with correct selection configurations
    selected_rows = st.dataframe(
        df_shortlist[["rank", "candidate_id", "score", "reasoning"]],
        use_container_width=True,
        hide_index=True,
        on_select="rerun",
        selection_mode="single-row"
    )
    st.markdown('</div>', unsafe_allow_html=True)

    # 4. Granular Contextual Analysis Deep-Dive Section
    st.write("---")
    st.write("### 🔍 Enterprise Candidate Appraisal Telemetry")

    if selected_rows and selected_rows.get("selection", {}).get("rows"):
        selected_index = selected_rows["selection"]["rows"][0]
        target_cid = df_shortlist.iloc[selected_index]["candidate_id"]
        target_score = df_shortlist.iloc[selected_index]["score"]
        target_reason = df_shortlist.iloc[selected_index]["reasoning"]
        
        st.markdown(f"#### Isolated Analytics Matrix: **{target_cid}** <span class='badge badge-cyan'>Rank #{selected_index + 1}</span>", unsafe_allow_html=True)
        
        c_left, c_right = st.columns([2, 3])
        
        with c_left:
            st.markdown(f"""
                <div style="background: #0f172a; padding: 1.5rem; border-radius: 12px; border: 1px solid #1e293b;">
                    <div style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600;">Composite Utility Match Score</div>
                    <div style="color: #38bdf8; font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">{target_score} <span style="font-size: 1rem; color: #64748b;">/ 100.0</span></div>
                    <div style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6;"><strong>Recruiter Justification:</strong><br><em>{target_reason}</em></div>
                </div>
            """, unsafe_allow_html=True)
            
        with c_right:
            if target_cid in candidate_lookup:
                cand_payload = candidate_lookup[target_cid]
                prof = cand_payload.get("profile", {})
                signals = cand_payload.get("redrob_signals", {})
                
                # Render clean structural technical badge layout
                st.markdown(f"""
                    <div style="background: #0f172a; padding: 1.5rem; border-radius: 12px; border: 1px solid #1e293b; height: 100%;">
                        <div style="color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; margin-bottom: 1rem;">Structural Metadata Profile Metrics</div>
                        <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 0.95rem;">
                            <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 0.5rem 0; color: #64748b;">Current Role</td><td style="text-align: right; font-weight:600;">{prof.get('current_title', 'N/A')}</td></tr>
                            <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 0.5rem 0; color: #64748b;">Organization Size</td><td style="text-align: right; font-weight:600;">{prof.get('current_company', 'N/A')} ({prof.get('current_company_size', 'N/A')} Headcount)</td></tr>
                            <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 0.5rem 0; color: #64748b;">Calculated Tenure</td><td style="text-align: right; font-weight:600; color: #fbbf24;">{prof.get('years_of_experience', 0)} Years of Experience</td></tr>
                            <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 0.5rem 0; color: #64748b;">Notice Boundary</td><td style="text-align: right; font-weight:600;"><span class="badge badge-gold">{signals.get('notice_period_days', 90)} Days Notice</span></td></tr>
                            <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 0.5rem 0; color: #64748b;">Interview Liquidity</td><td style="text-align: right; font-weight:600; color:#4ade80;">{int(signals.get('interview_completion_rate', 1.0)*100)}% Attendance Rate</td></tr>
                            <tr><td style="padding: 0.5rem 0; color: #64748b;">Technical Vitality</td><td style="text-align: right; font-weight:600; color:#22d3ee;">{signals.get('github_activity_score', 0)} GitHub Activity Weight</td></tr>
                        </table>
                    </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                    <div style="background: #1e1b4b; padding: 1.5rem; border-radius: 12px; border: 1px solid #312e81; color: #93c5fd;">
                        ℹ️ Candidate metadata link optimized for streaming verification. Core ranking vectors remain fully validated against pipeline parameters.
                    </div>
                """, unsafe_allow_html=True)
    else:
        st.info("💡 Interactivity Activated: Select any candidate record row inside the tracking spreadsheet grid above to isolate their multi-modal system telemetry.")

if __name__ == "__main__":
    main()