const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 850,
    minWidth: 820,
    minHeight: 620,
    title: "ChequePrint",
    backgroundColor: "#f5f7fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("get-printers", async event => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return [];
  try {
    const printers = await win.webContents.getPrintersAsync();
    return printers.map(printer => ({
      name: printer.name,
      displayName: printer.displayName,
      isDefault: printer.isDefault,
      status: printer.status
    }));
  } catch (error) {
    console.error("Printer discovery failed:", error);
    return [];
  }
});

ipcMain.handle("print-cheque", async (event, printerName) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false, reason: "Application window not found." };

  try {
    const printers = await win.webContents.getPrintersAsync();
    if (printerName && !printers.some(printer => printer.name === printerName)) {
      return { success: false, reason: "Selected printer is not available." };
    }

    return await new Promise(resolve => {
      win.webContents.print({
        silent: false,
        printBackground: false,
        deviceName: printerName || "",
        pageSize: { width: 203200, height: 91440 },
        margins: { marginType: "none" },
        landscape: true,
        scaleFactor: 100
      }, (success, failureReason) => {
        resolve({ success, reason: failureReason || "" });
      });
    });
  } catch (error) {
    return { success: false, reason: error.message || "Unable to start printing." };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
