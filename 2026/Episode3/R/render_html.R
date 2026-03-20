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

# ── Ensure rmarkdown + knitr are installed ─────────────────────────────────────
pkgs_needed  <- c("rmarkdown", "knitr")
pkgs_missing <- pkgs_needed[!sapply(pkgs_needed, requireNamespace, quietly = TRUE)]
if (length(pkgs_missing) > 0) {
  cat(sprintf("Installing: %s\n", paste(pkgs_missing, collapse = ", ")))
  install.packages(pkgs_missing, repos = "https://cloud.r-project.org", lib = lib_path)
}

# ── Locate pandoc (cross-platform) ────────────────────────────────────────────
pandoc_candidates <- c(
  Sys.which("pandoc"),                                            # on PATH (all OS)
  "C:/Program Files/Pandoc/pandoc.exe",                          # Windows standard
  file.path(Sys.getenv("LOCALAPPDATA"), "Pandoc", "pandoc.exe"), # Windows user
  "/opt/homebrew/bin/pandoc",                                     # macOS Apple Silicon
  "/usr/local/bin/pandoc",                                        # macOS Intel / Linux
  "/usr/bin/pandoc"                                               # Linux system
)
pandoc_found <- Filter(function(p) nzchar(p) && file.exists(p), pandoc_candidates)
if (length(pandoc_found) == 0) {
  stop(paste(
    "pandoc not found. Install it for your platform:",
    "  macOS:   brew install pandoc",
    "  Windows: winget install --id JohnMacFarlane.Pandoc",
    "  Linux:   sudo apt-get install pandoc",
    "Then re-run this script.",
    sep = "\n"
  ))
}
Sys.setenv(RSTUDIO_PANDOC = dirname(pandoc_found[[1]]))
cat("Using pandoc from:", dirname(pandoc_found[[1]]), "\n")

# ── Paths relative to this script ─────────────────────────────────────────────
script_dir <- tryCatch(
  dirname(normalizePath(sys.frames()[[1]]$ofile)),
  error = function(e) getwd()
)
md_file   <- file.path(script_dir, "PBMC3K_QC_Report.md")
html_file <- sub("\\.md$", ".html", md_file)

# ── Render ────────────────────────────────────────────────────────────────────
rmarkdown::render(
  input       = md_file,
  output_file = html_file,
  output_format = rmarkdown::html_document(
    theme           = "flatly",
    toc             = TRUE,
    toc_float       = list(collapsed = FALSE, smooth_scroll = TRUE),
    toc_depth       = 3,
    number_sections = FALSE,
    df_print        = "kable",
    self_contained  = TRUE,
    highlight       = "tango"
  )
)

cat("HTML render complete!\n")
