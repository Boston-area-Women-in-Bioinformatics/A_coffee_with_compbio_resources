"""Export each slide of a PPTX to PNG using PowerPoint COM automation."""
import os, sys, glob

# Paths relative to this script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PPTX = os.path.join(SCRIPT_DIR, "qc_output", "PBMC3K_QC_Presentation.pptx")
OUT  = os.path.join(SCRIPT_DIR, "qc_output", "slide_previews")
os.makedirs(OUT, exist_ok=True)

try:
    import comtypes.client
except ImportError:
    os.system(sys.executable + " -m pip install comtypes -q")
    import comtypes.client

pptx_abs = os.path.abspath(PPTX)
out_abs  = os.path.abspath(OUT)

ppt = comtypes.client.CreateObject("PowerPoint.Application")
ppt.Visible = 1

try:
    prs = ppt.Presentations.Open(pptx_abs, ReadOnly=1, Untitled=0, WithWindow=1)
    for i, slide in enumerate(prs.Slides, 1):
        out_path = os.path.join(out_abs, f"slide_{i:02d}.png")
        slide.Export(out_path, "PNG", 1920, 1080)
        print(f"Slide {i} -> {out_path}")
    prs.Close()
finally:
    ppt.Quit()

files = sorted(glob.glob(os.path.join(out_abs, "slide_*.png")))
print(f"\nExported {len(files)} slides to {out_abs}")
