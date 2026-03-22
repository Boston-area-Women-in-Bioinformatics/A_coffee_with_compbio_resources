# PBMC 3K — Seurat Quality Control Report

![QC Summary Figure](qc_output/qc_summary_figure.png)

---

## Overview

This report documents the quality control analysis of the **10X Genomics PBMC 3K dataset** — a publicly available peripheral blood mononuclear cell (PBMC) dataset containing ~2,700 cells sequenced on the Chromium platform. Analysis was performed using **Seurat v5.4.0** in **R v4.5.2**.

---

## Dataset

| Property | Value |
|---|---|
| Source | 10X Genomics (publicly available) |
| Sample | Human PBMCs |
| Reference genome | hg19 |
| Raw matrix dimensions | 32,738 genes × 2,700 cells |
| After gene filtering (`min.cells = 3`) | 13,714 genes × 2,700 cells |

---

## Methods

### 1. Data Loading

The filtered feature-barcode matrix was loaded using `Read10X()` and a `SeuratObject` was created with the following pre-filters applied at object creation:

- `min.cells = 3` — retain genes detected in at least 3 cells
- `min.features = 200` — retain cells with at least 200 detected genes

### 2. Mitochondrial Content

Mitochondrial gene percentage (`percent.mt`) was calculated using `PercentageFeatureSet()` with the pattern `^MT-`, capturing all genes with names beginning with `MT-` as annotated in hg19.

### 3. QC Thresholds

Standard thresholds were applied, consistent with the Seurat best-practice tutorial:

| Filter | Threshold | Rationale |
|---|---|---|
| `nFeature_RNA` lower bound | ≥ 200 | Remove empty droplets / low-complexity debris |
| `nFeature_RNA` upper bound | ≤ 2,500 | Flag likely doublets (two cells in one droplet) |
| `percent.mt` | ≤ 5% | Remove damaged/dying cells leaking cytoplasm |

---

## Results

### QC Metric Distributions

| Metric | Min | Median | Mean | Max | SD |
|---|---|---|---|---|---|
| **nFeature_RNA** (genes/cell) | 212 | 816 | 845 | 3,400 | 281 |
| **nCount_RNA** (UMIs/cell) | 546 | 2,196 | 2,365 | 15,818 | 1,093 |
| **percent.mt** | 0.0% | 2.0% | 2.2% | 22.6% | 1.2% |

**Correlation between nCount_RNA and nFeature_RNA: r = 0.95**

This near-perfect linear correlation confirms that the data is of high technical quality — UMI counts and gene counts track together as expected in healthy single-cell data.

### Cells Failing Thresholds

| Filter | Cells Removed | % of Total |
|---|---|---|
| High MT% (> 5%) | 57 | 2.1% |
| Low genes (< 200) | 0 | 0.0% |
| High genes (> 2,500) | 5 | 0.2% |
| **Total removed** | **62** | **2.3%** |
| **Retained** | **2,638** | **97.7%** |

### Filtered Object

The filtered Seurat object is saved as `qc_output/pbmc3k_filtered.rds`.

| Property | Value |
|---|---|
| Genes | 13,714 |
| Cells | 2,638 |
| Ready for | Normalization → PCA → Clustering → Annotation |

---

## Interpretation

### What the data looks like

**This is a clean, high-quality dataset.** Key observations from the QC plots:

**Panel A — Genes per cell:** The violin shows a compact unimodal distribution centered around 800 genes/cell. No secondary cluster of low-complexity cells (which would suggest debris contamination). Only 5 cells sit above the 2,500-gene doublet threshold.

**Panel B — UMIs per cell:** Median of ~2,200 UMIs/cell is healthy for 3' scRNA-seq. The distribution is right-skewed with a small tail of high-count cells — typical and expected.

**Panel C — Mitochondrial %:** The bulk of cells have MT% between 1–4%. Only 57 cells exceed 5%, and a single extreme outlier reaches ~22%. The distribution is clean with no bimodal structure that would indicate a mixed stressed/healthy population.

**Panel D — UMIs vs Genes:** A tight linear cloud (r = 0.95) with no off-diagonal clusters. Off-diagonal cells (high UMI, low gene count) would indicate ambient RNA contamination — none evident here.

**Panel E — UMIs vs MT%:** The inverse funnel pattern is normal — low-count cells occasionally have higher MT% by chance (fewer cytoplasmic transcripts captured). The main cluster sits comfortably below the 5% threshold.

**Panel F — Cells retained:** 2,638/2,700 cells (97.7%) pass all filters — excellent retention rate.

### Caveats and next steps

- **The 5 high-gene cells** may be doublets. If downstream clustering produces a cluster with unusually high nCount and mixed marker expression, consider running **DoubletFinder** as an additional filter.
- **No ambient RNA correction** was applied (e.g., SoupX or CellBender). For this showcase dataset the signal-to-noise ratio is high, so this is unlikely to affect downstream results materially.
- **The 5% MT threshold** is conservative and data-driven for this sample. For samples with metabolically active cells (e.g., cardiomyocytes, neurons) a higher threshold would be appropriate.

---

## Output Files

| File | Description |
|---|---|
| `qc_output/qc_summary_figure.png` | 6-panel QC summary figure |
| `qc_output/pbmc3k_filtered.rds` | Filtered Seurat object (ready for downstream analysis) |
| `qc_output/01_violin_qc.png` | Individual violin plots |
| `qc_output/02_scatter_qc.png` | Scatter plots |
| `qc_output/03_mt_histogram.png` | MT% distribution histogram |

---

## Environment

| Software | Version |
|---|---|
| R | 4.5.2 |
| Seurat | 5.4.0 |
| SeuratObject | 5.3.0 |
| ggplot2 | 4.0.2 |
| patchwork | 1.3.2 |
