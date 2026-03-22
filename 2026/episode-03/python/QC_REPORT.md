# PBMC3k Single-Cell RNA-seq QC Report
### Coffee with CompBio Podcast — Claude Code Demo

---

## Dataset

| | |
|---|---|
| **Source** | 10x Genomics PBMC3k (peripheral blood mononuclear cells) |
| **Technology** | 10x Chromium v2, Illumina sequencing |
| **Reference genome** | GRCh38 |
| **Loaded via** | `scanpy.datasets.pbmc3k()` |

---

## Pre-filter Summary

| Metric | Value |
|---|---|
| Total cells | 2,700 |
| Total genes | 32,738 |
| Median genes / cell | 817 |
| Median UMI counts / cell | 2,197 |
| Median % mitochondrial | 2.03% |
| Mitochondrial genes detected | 13 (MT- prefix) |

---

## QC Thresholds Applied

| Metric | Filter | Rationale |
|---|---|---|
| Genes per cell | 200 – 2,500 | Remove empty droplets (low) and doublets (high) |
| Total UMI counts | ≥ 500 | Remove low-quality / damaged cells |
| % Mitochondrial reads | < 5% | Remove dying or stressed cells |
| Gene min cells | ≥ 3 | Remove genes detected in very few cells |

---

## Filtering Results

| | Cells | Genes |
|---|---|---|
| **Before filtering** | 2,700 | 32,738 |
| **After filtering** | 2,638 | 13,656 |
| **Removed** | 62 (2.3%) | 19,082 |

> This dataset is already high quality — only 2.3% of cells were removed, consistent with a well-prepared PBMC sample.

---

## QC Figures

### Figure 1 — Pre-filter Violin Plots
Distributions of the three core QC metrics across all 2,700 cells before any filtering.

![Pre-filter Violin Plots](figures/01_qc_violin.png)

**Key observations:**
- Genes/cell distribution is right-skewed with a long tail (potential doublets above 2,500)
- UMI counts are broadly distributed; most cells are well above the 500-count minimum
- % Mitochondrial reads is low overall (median 2.03%), with a small tail of stressed cells above 5%

---

### Figure 2 — QC Scatter Plots
Cell-level scatter of UMI counts vs. genes detected (colored by % mitochondrial), plus a ranked % mito distribution.

![QC Scatter Plots](figures/02_qc_scatter.png)

**Key observations:**
- Strong positive correlation between total counts and genes detected — expected
- High-MT cells (red) tend to cluster at lower gene counts, consistent with dying cells leaking cytoplasmic RNA
- The ranked MT plot shows the vast majority of cells are well below the 5% threshold

---

### Figure 3 — Distribution Histograms with Thresholds
Histograms for each QC metric with min/max filter thresholds marked. Red-shaded regions indicate cells that will be removed.

![QC Histograms](figures/03_qc_histograms.png)

**Key observations:**
- Very few cells fall below the 200-gene minimum (empty droplets already largely absent in filtered matrix)
- A small tail of high-gene cells (potential doublets) is clipped at 2,500
- The MT distribution is concentrated below 5% with only a small fraction exceeding the threshold

---

### Figure 4 — Post-filter Violin Plots
Same metrics after applying all QC filters to the 2,638 retained cells.

![Post-filter Violin Plots](figures/04_qc_violin_post.png)

**Key observations:**
- Tighter distributions — extreme outliers removed
- % Mito is now strictly bounded below 5%
- Gene and count distributions are cleaner and more suitable for downstream analysis

---

## Output Files

| File | Description |
|---|---|
| `figures/01_qc_violin.png` | Pre-filter violin plots (300 dpi) |
| `figures/02_qc_scatter.png` | nCounts vs nGenes scatter + ranked MT (300 dpi) |
| `figures/03_qc_histograms.png` | Distributions with filter thresholds (300 dpi) |
| `figures/04_qc_violin_post.png` | Post-filter violin plots (300 dpi) |
| `results/pbmc3k_filtered.h5ad` | Filtered AnnData object — ready for normalization & clustering |

---

## Next Steps

After QC, the standard Scanpy workflow continues:

```python
# 1. Normalize and log-transform
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 2. Identify highly variable genes
sc.pp.highly_variable_genes(adata, min_mean=0.0125, max_mean=3, min_disp=0.5)

# 3. Scale data
sc.pp.scale(adata, max_value=10)

# 4. PCA → neighbors → UMAP → clustering
sc.tl.pca(adata)
sc.pp.neighbors(adata)
sc.tl.umap(adata)
sc.tl.leiden(adata)
```

---

*Generated with [Claude Code](https://claude.ai/claude-code) · scanpy 1.10.1 · PBMC3k dataset (10x Genomics)*
