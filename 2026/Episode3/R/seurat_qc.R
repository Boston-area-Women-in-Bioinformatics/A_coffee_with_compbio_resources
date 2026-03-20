### Seurat QC — PBMC 3K ###

lib_path <- file.path(Sys.getenv("USERPROFILE"), "R", "win-library",
                      paste0(R.version$major, ".", substr(R.version$minor, 1, 1)))
dir.create(lib_path, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(lib_path, .libPaths()))

suppressPackageStartupMessages({
  library(Seurat)
  library(ggplot2)
  library(patchwork)
})

script_dir <- tryCatch(
  dirname(normalizePath(sys.frames()[[1]]$ofile)),
  error = function(e) getwd()
)
data_dir <- file.path(script_dir, "filtered_gene_bc_matrices", "hg19")
out_dir  <- file.path(script_dir, "qc_output")
dir.create(out_dir, showWarnings = FALSE)

# ── 1. Load data ──────────────────────────────────────────────────────────────
cat("\n=== Loading data ===\n")
counts <- Read10X(data.dir = data_dir)
pbmc   <- CreateSeuratObject(counts = counts, project = "PBMC3K",
                              min.cells = 3, min.features = 200)
cat("Dimensions after min.cells=3, min.features=200:", dim(pbmc), "\n")

# ── 2. Mitochondrial % ────────────────────────────────────────────────────────
cat("\n=== Computing MT % ===\n")
pbmc[["percent.mt"]] <- PercentageFeatureSet(pbmc, pattern = "^MT-")

# ── 3. Summary stats ──────────────────────────────────────────────────────────
cat("\n=== QC Metric Summary ===\n")
qc_df <- pbmc@meta.data[, c("nFeature_RNA", "nCount_RNA", "percent.mt")]

print_stats <- function(x, label) {
  cat(sprintf("%-14s  min=%6.1f  median=%7.1f  mean=%7.1f  max=%8.1f  sd=%6.1f\n",
              label, min(x), median(x), mean(x), max(x), sd(x)))
}
print_stats(qc_df$nFeature_RNA, "nFeature_RNA")
print_stats(qc_df$nCount_RNA,   "nCount_RNA")
print_stats(qc_df$percent.mt,   "percent.mt")

# Correlation nCount vs nFeature
r <- cor(qc_df$nCount_RNA, qc_df$nFeature_RNA)
cat(sprintf("\nCorrelation nCount ~ nFeature: r = %.4f\n", r))

# ── 4. Identify likely doublets / debris ──────────────────────────────────────
# Common Seurat heuristic thresholds
mt_thresh    <- 5       # % MT cutoff
feat_lo      <- 200     # min genes
feat_hi      <- 2500    # max genes (doublet proxy)

n_high_mt    <- sum(qc_df$percent.mt  > mt_thresh)
n_low_feat   <- sum(qc_df$nFeature_RNA < feat_lo)
n_high_feat  <- sum(qc_df$nFeature_RNA > feat_hi)
n_total      <- nrow(qc_df)

cat(sprintf("\n=== Cells failing thresholds ===\n"))
cat(sprintf("  High MT (>%g%%)   : %d / %d  (%.1f%%)\n",
            mt_thresh, n_high_mt, n_total, 100*n_high_mt/n_total))
cat(sprintf("  Low features (<200) : %d / %d  (%.1f%%)\n",
            n_low_feat, n_total, 100*n_low_feat/n_total))
cat(sprintf("  High features (>2500): %d / %d  (%.1f%%)\n",
            n_high_feat, n_total, 100*n_high_feat/n_total))

keep <- qc_df$nFeature_RNA >= feat_lo &
        qc_df$nFeature_RNA <= feat_hi &
        qc_df$percent.mt   <= mt_thresh
cat(sprintf("\n  Cells PASSING all thresholds: %d / %d  (%.1f%%)\n",
            sum(keep), n_total, 100*sum(keep)/n_total))

# ── 5. Plots ──────────────────────────────────────────────────────────────────
cat("\n=== Saving QC plots ===\n")

# Violin plot
p_vln <- VlnPlot(pbmc,
                 features = c("nFeature_RNA", "nCount_RNA", "percent.mt"),
                 ncol = 3, pt.size = 0.1) &
         theme(plot.title = element_text(size = 11))

ggsave(file.path(out_dir, "01_violin_qc.png"), p_vln,
       width = 12, height = 5, dpi = 150)

# Scatter: nCount vs nFeature, coloured by MT%
p_s1 <- FeatureScatter(pbmc, feature1 = "nCount_RNA", feature2 = "nFeature_RNA") +
        ggtitle("nCount vs nFeature")
p_s2 <- FeatureScatter(pbmc, feature1 = "nCount_RNA", feature2 = "percent.mt") +
        ggtitle("nCount vs %MT")

ggsave(file.path(out_dir, "02_scatter_qc.png"), p_s1 + p_s2,
       width = 12, height = 5, dpi = 150)

# Histogram of MT%
p_hist <- ggplot(qc_df, aes(x = percent.mt)) +
  geom_histogram(bins = 60, fill = "#4393c3", colour = "white", linewidth = 0.2) +
  geom_vline(xintercept = mt_thresh, colour = "red", linetype = "dashed") +
  annotate("text", x = mt_thresh + 0.3, y = Inf, vjust = 1.5,
           label = paste0(mt_thresh, "% cutoff"), colour = "red", size = 3.5) +
  labs(title = "Distribution of MT%", x = "% Mitochondrial reads", y = "Cells") +
  theme_classic()

ggsave(file.path(out_dir, "03_mt_histogram.png"), p_hist,
       width = 7, height = 4, dpi = 150)

# ── 6. Filter & confirm ───────────────────────────────────────────────────────
cat("\n=== Filtered Seurat object ===\n")
pbmc_filt <- subset(pbmc,
                    subset = nFeature_RNA >= feat_lo &
                             nFeature_RNA <= feat_hi &
                             percent.mt   <= mt_thresh)
cat("Dimensions after filtering:", dim(pbmc_filt), "\n")

cat("\nDone! Plots saved to:", out_dir, "\n")
