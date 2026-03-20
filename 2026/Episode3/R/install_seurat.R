options(repos = c(CRAN = "https://cloud.r-project.org"))

# ── Cross-platform user library path ──────────────────────────────────────────
r_ver    <- paste0(R.version$major, ".", substr(R.version$minor, 1, 1))
lib_path <- switch(
  Sys.info()[["sysname"]],
  "Windows" = file.path(Sys.getenv("USERPROFILE"), "R", "win-library", r_ver),
  "Darwin"  = path.expand(file.path("~", "Library", "R", r_ver, "library")),
             path.expand(file.path("~", "R", "library"))  # Linux
)
dir.create(lib_path, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(lib_path, .libPaths()))
cat("Library path:", lib_path, "\n")

# ── Install missing packages only ─────────────────────────────────────────────
pkgs_needed  <- c("Seurat", "ggplot2", "patchwork")
pkgs_missing <- pkgs_needed[!sapply(pkgs_needed, requireNamespace, quietly = TRUE)]
if (length(pkgs_missing) > 0) {
  cat(sprintf("Installing: %s\n", paste(pkgs_missing, collapse = ", ")))
  install.packages(pkgs_missing, lib = lib_path)
} else {
  cat("All packages already installed.\n")
}
cat("Seurat version:", as.character(packageVersion("Seurat")), "\n")
