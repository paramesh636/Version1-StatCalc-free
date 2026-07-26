// src/pdf-exporter.js

async function generateModularPDF({ title, datasetHTML, resultsHTML, chartCanvasId, stepsHTML }) {
    const parentDoc = window.parent.document;
    let printContainer = parentDoc.getElementById("print-report");
    let printStyle = parentDoc.getElementById("print-style-override");

    try {
        // 1. Inject global print stylesheet if not already present
        if (!printStyle) {
            printStyle = parentDoc.createElement("style");
            printStyle.id = "print-style-override";
            printStyle.innerHTML = `
                #print-report {
                    position: absolute; left: -9999px; top: 0; width: 794px; z-index: -100;
                }
                @media print {
                    body * { visibility: hidden !important; }
                    #print-report, #print-report * { visibility: visible !important; }
                    #print-report {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 100% !important; margin: 0 !important; padding: 20px !important;
                        background: white !important; color: #222 !important;
                        font-family: Helvetica, Arial, sans-serif !important;
                        font-size: 16px !important; line-height: 1.6 !important; z-index: 9999 !important;
                    }
                    .page-break-before { page-break-before: always !important; }
                    .report-block, img, h1, h2, h3 { page-break-inside: avoid !important; break-inside: avoid !important; }
                }
            `;
            parentDoc.head.appendChild(printStyle);
        }

        // 2. Create or reset container
        if (!printContainer) {
            printContainer = parentDoc.createElement("div");
            printContainer.id = "print-report";
            parentDoc.body.appendChild(printContainer);
        }

        // 3. Extract chart image if a canvas ID was provided
        let chartImageSection = "";
        if (chartCanvasId) {
            const chartCanvas = document.getElementById(chartCanvasId);
            if (chartCanvas) {
                const chartImageURI = chartCanvas.toDataURL("image/png", 1.0);
                chartImageSection = `
                    <div class="report-block" style="margin-bottom: 35px; text-align: center;">
                        <h2 style="font-size: 22px; color: #111; text-align: left; border-left: 5px solid #0066cc; padding-left: 12px; margin-bottom: 20px;">3. Visual Representation</h2>
                        <img src="${chartImageURI}" style="width: 90%; max-width: 700px; display: block; margin: 0 auto; border: 1px solid #ccc; border-radius: 6px; padding: 10px;" />
                    </div>
                `;
            }
        }

        // 4. Assemble the layout
        printContainer.innerHTML = `
            <div class="report-block" style="text-align: center; border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #0066cc; margin: 0; font-size: 32px;">${title}</h1>
            </div>

            <div class="report-block" style="margin-bottom: 30px;">
                <h2 style="font-size: 22px; color: #111; border-left: 5px solid #0066cc; padding-left: 12px; margin-bottom: 15px;">1. Input Data</h2>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 15px; font-family: monospace; word-wrap: break-word; border: 1px solid #ddd;">
                    ${datasetHTML}
                </div>
            </div>

            <div class="report-block" style="margin-bottom: 30px;">
                <h2 style="font-size: 22px; color: #111; border-left: 5px solid #0066cc; padding-left: 12px; margin-bottom: 15px;">2. Calculated Results</h2>
                ${resultsHTML}
            </div>

            ${chartImageSection}

            <div class="report-block page-break-before" style="font-size: 16px;">
                <h2 style="font-size: 22px; color: #111; border-left: 5px solid #0066cc; padding-left: 12px; margin-bottom: 15px;">4. Step-by-Step Breakdown</h2>
                <div style="font-size: 16px; line-height: 1.7;">${stepsHTML || "<p>No steps generated.</p>"}</div>
            </div>
        `;

        // 5. Run MathJax
        if (window.MathJax && MathJax.typesetPromise) {
            await MathJax.typesetPromise([printContainer]);
            document.querySelectorAll('style[id^="mjx-"], style[id^="MathJax"]').forEach(styleEl => {
                if (!parentDoc.getElementById(styleEl.id)) {
                    parentDoc.head.appendChild(styleEl.cloneNode(true));
                }
            });
        }

        // 6. Trigger Electron PDF API
        const api = window.electronAPI || window.parent.electronAPI || window.top.electronAPI;
        if (!api) throw new Error("Electron API bridge not found!");

        const safeFilename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0,10)}.pdf`;
        const result = await api.exportToPDF(safeFilename);

        if (!result.success && result.message !== 'Cancelled by user') {
            alert("Error saving PDF: " + result.message);
        }

    } catch (error) {
        console.error("Modular PDF Export Error:", error);
        alert("Export Failed: " + (error.message || error));
    } finally {
        if (printContainer && printContainer.parentNode) {
            printContainer.parentNode.removeChild(printContainer);
        }
    }
}

function formatDataForReport(arrStr) {
                const arr = arrStr.split(/[\s,]+/).filter(Boolean);
                if (arr.length > 30) {
                    const first = arr.slice(0, 20).join(", ");
                    const last = arr.slice(-10).join(", ");
                    return `${first}, ... [${arr.length - 30} more values] ..., ${last}`;
                }
                return arr.join(", ");
}