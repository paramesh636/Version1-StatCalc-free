const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1100,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') 
        }
    });

    Menu.setApplicationMenu(null);

    win.loadFile('main.html');
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.handle('export-to-pdf', async (event, defaultFilename) => {
    try {
        // 1. Open native OS "Save As" dialog
        const { filePath } = await dialog.showSaveDialog(win, {
            title: 'Save Statix Report',
            defaultPath: defaultFilename || 'statix_report.pdf',
            filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });

        if (!filePath) return { success: false, message: 'Cancelled by user' };

        // 2. Trigger Chromium's native C++ PDF generator
        const pdfBuffer = await win.webContents.printToPDF({
            pageSize: 'A4',
            printBackground: true,      // Prints CSS background colors/boxes
            printSelectionOnly: false,
            landscape: false,
            margins: {
                top: 0.8,               // Margins in inches
                bottom: 0.8,
                left: 0.8,
                right: 0.8
            },
            displayHeaderFooter: true,  // Enable native headers and footers
            headerTemplate: `
                <div style="font-size: 9px; color: #888; width: 100%; display: flex; justify-content: space-between; padding: 0 40px;">
                    <span>Statix Report</span>
                    <span class="date"></span>
                </div>`,
            footerTemplate: `
                <div style="font-size: 9px; color: #888; width: 100%; display: flex; justify-content: space-between; padding: 0 40px;">
                    <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
                </div>`
        });

        // 3. Save the Buffer directly to the file system
        fs.writeFileSync(filePath, pdfBuffer);
        return { success: true, filePath };

    } catch (error) {
        console.error('Failed to generate PDF:', error);
        return { success: false, message: error.message };
    }
});
