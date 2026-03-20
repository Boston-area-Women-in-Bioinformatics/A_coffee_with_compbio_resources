### Build QC Summary Figure + Save Filtered Object ###

lib_path <- file.path(Sys.getenv("USERPROFILE"), "R", "win-library",
                      paste0(R.version$major, ".", substr(R.version$minor, 1, 1)))
dir.create(lib_path, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(lib_path, .libPaths()))

suppressPackageStartupMessages({
  library(Seurat)
  library(ggplot2)
  library(patchwork)
  library(RColorBrewer)
})

# ── Paths ─────────────────────────────────────────────────────────────────────
script_dir <- tryCatch(
  dirname(normalizePath(sys.frames()[[1]]$ofile)),
  error = function(e) getwd()
)
data_dir <- file.path(script_dir, "filtered_gene_bc_matrices", "hg19")
out_dir  <- file.path(script_dir, "qc_output")
dir.create(out_dir, showWarnings = FALSE)

# ── Load & annotate ───────────────────────────────────────────────────────────
cat("Loading data...\n")
counts <- Read10X(data.dir = data_dir)
pbmc   <- CreateSeuratObject(counts = counts, project = "PBMC3K",
                              min.cells = 3, min.features = 200)
pbmc[["percent.mt"]] <- PercentageFeatureSet(pbmc, pattern = "^MT-")

# ── Thresholds ────────────────────────────────────────────────────────────────
feat_lo  <- 200
feat_hi  <- 2500
mt_cut   <- 5

pbmc@meta.data$qc_pass <- with(pbmc@meta.data,
  nFeature_RNA >= feat_lo & nFeature_RNA <= feat_hi & percent.mt <= mt_cut)

md <- pbmc@meta.data

# ── Palette ───────────────────────────────────────────────────────────────────
col_pass <- "#2166ac"
col_fail <- "#d73027"
col_fill <- "#4393c3"

# ── Panel A: nFeature violin ───────────────────────────────────────────────────
pA <- ggplot(md, aes(x = "All cells", y = nFeature_RNA)) +
  geom_violin(fill = col_fill, colour = NA, alpha = 0.85) +
  geom_jitter(aes(colour = qc_pass), width = 0.25, size = 0.4, alpha = 0.5) +
  geom_hline(yintercept = c(feat_lo, feat_hi), linetype = "dashed",
             colour = col_fail, linewidth = 0.6) +
  scale_colour_manual(values = c("TRUE" = col_pass, "FALSE" = col_fail),
                      labels = c("TRUE" = "Pass", "FALSE" = "Fail"),
                      name = "QC") +
  scale_y_continuous(labels = scales::comma) +
  labs(title = "A  Genes per cell", x = NULL, y = "nFeature_RNA") +
  theme_classic(base_size = 10) +
  theme(legend.position = "none", axis.text.x = element_blank(),
        axis.ticks.x = element_blank())

# ── Panel B: nCount violin ─────────────────────────────────────────────────────
pB <- ggplot(md, aes(x = "All cells", y = nCount_RNA)) +
  geom_violin(fill = col_fill, colour = NA, alpha = 0.85) +
  geom_jitter(aes(colour = qc_pass), width = 0.25, size = 0.4, alpha = 0.5) +
  scale_colour_manual(values = c("TRUE" = col_pass, "FALSE" = col_fail),
                      name = "QC") +
  scale_y_continuous(labels = scales::comma) +
  labs(title = "B  UMIs per cell", x = NULL, y = "nCount_RNA") +
  theme_classic(base_size = 10) +
  theme(legend.position = "none", axis.text.x = element_blank(),
        axis.ticks.x = element_blank())

# ── Panel C: MT% violin ────────────────────────────────────────────────────────
pC <- ggplot(md, aes(x = "All cells", y = percent.mt)) +
  geom_violin(fill = col_fill, colour = NA, alpha = 0.85) +
  geom_jitter(aes(colour = qc_pass), width = 0.25, size = 0.4, alpha = 0.5) +
  geom_hline(yintercept = mt_cut, linetype = "dashed",
             colour = col_fail, linewidth = 0.6) +
  scale_colour_manual(values = c("TRUE" = col_pass, "FALSE" = col_fail),
                      labels = c("TRUE" = "Pass", "FALSE" = "Fail"),
                      name = "QC") +
  labs(title = "C  Mitochondrial %", x = NULL, y = "percent.mt") +
  theme_classic(base_size = 10) +
  theme(legend.position = "right", axis.text.x = element_blank(),
        axis.ticks.x = element_blank())

