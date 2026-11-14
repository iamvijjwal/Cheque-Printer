
"use strict";

// ==========================================
// BANK CONFIGURATION
// ==========================================

const BANKS = {

  idfc: {
    name: "IDFC FIRST Bank",

    positions: {
      date: [6,4.5],
      payee: [18,7],
      words: [25,9],
      amount: [36,5]
    }

  },

  iob: {
    name: "Indian Overseas Bank",

    positions: {
      date: [6,5],
      payee: [18,10],
      words: [26,16],
      amount: [36,5]
    }

  }

};


// ==========================================
// APPLICATION STATE
// ==========================================

let previewRecord = null;
let toastTimer = null;


// ==========================================
// ELEMENT REFERENCES
// ==========================================

const $ = id => document.getElementById(id);

const form = $("cheque-form");

const amountInput = $("amount");

const wordsInput = $("amount-words");

const bankInput = $("bank");

const printerSelect = $("printer-select");


// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message) {

  const toast = $("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2600);

}


// ==========================================
// NUMBER TO WORDS
// INDIAN NUMBERING SYSTEM
// ==========================================

function numberToWords(value) {

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
  ];


  function underThousand(n) {

    if (n < 20) {
      return ones[n];
    }

    if (n < 100) {

      return tens[Math.floor(n / 10)] +
        (n % 10 ? " " + ones[n % 10] : "");

    }

    return ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + underThousand(n % 100) : "");

  }


  function indian(n) {

    if (n === 0) {
      return "Zero";
    }

    const groups = [
      [10000000, "Crore"],
      [100000, "Lakh"],
      [1000, "Thousand"],
      [1, ""]
    ];

    let result = "";

    for (const [unit, label] of groups) {

      const part = Math.floor(n / unit);

      if (part) {

        result += underThousand(part) +
          (label ? " " + label : "") +
          " ";

        n %= unit;

      }

    }

    return result.trim();

  }


  const n = Number(value);

  if (
    !Number.isFinite(n) ||
    n < 0 ||
    n > 999999999999.99
  ) {

    return "";

  }


  const totalPaise = Math.round(n * 100);

  const rupees = Math.floor(totalPaise / 100);

  const paise = totalPaise % 100;


  return indian(rupees) +
    " Rupees" +
    (paise ? " and " + indian(paise) + " Paise" : "") +
    " Only";

}


// ==========================================
// AUTOMATIC AMOUNT CONVERSION
// ==========================================

amountInput.addEventListener("input", () => {

  const amount = Number(amountInput.value);

  wordsInput.value =
    amountInput.value && amount > 0
      ? numberToWords(amount)
      : "";

});


// ==========================================
// FORM RESET
// ==========================================

function resetFormState() {

  form.reset();

  $("date").value = new Date().toLocaleDateString("en-CA");

  wordsInput.value = "";

  previewRecord = null;

}


// ==========================================
// CLEAR FORM
// ==========================================

form.addEventListener("reset", () => {

  setTimeout(() => {

    wordsInput.value = "";

  }, 0);

});


// ==========================================
// CURRENT FORM RECORD
// ==========================================

function currentFormRecord() {

  const amount = Number(amountInput.value);

  return {

    payee: $("payee").value.trim(),

    date: $("date").value,

    amount,

    words: numberToWords(amount),

    bank: bankInput.value

  };

}


// ==========================================
// VALIDATION
// ==========================================

function validAmount(value) {

  return (

    Number.isFinite(value) &&
    value > 0 &&
    value <= 999999999999.99

  );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value) {

  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;

}


// ==========================================
// PREVIEW BUTTON
// ==========================================

$("preview-btn").addEventListener("click", () => {

  if (!form.reportValidity()) {
    return;
  }


  const record = currentFormRecord();


  if (!validAmount(record.amount)) {

    showToast("Enter a valid amount.");

    return;

  }


  previewRecord = record;


  renderChequePreview(record);


  $("new-cheque").classList.remove("active");

  $("preview").classList.add("active");

});


// ==========================================
// RENDER CHEQUE PREVIEW
// ==========================================

