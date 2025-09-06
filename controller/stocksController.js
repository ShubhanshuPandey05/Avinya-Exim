import { google } from "googleapis"
import dotenv from "dotenv";
import webPush from 'web-push';
import User from "../models/userModel.js";
import { sendNotification } from "./notificationController.js";
dotenv.config();


// Spreadsheet ID and range to update
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Main Stock!A1:M";
const RANGE2 = "Sales!A1:M";

// Authenticate with the Google API using Service Account
const serviceAccountCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


const client = await auth.getClient();
const sheets = google.sheets({ version: "v4", auth: client });






// ..........Get-Item-Name...............................................................................................................................





export const getStocksItems = async (req, res) => {

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Stocks Items",
    });

    const rows = result.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    // Get headers from the first row
    const headers = rows[0];

    // Convert rows to objects for better readability
    const orders = rows.slice(1).map((row) => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] || "";
        return acc;
      }, {});
    });

    res.json({ data: orders });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};





// ..........Get-Colors..................................................................................................................................





export const getStocksColors = async (req, res) => {

  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Stocks Colors",
    });

    const rows = result.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    // Get headers from the first row
    const headers = rows[0];

    // Convert rows to objects for better readability
    const orders = rows.slice(1).map((row) => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] || "";
        return acc;
      }, {});
    });

    res.json({ data: orders });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};





// ..........Add-Stocks..................................................................................................................................





