Dim pptApp, prs, slide, i, outDir, outFile, pptxPath, scriptDir

' Derive paths relative to this script's location
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
pptxPath  = scriptDir & "qc_output\PBMC3K_QC_Presentation.pptx"
outDir    = scriptDir & "qc_output\slide_previews\"

Set pptApp = CreateObject("PowerPoint.Application")
pptApp.Visible = True

' Use AddFromFile with full path trust workaround
pptApp.Presentations.Open pptxPath, False, False, True

Set prs = pptApp.Presentations(1)

For i = 1 To prs.Slides.Count
    Set slide = prs.Slides(i)
    If i < 10 Then
        outFile = outDir & "slide_0" & i & ".png"
    Else
        outFile = outDir & "slide_" & i & ".png"
    End If
    slide.Export outFile, "PNG", 1920, 1080
    WScript.Echo "Exported slide " & i
Next

prs.Close False
pptApp.Quit

WScript.Echo "Done."
