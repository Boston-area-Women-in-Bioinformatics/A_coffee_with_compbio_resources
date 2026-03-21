# Coffee with CompBio 🎙️
## Episode: "Claude Code for scRNA-seq QC"
### Prompts to show live + talking points

---

## SETUP (show this on screen)

```bash
# In your terminal, navigate to the project folder and start Claude Code
cd pbmc_qc_demo
claude  # launches Claude Code — it reads CLAUDE.md automatically!
```

---

## PROMPT 1 — Getting started / orientation
> "What does this project do and what do I need to install?"

**What Claude Code does:**
- Reads CLAUDE.md automatically
- Summarizes the project goal
- Outputs the pip install command

**Talking point:** *"Notice we didn't have to explain anything — Claude Code reads the CLAUDE.md context file first. This is like giving a new lab member a README before they start."*

---

## PROMPT 2 — Run the full analysis
> "Run the QC analysis and show me what plots were generated."

**What Claude Code does:**
- Runs `python qc_analysis.py`
- Streams the printed QC summary to you live
- Lists the output files in figures/

**Talking point:** *"It's not just writing code — it can execute it, read the output, and tell you what happened. Like having a computational co-author sitting next to you."*

---

## PROMPT 3 — Adjust a threshold and re-run
> "The mitochondrial threshold seems strict for PBMCs. Change it to 10% and re-run."

**What Claude Code does:**
- Opens qc_analysis.py
- Finds `MAX_PCT_MITO = 5.0` and changes it to `10.0`
- Re-runs the script
- Reports how many more cells were retained

**Talking point:** *"This is the real power — iterative science. You'd normally do this manually in a notebook. Claude Code treats your script like a living document."*

---

## PROMPT 4 — Explain a QC decision
> "Why do we filter on percent mitochondrial reads? Write me a 2-sentence explanation I can use in my methods section."

**What Claude Code does:**
- Gives a clear biological rationale
- Writes methods-ready text

**Talking point:** *"It knows the biology, not just the code. It can help you go from analysis to manuscript."*

---

## PROMPT 5 — Add a new plot
> "Add a scatter plot of total_counts vs pct_counts_mt with a horizontal line at the MT threshold, and save it as figures/05_mito_vs_counts.png"

**What Claude Code does:**
- Edits qc_analysis.py to add the new figure block
- Re-runs (or runs just the new section)
- Confirms the file was saved

**Talking point:** *"You just described a figure in plain English and got it. No Stack Overflow, no remembering matplotlib syntax."*

---

## PROMPT 6 — Gene-level QC (bonus/advanced)
> "Also make a plot showing the top 20 most highly expressed genes as a fraction of total counts — this is a common QC sanity check."

**What Claude Code does:**
- Adds `sc.pl.highest_expr_genes()` equivalent
- Discusses why ribosomal/mito genes dominating top-20 can be a red flag

---

## KEY TALKING POINTS FOR EPISODE

### Why Claude Code (not ChatGPT copy-paste)?
- **Reads your files** — knows your data, your variable names, your structure
- **Executes code** — doesn't just generate, it runs and debugs
- **Iterates with you** — you can say "that threshold is too aggressive, loosen it" in plain English
- **Keeps context** — remembers what it ran earlier in the session

### What scRNA-seq QC typically involves
1. **Empty droplets** → low nGenes filter (< 200)
2. **Doublets** → high nGenes filter (> 2500) [or dedicated tools like Scrublet]
3. **Dying cells** → high %MT filter (> 5–10%)
4. **Low-quality cells** → low nCounts filter

### Dataset used: PBMC3k
- Classic benchmark: 2,700 peripheral blood mononuclear cells
- 10x Genomics Chromium v2
- Freely available via `sc.datasets.pbmc3k()`
- Same dataset used in the canonical Scanpy tutorial

---

## SHOW STRUCTURE SUGGESTION

| Time     | Segment                                      |
|----------|----------------------------------------------|
| 0:00     | Intro — what is Claude Code, why scRNA-seq   |
| 3:00     | Show project structure + CLAUDE.md           |
| 6:00     | Prompt 1 + 2 — setup and run                 |
| 10:00    | Look at the figures live, explain QC biology |
| 15:00    | Prompt 3 — change threshold interactively    |
| 18:00    | Prompt 5 — add a new plot live               |
| 22:00    | Wrap-up: limitations, when to use vs not use |

---

*Good luck with the episode! 🎧*