# ── Panel D: nCount vs nFeature scatter ────────────────────────────────────────
pD <- ggplot(md, aes(x = nCount_RNA, y = nFeature_RNA, colour = qc_pass)) +
  geom_point(size = 0.5, alpha = 0.6) +
  geom_hline(yintercept = c(feat_lo, feat_hi), linetype = "dashed",
             colour = col_fail, linewidth = 0.5) +
  scale_colour_manual(values = c("TRUE" = col_pass, "FALSE" = col_fail),
                      labels = c("TRUE" = "Pass", "FALSE" = "Fail"),
                      name = "QC") +
  scale_x_continuous(labels = scales::comma) +
  scale_y_continuous(labels = scales::comma) +
  labs(title = "D  UMIs vs Genes", x = "nCount_RNA", y = "nFeature_RNA") +
  theme_classic(base_size = 10) +
  theme(legend.position = "none")

# ── Panel E: nCount vs MT% scatter ────────────────────────────────────────────
pE <- ggplot(md, aes(x = nCount_RNA, y = percent.mt, colour = qc_pass)) +
  geom_point(size = 0.5, alpha = 0.6) +
  geom_hline(yintercept = mt_cut, linetype = "dashed",
             colour = col_fail, linewidth = 0.5) +
  scale_colour_manual(values = c("TRUE" = col_pass, "FALSE" = col_fail),
                      labels = c("TRUE" = "Pass", "FALSE" = "Fail"),
                      name = "QC") +
  scale_x_continuous(labels = scales::comma) +
  labs(title = "E  UMIs vs MT%", x = "nCount_RNA", y = "percent.mt") +
  theme_classic(base_size = 10) +
  theme(legend.position = "none")

# ── Panel F: QC pass/fail bar ──────────────────────────────────────────────────
n_pass <- sum(md$qc_pass)
n_fail <- nrow(md) - n_pass
bar_df <- data.frame(
  Status = factor(c("Pass", "Fail"), levels = c("Pass", "Fail")),
  Cells  = c(n_pass, n_fail),
  Pct    = round(100 * c(n_pass, n_fail) / nrow(md), 1)
)

pF <- ggplot(bar_df, aes(x = Status, y = Cells, fill = Status)) +
  geom_col(width = 0.5, colour = "white") +
  geom_text(aes(label = paste0(Cells, "\n(", Pct, "%)")),
            vjust = -0.3, size = 3.2) +
  scale_fill_manual(values = c("Pass" = col_pass, "Fail" = col_fail)) +
  scale_y_continuous(expand = expansion(mult = c(0, 0.18))) +
  labs(title = "F  Cells retained", x = NULL, y = "Cell count") +
  theme_classic(base_size = 10) +
  theme(legend.position = "none")

# ── Assemble ──────────────────────────────────────────────────────────────────
fig <- (pA | pB | pC) / (pD | pE | pF) +
  plot_annotation(
    title   = "PBMC 3K — Seurat Quality Control Summary",
    subtitle = sprintf(
      "Thresholds: %d ≤ nFeature ≤ %d  |  MT%% ≤ %d%%  |  Input: %d cells  →  Retained: %d cells",
      feat_lo, feat_hi, mt_cut, nrow(md), n_pass),
    theme = theme(
      plot.title    = element_text(size = 13, face = "bold"),
      plot.subtitle = element_text(size = 9,  colour = "grey40")
    )
  )

ggsave(file.path(out_dir, "qc_summary_figure.png"), fig,
       width = 13, height = 8, dpi = 180)
cat("Summary figure saved.\n")

# ── Save filtered object ──────────────────────────────────────────────────────
pbmc_filt <- subset(pbmc,
  subset = nFeature_RNA >= feat_lo &
           nFeature_RNA <= feat_hi &
           percent.mt   <= mt_cut)

saveRDS(pbmc_filt, file.path(out_dir, "pbmc3k_filtered.rds"))
cat(sprintf("Filtered Seurat object saved: %d genes × %d cells\n",
            nrow(pbmc_filt), ncol(pbmc_filt)))