export const addStocks = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { items } = req.body;


    const options = {
      timeZone: 'Asia/Kolkata', // IST time zone
      hour12: true, // Optional, for 12-hour format
    };

    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:A`, // Get the SR NO column
    });

    const existingRows = getResponse.data.values || [];
    let lastSRNo = 0;

    if (existingRows.length > 1) {
      // Get the last SR NO and timestamp from the last row
      const lastRow = existingRows[existingRows.length - 1];
      lastSRNo = parseInt(lastRow[0]) || 0; // SR NO is in the third column (index 2)
    }

    let srNo = lastSRNo;

    const rows = items.map((item) => {
      srNo++;
      return [
        srNo,
        new Date().toLocaleDateString('en-IN', options), // Date
        new Date().toLocaleTimeString('en-IN', options), // Time
        item.bellNo, // Item Bell no.
        item.itemName, // Item Name
        item.color, //Item Color
        item.pcs, //Item Pcs or Thans
        item.quantity, // Quantity
        item.rate || "", // Rate (optional)
        item.amount || "", // Amount (optional)
        "Surat",
        "",
        "",
        item.quantity,
        item.pcs,
        "",
        item.weight
      ]
    });

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid or missing 'values' array" });
    }

    // Update the spreadsheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE, // Where to append data
      valueInputOption: "RAW", // "RAW" or "USER_ENTERED"
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows, // Data to append
      },
    });

    // const notificationPayload = {
    //   title: 'New Order!!!',
    //   body: 'You got a new order',
    // };
    // let user = await User.findOne({ MobileNo: "9998464854" });

    // webPush
    //   .sendNotification(user.NotifySubscription, JSON.stringify(notificationPayload))
    //   .catch(error => console.error('Error sending notification:', error))

    res.status(200).json({
      message: "Spreadsheet updated successfully",
      response,
    });


  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};





// ..........Get-Stocks-By-City..........................................................................................................................





export const getStocksByCity = async (req, res) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  const { city } = req.params;

  // console.log(contact);


  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Main Stock",
    });


    const rows = result.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    const headers = rows[0];

    const cityIndex = headers.indexOf("Godown");
    const balancedQtyIndex = headers.indexOf("Balance Qty");

    if (cityIndex === -1) {
      return res.status(500).json({ message: `No Stocks in this ${city}` });
    }

    let filteredRows;

    if (city == "Surat") {
      // Surat users (super admin) see all stocks from all cities
      filteredRows = rows.slice(1).filter((row) => parseInt(row[balancedQtyIndex]) > 0);
    } else if (city == "Kolkata") {
      // Kolkata users see stocks that are in Kolkata (received from Surat)
      filteredRows = rows.slice(1).filter((row) => row[cityIndex] === "Kolkata" && parseInt(row[balancedQtyIndex]) > 0);
    } else if (city == "Bangladesh") {
      // Bangladesh users see stocks that are in Bangladesh (received from Kolkata)
      filteredRows = rows.slice(1).filter((row) => row[cityIndex] === "Bangladesh" && parseInt(row[balancedQtyIndex]) > 0);
    } else {
      filteredRows = rows.slice(1).filter((row) => row[cityIndex] === city && parseInt(row[balancedQtyIndex]) > 0);
    }

    if (filteredRows.length === 0) {
      return res.status(404).json({ message: `No Stock in this ${city}` });
    }
    // console.log(filteredRows)

    filteredRows = filteredRows.reverse()
    res.json({ data: filteredRows });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};





// ..........Get-Sales...................................................................................................................................





export const getSales = async (req, res) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  const { city } = req.params;

  if (city == 'Surat') {
    try {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sales",
      });


      const rows = result.data.values;

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "No data found." });
      }

      let filteredRows;

      filteredRows = rows.slice(1).reverse()


      if (filteredRows.length === 0) {
        return res.status(404).json({ message: `No Stock in this ${city}` });
      }

      res.json({ data: filteredRows });
    } catch (error) {
      console.error("Error reading Google Sheets:", error);
      res.status(500).json({ error: "Failed to read the Google Sheet." });
    }
  }
};





// ..........Stocks-Dispatched...........................................................................................................................





export const stockDispatched = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { stockId } = req.body;

    console.log("Stock ID:", stockId);

    const options = {
      timeZone: "Asia/Kolkata", // IST time zone
      hour12: true, // Optional, for 12-hour format
    };

    // Fetch the data from the sheet to locate the row index
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:O`, // Adjust the range as needed
    });

    const rows = getResponse.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet.");
      return res.status(404).json({ message: "No data found in the sheet." });
    }

    // Find the row to update
    const targetColumnIndex = 0; // Assuming stockId is in column A
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][targetColumnIndex] === stockId) {
        rowIndex = i + 1; // Add 1 to match Google Sheets' 1-based indexing
        break;
      }
    }

    if (rowIndex === -1) {
      console.log("Stock not found.");
      return res.status(404).json({ message: "Stock not found." });
    }

    // Update specific cells in the located row
    const updatedValues = [
      [
        "Transport", // Column K
        new Date().toLocaleDateString("en-IN", options), // Column L (Dispatch Date)
        null, // Column M (if you don’t want to change it)
        null, // Column N (if you don’t want to change it)
        null, // Column O (if you don’t want to change it)
        "yes", // Column P (Dispatched Status)
      ],
    ];

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!K${rowIndex}:P${rowIndex}`, // Specific row to update
      valueInputOption: "RAW", // Use "USER_ENTERED" if you want Google Sheets to format the input
      requestBody: {
        values: updatedValues,
      },
    });

    console.log("Update Response:", updateResponse);

    res.status(200).json({
      message: "Spreadsheet updated successfully",
      updateResponse,
    });
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};





// ..........Transfer-Stock-To-Kolkata...........................................................................................................................

export const transferStockToKolkata = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { stockId } = req.body;

    console.log("Stock ID for transfer:", stockId);

    const options = {
      timeZone: "Asia/Kolkata", // IST time zone
      hour12: true, // Optional, for 12-hour format
    };

    // Fetch the data from the sheet to locate the row index
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:O`, // Adjust the range as needed
    });

    const rows = getResponse.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet.");
      return res.status(404).json({ message: "No data found in the sheet." });
    }

    // Find the row to update
    const targetColumnIndex = 0; // Assuming stockId is in column A
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][targetColumnIndex] === stockId) {
        rowIndex = i + 1; // Add 1 to match Google Sheets' 1-based indexing
        break;
      }
    }

    if (rowIndex === -1) {
      console.log("Stock not found.");
      return res.status(404).json({ message: "Stock not found." });
    }

    // Update specific cells in the located row
    const updatedValues = [
      [
        "Transport", // Column K (Transport)
        new Date().toLocaleDateString("en-IN", options), // Column L (Dispatch Date)
        null, // Column M (if you don't want to change it)
        null, // Column N (if you don't want to change it)
        null, // Column O (if you don't want to change it)
        "in transit", // Column P (Status - in transit from Surat to Kolkata)
      ],
    ];

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!K${rowIndex}:P${rowIndex}`, // Specific row to update
      valueInputOption: "RAW", // Use "USER_ENTERED" if you want Google Sheets to format the input
      requestBody: {
        values: updatedValues,
      },
    });

    console.log("Transfer Response:", updateResponse);

    res.status(200).json({
      message: "Stock transferred to Kolkata successfully",
      updateResponse,
    });
  } catch (error) {
    console.error("Error transferring stock:", error);
    res.status(500).json({ error: error.message });
  }
};







// ..........Receive-Stock-From-Surat...........................................................................................................................

export const receiveStockFromSurat = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { stockId } = req.body;

    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
    };

    // Fetch the sheet data
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:O`, // Adjust range to include columns you want to modify
    });

    const rows = getResponse.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found in the sheet." });
    }

    // Find the row index for the stockId
    const targetColumnIndex = 0; // Assuming stockId is in column A
    const rowIndex = rows.findIndex(row => row[targetColumnIndex] === stockId);

    if (rowIndex === -1) {
      return res.status(404).json({ message: "Stock not found." });
    }

    // Update relevant cells
    rows[rowIndex][12] = new Date().toLocaleDateString("en-IN", options); // Update Date
    rows[rowIndex][10] = "Kolkata"; // Update City
    rows[rowIndex][15] = ""; // Clear Status field

    // Update the spreadsheet
    const updateRange = `Main Stock!A${rowIndex + 1}:P${rowIndex + 1}`; // Adjust range based on row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [rows[rowIndex]], // Send only the updated row
      },
    });

    res.status(200).json(rows[rowIndex]);
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};