function renderChequePreview(record) {

  // Date

  $("print-date").textContent =
    formatDate(record.date).replaceAll("/", "");


  // Payee

  $("print-payee").textContent = record.payee;


  // Amount in words

  $("print-words").textContent = record.words;


  // Amount in figures

  $("print-amount").textContent =
    record.amount.toLocaleString("en-IN", {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2

    }) +
    "/-";


  // Selected bank layout

  const preset = BANKS[record.bank];

  if (!preset) {

    showToast("Invalid bank layout.");

    return;

  }


  const [dateTop, dateRight] = preset.positions.date;

  const [payeeTop, payeeLeft] = preset.positions.payee;

  const [wordsTop, wordsLeft] = preset.positions.words;

  const [amountTop, amountRight] = preset.positions.amount;


  // Date position

  $("print-date").style.top = `${dateTop}%`;

  $("print-date").style.right = `${dateRight}%`;


  // Payee position

  $("print-payee").style.top = `${payeeTop}%`;

  $("print-payee").style.left = `${payeeLeft}%`;


  // Words position

  $("print-words").style.top = `${wordsTop}%`;

  $("print-words").style.left = `${wordsLeft}%`;


  // Amount position

  $("print-amount").style.top = `${amountTop}%`;

  $("print-amount").style.right = `${amountRight}%`;

}


// ==========================================
// BACK TO CHEQUE FORM
// ==========================================

$("back-to-form").addEventListener("click", () => {

  $("preview").classList.remove("active");

  $("new-cheque").classList.add("active");

});


// ==========================================
// LOAD AVAILABLE PRINTERS
// ==========================================

async function loadPrinters() {

  printerSelect.replaceChildren();


  const loading = document.createElement("option");

  loading.value = "";

  loading.textContent = "Loading printers…";

  printerSelect.appendChild(loading);


  try {

    if (!window.chequePrinter?.getPrinters) {

      throw new Error("Printer access is unavailable.");

    }


    const printers = await window.chequePrinter.getPrinters();


    printerSelect.replaceChildren();


    if (!printers.length) {

      const option = document.createElement("option");

      option.value = "";

      option.textContent = "No printers found";

      printerSelect.appendChild(option);

      return;

    }


    printers.forEach(printer => {

      const option = document.createElement("option");

      option.value = printer.name;


      option.textContent =
        `${printer.displayName || printer.name}` +
        `${printer.isDefault ? " (Default)" : ""}`;


      if (printer.isDefault) {

        option.selected = true;

      }


      printerSelect.appendChild(option);

    });


  } catch (error) {

    printerSelect.replaceChildren();


    const option = document.createElement("option");

    option.value = "";

    option.textContent = "Unable to load printers";

    printerSelect.appendChild(option);


    console.error(error);


    showToast(
      error.message || "Unable to load printers."
    );

  }

}


// ==========================================
// REFRESH PRINTERS
// ==========================================

$("refresh-printers").addEventListener(
  "click",
  loadPrinters
);


// ==========================================
// PRINT CHEQUE
// ==========================================

$("print-cheque-btn").addEventListener(
  "click",
  async () => {

    // Check printer

    if (!printerSelect.value) {

      showToast("Select an available printer first.");

      return;

    }


    // Check preview

    if (!previewRecord) {

      showToast("Preview a cheque before printing.");

      return;

    }


    // Confirmation

    if (!confirm(
      "Print this cheque now? Check the paper alignment first."
    )) {

      return;

    }


    const button = $("print-cheque-btn");


    button.disabled = true;

    button.textContent = "Opening print dialog…";


    try {

      const result = await window.chequePrinter.printCheque(
        printerSelect.value
      );


      if (!result.success) {

        showToast(
          `Printing failed: ${result.reason || "Unknown error"}`
        );

      } else {

        showToast("Print job sent.");

      }


    } catch (error) {

      showToast(
        `Printing error: ${error.message}`
      );

    } finally {

      button.disabled = false;

      button.textContent = "Print cheque";

    }

  }
);


// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

// Open directly on New Cheque

$("new-cheque").classList.add("active");

$("preview").classList.remove("active");


// Set today's date

$("date").value = new Date().toLocaleDateString("en-CA");


// Load available printers

loadPrinters();
