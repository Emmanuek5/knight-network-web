const axios = require("axios");

let baseURL = ""; // Initialize baseURL
let connected = false;

// Function to set the baseURL
function setBaseURL(url) {
  baseURL = url;
}

// Function to create a new table
async function createNewTable(tableName, schema) {
  try {
    if (connected) {
      const response = await axios.post(`${baseURL}/createTable`, {
        tableName: tableName,
        schema: schema,
      });
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
  
    return false
  }
}
async function listTables(){
    try {
    if (connected) {
      const response = await axios.get(`${baseURL}/listTables`);
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
  
    return false
  }
}
// Function to insert a row into a table
async function insertRow(tableName, row) {
  try {
    if (connected) {
      const response = await axios.post(
        `${baseURL}/table/${tableName}/insert`,
        {
          row: row,
        }
      );
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
    return false;
  }
}

// Function to select all rows from a table
async function selectAllRows(tableName) {
  try {
    if (connected) {
      const response = await axios.get(
        `${baseURL}/table/${tableName}/selectAll`
      );
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
    return false;
  }
}

// Function to find rows based on a query
async function findRows(tableName, query) {
  try {
    if (connected) {
      const response = await axios.post(`${baseURL}/table/${tableName}/find`, {
        query: query,
      });
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

// Function to update a row in a table
async function updateRow(tableName, query, update) {
  try {
    if (connected) {
      const response = await axios.put(`${baseURL}/table/${tableName}/update`, {
        query: query,
        update: update,
      });
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

// Function to delete a row from a table
async function deleteRow(tableName, query) {
  try {
    if (connected) {
      const response = await axios.delete(
        `${baseURL}/table/${tableName}/delete`,
        {
          data: {
            query: query,
          },
        }
      );
      return response.data; // Return the response data
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}
async function deleteAllRows(tableName) {
  try {
    if (connected) {
      const response = await axios.delete(
        `${baseURL}/table/${tableName}/deleteAll`
      );
      return response.data; // Return the response data
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
// Function to initialize and connect to the database server
async function init(url) {
  try {
    setBaseURL(url); // Set the baseURL to the provided URL
    // Test the connection with a listTables request
    const response = await axios.get(`${baseURL}/listTables`);
    if (response.status === 200) {
      connected = true;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false
  }
}

// Example usage

module.exports = {
  init,
  createNewTable,
  insertRow,
  selectAllRows,
  findRows,
  updateRow,
  deleteRow,
  listTables,
  deleteAllRows
};

 
