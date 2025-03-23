# Setting Up the Shift-203 Viewer

Follow these steps to get the Shift-203 viewer working properly:

## 1. Install Backend Dependencies

First, we need to install the Express server dependencies:

```bash
cd backend
npm install
```

## 2. Start the Express Server

Start the server which will provide the shift data:

```bash
cd backend
npm start
```

The server will run on port 5189. You should see a message: `Server running on http://localhost:5189`

## 3. Open the Shift Viewer HTML

You can now open the test-shift-viewer.html file in your browser:

- Double-click the file in your file explorer, or
- Open it using File > Open in your browser, or
- Serve it using a simple HTTP server

## Troubleshooting

If you encounter any issues:

### Server Won't Start

- Make sure you have Node.js installed (v14 or later recommended)
- Check for any errors in the console when starting the server
- Make sure port 5189 is not already in use by another application

### Viewer Shows Fallback Data

If the viewer is showing the fallback data instead of fetching from the server:

- Ensure the server is running on port 5189
- Check the browser console for any network errors
- Try accessing http://localhost:5189/shifts/shift-203 directly in your browser to see if the API responds

### CORS Issues

If you see CORS errors in the browser console:

- Make sure the Express server is running with the CORS middleware enabled (already included in the code)
- Try using a browser extension to disable CORS for testing purposes

## Tech Stack

- **Backend**: Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript
