lib_path <- file.path(Sys.getenv("USERPROFILE"), "R", "win-library",
                      paste0(R.version$major, ".", substr(R.version$minor, 1, 1)))
dir.create(lib_path, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(lib_path, .libPaths()))

# ── Locate pandoc ──────────────────────────────────────────────────────────────
pandoc_candidates <- c(
  Sys.which("pandoc"),
  "C:/Program Files/Pandoc/pandoc.exe",
  file.path(Sys.getenv("LOCALAPPDATA"), "Pandoc", "pandoc.exe")
)
pandoc_dir <- dirname(Filter(function(p) nchar(p) > 0 && file.exists(p),
                             pandoc_candidates)[1])
if (is.na(pandoc_dir) || pandoc_dir == ".") {
  stop("pandoc not found. Install from https://pandoc.org/installing.html and re-run.")
}
Sys.setenv(RSTUDIO_PANDOC = pandoc_dir)

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
