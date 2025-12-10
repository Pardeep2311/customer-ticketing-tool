
# Deployment Troubleshooting Guide

This guide provides solutions to common issues that you may encounter when deploying the Customer Ticketing Tool.

## Backend Issues

### 1. "Cannot find module 'express'" or other missing module errors

- **Symptom:** The backend server fails to start with an error message indicating that a module is missing.
- **Cause:** The node modules are not installed.
- **Solution:**
  - Navigate to the `backend` directory.
  - Run `npm install` to install the required dependencies.

### 2. "Error: connect ECONNREFUSED" when connecting to the database

- **Symptom:** The backend server fails to start with an error message indicating a connection refusal from the database.
- **Cause:**
  - The database server is not running.
  - The database connection details in the `.env` file are incorrect.
- **Solution:**
  - Ensure that your MySQL server is running.
  - Double-check the database connection details in the `.env` file, including the host, port, username, password, and database name.

### 3. "Authentication plugin 'caching_sha2_password' is not supported"

- **Symptom:** The backend server fails to connect to the MySQL database with this error.
- **Cause:** The version of the `mysql2` library used in the backend is not compatible with the default authentication plugin of the MySQL server.
- **Solution:**
  - Connect to your MySQL server and run the following command to change the authentication plugin for the user:
    ```sql
    ALTER USER 'your-user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your-password';
    FLUSH PRIVILEGES;
    ```
  - Replace `'your-user'`, `'localhost'`, and `'your-password'` with your actual database username, host, and password.

## Frontend Issues

### 1. "Proxy error: Could not proxy request"

- **Symptom:** The frontend application is unable to connect to the backend API, and you see a proxy error in the browser console.
- **Cause:** The backend server is not running or is not accessible from the frontend.
- **Solution:**
  - Ensure that the backend server is running on the correct port (usually `5000`).
  - Check the `proxy` setting in the `frontend/package.json` file and make sure that it points to the correct backend server address.

### 2. "craco: not found" or "react-scripts: not found"

- **Symptom:** The frontend development server fails to start with an error message indicating that `craco` or `react-scripts` is not found.
- **Cause:** The node modules are not installed.
- **Solution:**
  - Navigate to the `frontend` directory.
  - Run `npm install` to install the required dependencies.

### 3. Blank page or "Cannot GET /"

- **Symptom:** The application loads a blank page or shows a "Cannot GET /" error.
- **Cause:**
  - There is a problem with the React application, such as a JavaScript error.
  - The frontend routing is not configured correctly.
- **Solution:**
  - Open the browser's developer console and check for any error messages.
  - Ensure that the `react-router-dom` library is installed and that the routes are configured correctly in the `App.js` file.

## General Issues

### 1. "Something went wrong" or other generic error messages

- **Symptom:** The application displays a generic error message without providing any specific details.
- **Cause:** There is an unhandled error in the frontend or backend code.
- **Solution:**
  - Check the browser's developer console for any error messages.
  - Check the backend server logs for any error messages.
  - Use a debugger to step through the code and identify the source of the error.
