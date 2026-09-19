// ==================== ui-components.js ====================

const UIC = {
    // Dynamically accepts ANY number of input IDs: e.g., UIC.initImport("x") or UIC.initImport("a", "b", "c", "d")
    initImport: function(...inputIds) {
        // Support passing an array directly: UIC.initImport(["x", "y"])
        const targetIds = Array.isArray(inputIds[0]) ? inputIds[0] : inputIds;
        const requiredCols = targetIds.length;

        const csvInput = document.createElement("input");
        csvInput.type = "file";
        csvInput.accept = ".csv,text/csv";
        csvInput.style.display = "none";
        document.body.appendChild(csvInput);

        const importLink = document.getElementById("import");

        if (importLink) {
            importLink.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                csvInput.click();
            });
        }

        csvInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    const result = StatsCalc.parseCSV(ev.target.result);

                    if (result.rowCount === 0) {
                        alert("No valid numeric data found in the CSV file.");
                        return;
                    }

                    // Auto import if the CSV has exactly or fewer columns than requested
                    if (result.columnCount <= requiredCols) {
                        targetIds.forEach((id, idx) => {
                            const colData = result.columns[idx] || [];
                            const inputEl = document.getElementById(id);
                            if (inputEl) inputEl.value = colData.join(",");
                        });
                        StatsCalc.showToast(`Successfully imported ${result.rowCount} data points`);
                    } else {
                        // Show dynamic column selector for files with more columns than needed
                        UIC.showColumnSelector(result, targetIds, (selectedCols) => {
                            const finalResult = StatsCalc.parseCSV(ev.target.result, { cols: selectedCols });
                            targetIds.forEach((id, idx) => {
                                const colData = finalResult.columns[idx] || [];
                                const inputEl = document.getElementById(id);
                                if (inputEl) inputEl.value = colData.join(",");
                            });
                            StatsCalc.showToast(`Imported ${finalResult.rowCount} rows across ${requiredCols} column(s)`);
                        });
                    }
                } catch (err) {
                    alert("Error parsing CSV: " + err.message);
                }
            };
            reader.readAsText(file);
            csvInput.value = ""; // reset for same file re-upload
        });
    },

    showColumnSelector: function(parseResult, targetIds, onSelect) {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: var(--themegradient); padding: 25px; border-radius: 12px; box-shadow: var(--shadow);
            z-index: 10001; min-width: 420px; max-height: 80vh; overflow-y: auto; font-family: monospace; color: var(--text);
        `;

        let optionsHTML = '';
        parseResult.headers.forEach((header, i) => {
            optionsHTML += `<option value="${i}">${i + 1}: ${header || `Column ${i+1}`}</option>`;
        });

        // Dynamically generate a <select> dropdown for each required target input ID
        let selectorsHTML = '';
        targetIds.forEach((id, idx) => {
            selectorsHTML += `
                <label style="display:block; margin:15px 0 5px;">Select Column for [${id}]:</label>
                <select class="dynamic-col-select" data-index="${idx}" style="width:100%; padding:8px;">
                    ${parseResult.headers.map((h, i) => 
                        `<option value="${i}" ${i === idx ? 'selected' : ''}>${i + 1}: ${h || `Column ${i+1}`}</option>`
                    ).join('')}
                </select>
            `;
        });

        modal.innerHTML = `
            <h3>Import from CSV</h3>
            <p><strong>${parseResult.columnCount} columns detected. Select ${targetIds.length} column(s) to import:</strong></p>
            
            ${selectorsHTML}
            
            <div style="margin-top:20px; text-align:right;">
                <button id="btnCancel" style="padding:8px 16px; margin-right:8px;">Cancel</button>
                <button id="btnImport" style="padding:8px 20px; background:rgb(10,100,255); color:white; border:none; border-radius:6px;">Import</button>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("btnImport").onclick = () => {
            // Collect selected index from every dropdown generated
            const selectBoxes = modal.querySelectorAll(".dynamic-col-select");
            const selectedCols = Array.from(selectBoxes).map(box => parseInt(box.value));
            modal.remove();
            onSelect(selectedCols);
        };

        document.getElementById("btnCancel").onclick = () => modal.remove();
    }
};

window.UIC = UIC;

const StatsCalc = {
    parseCSV: function(csvText, options = {}) {
        const { cols = null, hasHeader = true } = options;
        
        const lines = csvText.trim().split(/\r?\n/);
        const columns = [];
        let headers = [];
        let columnCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#') || line.startsWith('//')) continue;

            const values = line.split(/[,;\t]+/).map(v => v.trim());
            
            if (i === 0 && hasHeader && isNaN(parseFloat(values[0]))) {
                headers = values;
                columnCount = values.length;
                continue;
            }

            if (columnCount === 0) columnCount = values.length;

            // Determine which column indices we need to extract
            const indicesToExtract = cols || Array.from({ length: columnCount }, (_, idx) => idx);

            indicesToExtract.forEach((colIdx, arrayIdx) => {
                if (!columns[arrayIdx]) columns[arrayIdx] = [];
                const val = parseFloat(values[colIdx]);
                if (!isNaN(val)) {
                    columns[arrayIdx].push(val);
                }
            });
        }

        // Fill default headers if file lacked them
        if (headers.length === 0) {
            headers = Array.from({ length: columnCount }, (_, idx) => `Column ${idx + 1}`);
        }

        const rowCount = columns[0] ? columns[0].length : 0;

        // Return dynamic columns array + backward-compatible xValues/yValues properties
        return { 
            columns, 
            xValues: columns[0] || [], 
            yValues: columns[1] || [], 
            headers, 
            columnCount, 
            rowCount 
        };
    },

    // ==================== Data Utils ====================
    normalize: function(data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        return data.map(x => (x - min) / (max - min));
    },

    formatArray: function(arr) {
        return arr.map(n => Number(n.toFixed(6))).join(", ");
    },

    // ==================== Common Validation ====================
    validateInputs: function(xStr, yStr) {
        if (!xStr || !yStr) throw "Please enter data for both X and Y.";
        
        const x = xStr.trim().split(/[\s,]+/).map(Number);
        const y = yStr.trim().split(/[\s,]+/).map(Number);

        if (x.some(isNaN) || y.some(isNaN)) throw "Only numeric values allowed.";
        if (x.length !== y.length) throw "X and Y must have the same number of values.";
        if (x.length < 2) throw "At least 2 data points are required.";

        return { x, y };
    },

    showToast: function(message, type = "success") {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 12px 24px; border-radius: 8px; color: white; font-family: monospace;
            z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            background: ${type === "success" ? "rgb(10,100,255)" : "#f44336"};
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

window.StatsCalc = StatsCalc;