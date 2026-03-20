# Single-Cell RNA-seq QC Pipeline

A reproducible quality control pipeline for 10X Genomics single-cell RNA-seq data using **Seurat**. Produces a 6-panel summary figure, a filtered Seurat object, a Markdown/HTML report, and an optional PowerPoint presentation.

Works on **macOS**, **Windows**, and **Linux**.

---

## Requirements

| Tool | Version | Notes |
|---|---|---|
| R | ≥ 4.4 | See install instructions below |
| Seurat | ≥ 5.0 | Installed automatically on first run |
| ggplot2 / patchwork | any | Installed automatically on first run |
| rmarkdown + knitr | any | Required for HTML report — installed automatically |
| pandoc | ≥ 3.0 | Required for HTML report — see install below |
| Node.js | ≥ 18 | Required for PowerPoint slides only |

---

## Installation

### R

| Platform | Command |
|---|---|
| **macOS** | `brew install --cask r` or download from [r-project.org](https://www.r-project.org/) |
| **Windows** | `winget install RProject.R` or download from [r-project.org](https://www.r-project.org/) |
| **Linux** | `sudo apt-get install r-base` (Debian/Ubuntu) or `sudo dnf install R` (Fedora) |

### pandoc (for HTML report)

| Platform | Command |
|---|---|
| **macOS** | `brew install pandoc` |
| **Windows** | `winget install --id JohnMacFarlane.Pandoc` |
| **Linux** | `sudo apt-get install pandoc` |

### Node.js (for PowerPoint slides only)

| Platform | Command |
|---|---|
| **macOS** | `brew install node` |
| **Windows** | `winget install OpenJS.NodeJS` |
| **Linux** | `sudo apt-get install nodejs npm` |

---

## Quick Start

### 1. Get the data

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

Automatically skips packages that are already installed. Uses a user-level library path — no `sudo` needed.

### 3. Run QC analysis + build summary figure

```bash
Rscript build_outputs.R
```

Creates `qc_output/` containing:
- `qc_summary_figure.png` — 6-panel QC figure
- `pbmc3k_filtered.rds` — filtered Seurat object (ready for downstream analysis)
- `qc_stats.rds` — QC statistics used by the report and slides

### 4. Render HTML report

```bash
Rscript render_html.R
```

Automatically locates pandoc on your system. Produces `PBMC3K_QC_Report.html` — self-contained with floating TOC and embedded figure.

### 5. Generate PowerPoint slides (optional)

```bash
npm install          # first run only — skips if node_modules already present
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

- **Slide export scripts** (`export_slides.ps1`, `export_slides.vbs`, `export_slides.py`) require Microsoft PowerPoint on Windows and are optional — the `.pptx` opens directly in PowerPoint or Google Slides on any platform.
- **Mouse data**: change the MT pattern in `build_outputs.R` from `^MT-` to `^mt-`.
- **Cell Ranger v3+** output (`features.tsv.gz`): `Read10X()` handles both formats automatically.
- **R packages** are installed to a per-user library — no admin/sudo privileges required.
