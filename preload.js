const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("chequePrinter", {
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printCheque: printerName => ipcRenderer.invoke("print-cheque", printerName)
});
