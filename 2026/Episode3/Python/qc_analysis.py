"""
PBMC3k Single-Cell QC Analysis
================================
Coffee with CompBio Podcast — Claude Code Demo

This script performs standard quality control on the classic 10x Genomics
PBMC3k dataset using Scanpy.

Usage:
    python qc_analysis.py

Outputs:
    figures/01_qc_violin.png       — Violin plots of QC metrics (pre-filter)
    figures/02_qc_scatter.png      — Scatter: nCounts vs nGenes, colored by %MT
    figures/03_qc_histograms.png   — Distribution histograms with thresholds marked
    figures/04_qc_violin_post.png  — Violin plots after filtering
    results/pbmc3k_filtered.h5ad   — Filtered AnnData object
"""

import os
import scanpy as sc
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings("ignore")

# ──────────────────────────────────────────────
# QC THRESHOLDS  (edit these to experiment!)
# ──────────────────────────────────────────────
MIN_GENES     = 200    # cells expressing fewer genes → likely empty droplets
MAX_GENES     = 2500   # cells expressing more genes  → likely doublets
MIN_COUNTS    = 500    # minimum total UMI counts per cell
MAX_PCT_MITO  = 5.0    # max % mitochondrial reads    → dying/stressed cells
MIN_CELLS     = 3      # min cells a gene must appear in (gene filter)

# ──────────────────────────────────────────────
# STYLE
# ──────────────────────────────────────────────
PALETTE   = ["#2EC4B6", "#E71D36", "#FF9F1C"]
FIG_DPI   = 300
FONT_SIZE = 11
plt.rcParams.update({
    "font.family":    "sans-serif",
    "font.size":      FONT_SIZE,
    "axes.spines.top":    False,
    "axes.spines.right":  False,
    "figure.facecolor":   "white",
    "axes.facecolor":     "white",
})

os.makedirs("figures", exist_ok=True)
os.makedirs("results",  exist_ok=True)

# ──────────────────────────────────────────────
# 1. LOAD DATA
# ──────────────────────────────────────────────
print("\n🧬 Coffee with CompBio — PBMC3k QC Demo")
print("=" * 45)
print("📥 Loading PBMC3k dataset...")

# sc.datasets.pbmc3k() downloads automatically on first run (~20MB)
adata = sc.datasets.pbmc3k()
print(f"   Loaded: {adata.n_obs} cells × {adata.n_vars} genes")

# ──────────────────────────────────────────────
# 2. COMPUTE QC METRICS
# ──────────────────────────────────────────────
print("\n📊 Computing QC metrics...")

# Flag mitochondrial genes (human: MT- prefix)
adata.var["mt"] = adata.var_names.str.startswith("MT-")
n_mt = adata.var["mt"].sum()
print(f"   Mitochondrial genes detected: {n_mt}")

sc.pp.calculate_qc_metrics(
    adata,
    qc_vars=["mt"],
    percent_top=None,
    log1p=False,
    inplace=True
)

# Summary stats before filtering
obs = adata.obs
print(f"\n   Pre-filter summary:")
print(f"   ├── Cells:          {adata.n_obs:,}")
print(f"   ├── Median genes/cell:   {obs['n_genes_by_counts'].median():.0f}")
print(f"   ├── Median counts/cell:  {obs['total_counts'].median():.0f}")
print(f"   └── Median %MT:          {obs['pct_counts_mt'].median():.2f}%")

# ──────────────────────────────────────────────
# 3. PLOT PRE-FILTER QC — VIOLIN
# ──────────────────────────────────────────────
print("\n🎨 Generating violin plots (pre-filter)...")

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
fig.suptitle("QC Metrics — Pre-filter  |  PBMC3k", fontsize=13, fontweight="bold", y=1.02)

metrics = [
    ("n_genes_by_counts", "Genes per cell",   PALETTE[0]),
    ("total_counts",      "UMI counts",        PALETTE[1]),
    ("pct_counts_mt",     "% Mitochondrial",   PALETTE[2]),
]

