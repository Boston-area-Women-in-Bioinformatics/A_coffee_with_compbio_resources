# Single-Cell RNA-seq QC Pipeline

A reproducible quality control pipeline for 10X Genomics single-cell RNA-seq data using **Seurat**. Produces a 6-panel summary figure, a filtered Seurat object, a Markdown/HTML report, and an optional PowerPoint presentation.

---

## Requirements

| Tool | Version | Notes |
|---|---|---|
| R | ≥ 4.4 | [r-project.org](https://www.r-project.org/) |
| Seurat | ≥ 5.0 | Installed automatically on first run |
| ggplot2 / patchwork | any | Installed automatically on first run |
| rmarkdown + knitr | any | Required for HTML report only |
| pandoc | ≥ 3.0 | Required for HTML report — [pandoc.org](https://pandoc.org/installing.html) |
| Node.js | ≥ 18 | Required for PowerPoint slides only |

---

## Quick Start

### 1. Get the data

Download the PBMC 3K dataset from 10X Genomics and extract it into the project root:

```bash
curl -L -O https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz
tar -xzf pbmc3k_filtered_gene_bc_matrices.tar.gz
```

Expected structure after extraction:
```
filtered_gene_bc_matrices/
  hg19/
    barcodes.tsv
    genes.tsv
    matrix.mtx
```

### 2. Install R packages (first run only)

```bash
Rscript install_seurat.R
```

### 3. Run QC analysis + build summary figure

```bash
Rscript build_outputs.R
```

This creates `qc_output/` containing:
- `qc_summary_figure.png` — 6-panel QC figure
- `pbmc3k_filtered.rds` — filtered Seurat object (ready for downstream analysis)
- `qc_stats.rds` — QC statistics used by the report and slides

### 4. Render HTML report

Requires pandoc installed on PATH or at `C:/Program Files/Pandoc/`.

```bash
Rscript render_html.R
```

Produces `PBMC3K_QC_Report.html` — self-contained, floating TOC, figure embedded.

### 5. Generate PowerPoint slides (optional)

```bash
npm install          # first run only
node build_slides.js
```

Produces `qc_output/PBMC3K_QC_Presentation.pptx` — 7-slide deck.

---

## Output Files

| File | Description |
|---|---|
| `qc_output/qc_summary_figure.png` | 6-panel QC figure (violins, scatters, bar) |
| `qc_output/pbmc3k_filtered.rds` | Filtered Seurat object for downstream analysis |
| `PBMC3K_QC_Report.md` | Markdown QC report |
| `PBMC3K_QC_Report.html` | Self-contained HTML report |
| `qc_output/PBMC3K_QC_Presentation.pptx` | 7-slide PowerPoint deck |

---

## QC Thresholds

Default thresholds (edit in `build_outputs.R`):

| Filter | Threshold | Rationale |
|---|---|---|
| Min genes per cell | ≥ 200 | Remove empty droplets / debris |
| Max genes per cell | ≤ 2,500 | Flag likely doublets |
| Mitochondrial % | ≤ 5% | Remove damaged / dying cells |

---

## Notes

- The slide export scripts (`export_slides.ps1`, `export_slides.vbs`, `export_slides.py`) require **Microsoft PowerPoint on Windows** and are optional — the `.pptx` file can be opened directly.
- For **mouse data**, change the MT pattern in `build_outputs.R` from `^MT-` to `^mt-`.
- For **Cell Ranger v3+** output (`features.tsv.gz`), `Read10X()` handles both formats automatically.