// ..........Transfer-Stock-To-Bangladesh...........................................................................................................................

export const transferStockToBangladesh = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { stockId } = req.body;

    console.log("Stock ID for transfer to Bangladesh:", stockId);

    const options = {
      timeZone: "Asia/Kolkata", // IST time zone
      hour12: true, // Optional, for 12-hour format
    };

    // Fetch the data from the sheet to locate the row index
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:O`, // Adjust the range as needed
    });

    const rows = getResponse.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet.");
      return res.status(404).json({ message: "No data found in the sheet." });
    }

    // Find the row to update
    const targetColumnIndex = 0; // Assuming stockId is in column A
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][targetColumnIndex] === stockId) {
        rowIndex = i + 1; // Add 1 to match Google Sheets' 1-based indexing
        break;
      }
    }

    if (rowIndex === -1) {
      console.log("Stock not found.");
      return res.status(404).json({ message: "Stock not found." });
    }

    // Update specific cells in the located row
    const updatedValues = [
      [
        "Transport", // Column K (Transport)
        new Date().toLocaleDateString("en-IN", options), // Column L (Dispatch Date)
        null, // Column M (if you don't want to change it)
        null, // Column N (if you don't want to change it)
        null, // Column O (if you don't want to change it)
        "dispatched", // Column P (Status - dispatched from Kolkata to Bangladesh)
      ],
    ];

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!K${rowIndex}:P${rowIndex}`, // Specific row to update
      valueInputOption: "RAW", // Use "USER_ENTERED" if you want Google Sheets to format the input
      requestBody: {
        values: updatedValues,
      },
    });

    console.log("Transfer to Bangladesh Response:", updateResponse);

    res.status(200).json({
      message: "Stock transferred to Bangladesh successfully",
      updateResponse,
    });
  } catch (error) {
    console.error("Error transferring stock to Bangladesh:", error);
    res.status(500).json({ error: error.message });
  }
};

// ..........Stocks-Recieved-And-Update-Location.........................................................................................................