for ax, (col, label, color) in zip(axes, metrics):
    vals = obs[col].values
    parts = ax.violinplot(vals, positions=[0], showmedians=True, showextrema=True)
    for pc in parts["bodies"]:
        pc.set_facecolor(color)
        pc.set_alpha(0.7)
    parts["cmedians"].set_color("black")
    parts["cmedians"].set_linewidth(2)
    # overlay strip
    jitter = np.random.uniform(-0.08, 0.08, size=min(500, len(vals)))
    ax.scatter(jitter, np.random.choice(vals, size=len(jitter), replace=False),
               s=2, alpha=0.4, color=color, zorder=3)
    ax.set_ylabel(label)
    ax.set_xticks([])
    ax.set_title(f"median = {np.median(vals):.1f}", fontsize=9, color="gray")

plt.tight_layout()
plt.savefig("figures/01_qc_violin.png", dpi=FIG_DPI, bbox_inches="tight")
plt.close()
print("   ✔ saved figures/01_qc_violin.png")

# ──────────────────────────────────────────────
# 4. SCATTER: nCounts vs nGenes (colored by %MT)
# ──────────────────────────────────────────────
print("🎨 Generating scatter plots...")

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
fig.suptitle("Cell-level QC Scatter  |  PBMC3k", fontsize=13, fontweight="bold")

# Panel A: total_counts vs n_genes_by_counts
sc_kw = dict(s=3, alpha=0.5, linewidths=0)
im = axes[0].scatter(
    obs["total_counts"], obs["n_genes_by_counts"],
    c=obs["pct_counts_mt"], cmap="RdYlGn_r", **sc_kw
)
axes[0].set_xlabel("Total UMI counts")
axes[0].set_ylabel("Genes per cell")
axes[0].set_title("nCounts vs nGenes\n(color = %MT)")
cb = plt.colorbar(im, ax=axes[0])
cb.set_label("% Mito", fontsize=9)

# Panel B: %MT per cell ranked
mt_sorted = np.sort(obs["pct_counts_mt"].values)[::-1]
axes[1].plot(mt_sorted, color=PALETTE[2], linewidth=1.2)
axes[1].axhline(MAX_PCT_MITO, color="red", linestyle="--", linewidth=1,
                label=f"Threshold ({MAX_PCT_MITO}%)")
axes[1].set_xlabel("Cells (ranked)")
axes[1].set_ylabel("% Mitochondrial reads")
axes[1].set_title("% Mito Ranked Distribution")
axes[1].legend(fontsize=9)

plt.tight_layout()
plt.savefig("figures/02_qc_scatter.png", dpi=FIG_DPI, bbox_inches="tight")
plt.close()
print("   ✔ saved figures/02_qc_scatter.png")

# ──────────────────────────────────────────────
# 5. HISTOGRAMS WITH THRESHOLDS
# ──────────────────────────────────────────────
print("🎨 Generating threshold histograms...")

fig, axes = plt.subplots(1, 3, figsize=(13, 4))
fig.suptitle("QC Distributions with Filter Thresholds  |  PBMC3k",
             fontsize=13, fontweight="bold")

configs = [
    ("n_genes_by_counts", "Genes per cell",  PALETTE[0],
     [("min", MIN_GENES), ("max", MAX_GENES)], 60),
    ("total_counts",      "Total UMI counts", PALETTE[1],
     [("min", MIN_COUNTS)], 60),
    ("pct_counts_mt",     "% Mito",           PALETTE[2],
     [("max", MAX_PCT_MITO)], 40),
]

for ax, (col, label, color, thresholds, bins) in zip(axes, configs):
    vals = obs[col].values
    ax.hist(vals, bins=bins, color=color, alpha=0.75, edgecolor="none")
    for kind, val in thresholds:
        ls = "--" if kind == "min" else "-."
        ax.axvline(val, color="black", linestyle=ls, linewidth=1.5,
                   label=f"{'Min' if kind=='min' else 'Max'}: {val}")
    ax.set_xlabel(label)
    ax.set_ylabel("Number of cells")
    ax.legend(fontsize=8)
    # shade removed cells
    if any(k == "min" for k, _ in thresholds):
        min_val = next(v for k, v in thresholds if k == "min")
        ax.axvspan(vals.min(), min_val, alpha=0.12, color="red", label="_nolegend_")
    if any(k == "max" for k, _ in thresholds):
        max_val = next(v for k, v in thresholds if k == "max")
        ax.axvspan(max_val, vals.max(), alpha=0.12, color="red", label="_nolegend_")

