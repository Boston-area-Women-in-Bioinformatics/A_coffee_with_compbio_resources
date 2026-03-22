# PBMC Single-Cell QC Demo
## Coffee with CompBio Podcast — Claude Code Demo Episode

This project demonstrates how Claude Code can assist with single-cell RNA-seq QC
using a classic 10x Genomics PBMC3k dataset.

---

## Project Goal
Perform standard QC on PBMC3k scRNA-seq data:
1. Download and load the dataset
2. Compute QC metrics (nGenes, nCounts, % mitochondrial)
3. Visualize QC distributions
4. Apply filtering thresholds
5. Output filtered AnnData object + summary plots

---

## Setup

### Install dependencies
```bash
pip install scanpy anndata matplotlib seaborn pandas numpy
```

### Download PBMC3k data (10x Genomics filtered gene-barcode matrix)
The dataset is publicly available from 10x Genomics:
- URL: https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz
- Or via scanpy's built-in loader: `sc.datasets.pbmc3k()`

---

## Running the Analysis

```bash
python qc_analysis.py
```

Outputs saved to `./figures/` and `./results/`

---

## QC Thresholds Used (adjustable in qc_analysis.py)

| Metric              | Min   | Max    | Rationale                        |
|---------------------|-------|--------|----------------------------------|
| n_genes_by_counts   | 200   | 2500   | Remove empty droplets & doublets |
| total_counts        | 500   | —      | Remove low-quality cells         |
| pct_counts_mt       | —     | 5%     | Remove dying/stressed cells      |

---

## File Structure
```
pbmc_qc_demo/
├── CLAUDE.md           ← You are here (Claude Code reads this first)
├── qc_analysis.py      ← Main analysis script
├── figures/            ← QC plots saved here
└── results/            ← Filtered .h5ad saved here
```

---

## Notes for Claude Code
- All thresholds are defined as constants at the top of qc_analysis.py — easy to adjust
- Plots are saved as high-res PNGs (300 dpi) suitable for slides/podcast visuals
- The script prints a human-readable QC summary to stdout
- If data download fails, check your internet connection and the URL above