export const stockRecieved = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { stockId } = req.body;

    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
    };

    // Fetch the sheet data
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Main Stock!A:O`, // Adjust range to include columns you want to modify
    });

    const rows = getResponse.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found in the sheet." });
    }

    // Find the row index for the stockId
    const targetColumnIndex = 0; // Assuming stockId is in column A
    const rowIndex = rows.findIndex(row => row[targetColumnIndex] === stockId);

    if (rowIndex === -1) {
      return res.status(404).json({ message: "Stock not found." });
    }

    // Update relevant cells
    rows[rowIndex][12] = new Date().toLocaleDateString("en-IN", options); // Update Date
    rows[rowIndex][10] = "Bangladesh"; // Update City
    rows[rowIndex][15] = ""; // Clear status field (stock is now received in Bangladesh)

    // Update the spreadsheet
    const updateRange = `Main Stock!A${rowIndex + 1}:P${rowIndex + 1}`; // Adjust range based on row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [rows[rowIndex]], // Send only the updated row
      },
    });

    res.status(200).json(rows[rowIndex]);
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};





// ..........Get-Stocks-To-Be-Recevied...................................................................................................................





export const getStocksToBeRecieved = async (req, res) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  
  // Get the user's city from the request (we'll need to pass this from the frontend)
  const { city } = req.query;
  console.log("Getting stocks to be received for city:", city);
  
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Main Stock",
    });

    const rows = result.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    const headers = rows[0];
    const statusIndex = headers.indexOf("Dispatched"); // This column now contains the status
    console.log("Status column index:", statusIndex);
    console.log("Headers:", headers);

    if (statusIndex === -1) {
      return res.status(500).json({ message: `No Stocks to be recieved` });
    }

    let filteredRows;

    if (city === "Kolkata") {
      // Kolkata users see stocks that are "in transit" from Surat
      filteredRows = rows.slice(1).filter((row) => row[statusIndex] === "in transit");
      console.log("Kolkata - Found in transit stocks:", filteredRows.length);
      // Debug: show all status values
      const allStatuses = rows.slice(1).map(row => row[statusIndex]).filter(status => status);
      console.log("All status values in data:", [...new Set(allStatuses)]);
    } else if (city === "Bangladesh") {
      // Bangladesh users see stocks that are "dispatched" from Kolkata
      filteredRows = rows.slice(1).filter((row) => row[statusIndex] === "dispatched");
      console.log("Bangladesh - Found dispatched stocks:", filteredRows.length);
      // Debug: show all status values
      const allStatuses = rows.slice(1).map(row => row[statusIndex]).filter(status => status);
      console.log("All status values in data:", [...new Set(allStatuses)]);
    } else {
      // Default behavior for other cities
      filteredRows = rows.slice(1).filter((row) => row[statusIndex] === "yes");
      console.log("Other city - Found dispatched stocks:", filteredRows.length);
    }

    if (filteredRows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.json({ data: filteredRows });
  } catch (error) {
    console.error("Error reading Google Sheets:", error);
    res.status(500).json({ error: "Failed to read the Google Sheet." });
  }
};





// ..........Add-Sales...................................................................................................................................





export const addSales = async (req, res) => {
  try {
    // Authenticate and create a Sheets API client
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const { items, partyName, personName, contactNo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided for sale." });
    }

    let newSales = [];
    const options = {
      timeZone: "Asia/Kolkata",
      hour12: true,
    };

    // Fetch current sheet data
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Main Stock", // Sheet to read
    });

    const rows = getResponse.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No data found in the sheet." });
    }

    const targetColumnIndex = 0; // Assuming stockId is in the first column
    let bellNo = null;

    for (const item of items) {
      const rowIndex = rows.findIndex(row => row[targetColumnIndex] === item.stockId) + 1; // Adjust for 1-based indexing

      if (rowIndex === 0) {
        console.warn(`Stock ID ${item.stockId} not found.`);
        continue;
      }

      // Parse and update balance quantities
      const balanceQty = parseInt(rows[rowIndex - 1][13], 10) || 0;
      const updatedBalance = balanceQty - parseInt(item.quantity, 10);
      rows[rowIndex - 1][13] = updatedBalance.toString();

      const balancePcs = parseInt(rows[rowIndex - 1][14], 10) || 0;
      const updatedPcsBalance = balancePcs - parseInt(item.pcs, 10);
      rows[rowIndex - 1][15] = updatedPcsBalance.toString();

      // console.log(balancePcs, updatedPcsBalance);


      // Batch update for balance quantities
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          data: [
            {
              range: `Main Stock!N${rowIndex}`, // Column N for balanced quantity
              values: [[updatedBalance]],
            },
            {
              range: `Main Stock!O${rowIndex}`, // Column P for balanced pieces
              values: [[updatedPcsBalance]],
            },
          ],
          valueInputOption: "RAW",
        },
      });

      bellNo = rows[rowIndex - 1][3]; // Capture bell number

      // Create new sale record
      const newSale = [
        item.stockId, // Stock ID
        new Date().toLocaleDateString("en-IN", options), // Date
        new Date().toLocaleTimeString("en-IN", options), // Time
        partyName,
        personName,
        contactNo,
        rows[rowIndex - 1][3], // Existing details
        rows[rowIndex - 1][4],
        rows[rowIndex - 1][5],
        rows[rowIndex - 1][6],
        item.quantity,
        rows[rowIndex - 1][8],
        rows[rowIndex - 1][9],
      ];

      newSales.push(newSale);
    }

    // Append new sales to the sales sheet
    if (newSales.length > 0) {
      const response2 = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE2, // Sales sheet range
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: newSales,
        },
      });

      // Send notification
      if (bellNo) {
        sendNotification(bellNo);
      }

      res.status(200).json({
        message: "Spreadsheet updated successfully",
        response2,
      });
    } else {
      res.status(200).json({
        message: "No valid sales to update",
      });
    }
  } catch (error) {
    console.error("Error updating spreadsheet:", error);
    res.status(500).json({ error: error.message });
  }
};