plt.tight_layout()
plt.savefig("figures/03_qc_histograms.png", dpi=FIG_DPI, bbox_inches="tight")
plt.close()
print("   ✔ saved figures/03_qc_histograms.png")

# ──────────────────────────────────────────────
# 6. APPLY FILTERS
# ──────────────────────────────────────────────
print("\n✂️  Applying QC filters...")

n_before = adata.n_obs

# Cell filters
sc.pp.filter_cells(adata, min_genes=MIN_GENES)
sc.pp.filter_cells(adata, max_genes=MAX_GENES)
adata = adata[adata.obs["total_counts"] >= MIN_COUNTS, :].copy()
adata = adata[adata.obs["pct_counts_mt"] < MAX_PCT_MITO, :].copy()

# Gene filter
sc.pp.filter_genes(adata, min_cells=MIN_CELLS)

n_after = adata.n_obs
removed = n_before - n_after
print(f"   Cells before: {n_before:,}")
print(f"   Cells after:  {n_after:,}  ({removed:,} removed, {removed/n_before*100:.1f}%)")
print(f"   Genes after:  {adata.n_vars:,}")

# ──────────────────────────────────────────────
# 7. POST-FILTER VIOLIN
# ──────────────────────────────────────────────
print("\n🎨 Generating post-filter violins...")

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
fig.suptitle(f"QC Metrics — Post-filter  |  {n_after:,} cells retained",
             fontsize=13, fontweight="bold", y=1.02)

obs_f = adata.obs
for ax, (col, label, color) in zip(axes, metrics):
    vals = obs_f[col].values
    parts = ax.violinplot(vals, positions=[0], showmedians=True, showextrema=True)
    for pc in parts["bodies"]:
        pc.set_facecolor(color)
        pc.set_alpha(0.7)
    parts["cmedians"].set_color("black")
    parts["cmedians"].set_linewidth(2)
    jitter = np.random.uniform(-0.08, 0.08, size=min(500, len(vals)))
    ax.scatter(jitter, np.random.choice(vals, size=len(jitter), replace=False),
               s=2, alpha=0.4, color=color, zorder=3)
    ax.set_ylabel(label)
    ax.set_xticks([])
    ax.set_title(f"median = {np.median(vals):.1f}", fontsize=9, color="gray")

plt.tight_layout()
plt.savefig("figures/04_qc_violin_post.png", dpi=FIG_DPI, bbox_inches="tight")
plt.close()
print("   ✔ saved figures/04_qc_violin_post.png")

# ──────────────────────────────────────────────
# 8. SAVE RESULTS
# ──────────────────────────────────────────────
out_path = "results/pbmc3k_filtered.h5ad"
adata.write_h5ad(out_path)
print(f"\n💾 Filtered AnnData saved → {out_path}")

# ──────────────────────────────────────────────
# 9. FINAL SUMMARY
# ──────────────────────────────────────────────
print("\n" + "=" * 45)
print("✅ QC Complete — Summary")
print("=" * 45)
print(f"  Input:       {n_before:,} cells × 32,738 genes")
print(f"  Output:      {n_after:,} cells × {adata.n_vars:,} genes")
print(f"  Removed:     {removed:,} cells ({removed/n_before*100:.1f}%)")
print(f"\n  Thresholds applied:")
print(f"    Genes/cell:    {MIN_GENES} – {MAX_GENES}")
print(f"    Counts/cell:   ≥ {MIN_COUNTS}")
print(f"    % Mito:        < {MAX_PCT_MITO}%")
print(f"    Gene min cells: {MIN_CELLS}")
print(f"\n  Figures saved:   figures/")
print(f"  AnnData saved:   {out_path}")
print("=" * 45 + "\n")
