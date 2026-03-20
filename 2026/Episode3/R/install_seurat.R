options(repos = c(CRAN = "https://cloud.r-project.org"))

# Set user library
lib_path <- file.path(Sys.getenv("USERPROFILE"), "R", "win-library",
                      paste0(R.version$major, ".", substr(R.version$minor, 1, 1)))
dir.create(lib_path, recursive = TRUE, showWarnings = FALSE)
.libPaths(c(lib_path, .libPaths()))
cat("Library path:", lib_path, "\n")

cat("Installing Seurat...\n")
install.packages("Seurat", lib = lib_path)
cat("Seurat install done!\n")
cat("Seurat version:", as.character(packageVersion("Seurat")), "\n")
