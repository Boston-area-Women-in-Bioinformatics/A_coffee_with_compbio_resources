# Single-Cell RNA-seq QC Pipeline (Python / Scanpy)

A reproducible quality control pipeline for 10X Genomics single-cell RNA-seq data using **Scanpy**. Produces 4 publication-quality figures, a filtered AnnData object, and a Markdown QC report.

Works on **macOS**, **Windows**, and **Linux**.

See the companion R/Seurat version in `../R/`.

---

## Requirements

| Tool | Version | Notes |
|---|---|---|
| Python | >= 3.9 | See install instructions below |
| scanpy | >= 1.9 | Installed via requirements.txt |
| anndata | >= 0.9 | Installed via requirements.txt |
| matplotlib | >= 3.7 | Installed via requirements.txt |
| seaborn | >= 0.12 | Installed via requirements.txt |
| pandas | >= 2.0 | Installed via requirements.txt |
| numpy | >= 1.24 | Installed via requirements.txt |

---

## Installation

### Python

| Platform | Command |
|---|---|
| **macOS** | `brew install python` or download from [python.org](https://www.python.org/) |
| **Windows** | `winget install Python.Python.3` or download from [python.org](https://www.python.org/) |
| **Linux** | `sudo apt-get install python3 python3-pip` (Debian/Ubuntu) or `sudo dnf install python3` (Fedora) |

### Python packages

```bash
pip install -r requirements.txt
```

No `sudo` needed — installs to your user environment (or activate a virtual environment first).

---

## Quick Start

### 1. Get the data

The dataset is downloaded automatically on first run via `sc.datasets.pbmc3k()` (~20 MB).

Alternatively, download manually:

```bash
curl -L -O https://cf.10xgenomics.com/samples/cell/pbmc3k/pbmc3k_filtered_gene_bc_matrices.tar.gz
tar -xzf pbmc3k_filtered_gene_bc_matrices.tar.gz
```

### 2. Run QC analysis

```bash
python qc_analysis.py
```

Creates `figures/` and `results/` containing:
- `figures/01_qc_violin.png` — violin plots of QC metrics (pre-filter)
- `figures/02_qc_scatter.png` — scatter: nCounts vs nGenes, colored by %MT
- `figures/03_qc_histograms.png` — distribution histograms with thresholds marked
- `figures/04_qc_violin_post.png` — violin plots after filtering
- `results/pbmc3k_filtered.h5ad` — filtered AnnData object (ready for downstream analysis)

---

## Output Files

| File | Description |
|---|---|
| `figures/01_qc_violin.png` | Violin plots of QC metrics before filtering |
| `figures/02_qc_scatter.png` | nCounts vs nGenes scatter, colored by % mitochondrial |
| `figures/03_qc_histograms.png` | Distributions with filter threshold lines |
| `figures/04_qc_violin_post.png` | Violin plots after filtering |
| `results/pbmc3k_filtered.h5ad` | Filtered AnnData object for downstream analysis |
| `QC_REPORT.md` | Markdown QC summary report |

---

## QC Thresholds

Default thresholds (edit constants at the top of `qc_analysis.py`):

| Filter | Threshold | Rationale |
|---|---|---|
| Min genes per cell | >= 200 | Remove empty droplets / debris |
| Max genes per cell | <= 2,500 | Flag likely doublets |
| Min UMI counts per cell | >= 500 | Remove low-quality cells |
| Mitochondrial % | < 5% | Remove damaged / dying cells |
| Min cells per gene | >= 3 | Remove unexpressed genes |

---

## Notes

- **Mouse data**: change the MT pattern in `qc_analysis.py` from `"MT-"` to `"mt-"`.
- **CLAUDE.md**: included as a demo artifact — it contains the instructions used during the live Claude Code demo for the podcast.
- **Figures** are saved at 300 dpi, suitable for slides and publications.
- All thresholds are defined as constants at the top of `qc_analysis.py` for easy adjustment.
