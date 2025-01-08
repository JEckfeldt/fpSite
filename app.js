const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 80;

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use(bodyParser.json());

// Allow larger files to be sent 
app.use(bodyParser.json({ limit: '100mb', extended: true }));


// CORS options
const corsOptions = {
    origin: ['http://localhost'], // Specify the allowed origin
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable CORS using the options defined above
app.use(cors(corsOptions));


// Route to serve mobile.html on access to /m
app.get('/m', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mobile.html'));
});

// Ensure results file exists, initialize with an empty object if not
function ensureResultsFileExists() {
    if (!fs.existsSync(resultsFilePath)) {
        fs.writeFileSync(resultsFilePath, JSON.stringify({}), 'utf8');
        console.log('Results file created with initial empty object.');
    }
}

function getDateTimeStamp() {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');  // Replace colons and remove milliseconds
}

// Handle POST requests to /compare
app.post('/fps', cors(corsOptions), (req, res) => {
    const saveDir = 'json'
    console.log('Origin:', req.headers.origin); 
    const userAgent = req.headers['user-agent'];
    const safeFilename = sanitizeUserAgent(userAgent);
    const dataFilePath = path.join(__dirname, `${saveDir}/${safeFilename}_base.json`);
    const dateTimeStamp = getDateTimeStamp();
    const resultsFilePath = path.join(__dirname, `${saveDir}/${safeFilename}_${dateTimeStamp}_com.json`);

    const postData = req.body;
    // Check if data.json exists
    if (!fs.existsSync(dataFilePath)) {
        // Save the incoming POST data as initial data
        fs.writeFileSync(dataFilePath, JSON.stringify(postData, null, 2), 'utf8');
        console.log('Initial data saved from the first POST request.');
        res.json({ message: "Initial data saved successfully." });
    } else {
        // Load the existing data and compare
        const initialData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        const differences = compareObjects(initialData, postData);

        if (Object.keys(differences).length === 0) {
            fs.writeFileSync(resultsFilePath, JSON.stringify({ fp: "same" }, null, 2), 'utf8');
            res.json({ message: "Data is the same, saved {fp: 'same'} to fps.json." });
        } else {
            fs.writeFileSync(resultsFilePath, JSON.stringify(differences, null, 2), 'utf8');
            res.json({ message: "Data is different, saved differences to fps.json.", differences });
        }
    }
});

function sanitizeUserAgent(userAgent) {
    return userAgent.replace(/[^a-zA-Z0-9]/g, '_');
}

function compareObjects(obj1, obj2) {
    const result = {};
    for (const key in obj1) {
        if (key === "duration") continue;  // Skip comparing "duration"
        if (obj2.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
                const nestedDiff = compareObjects(obj1[key], obj2[key]);
                if (Object.keys(nestedDiff).length > 0) {
                    result[key] = nestedDiff;
                }
            } else if (obj1[key] !== obj2[key]) {
                result[key] = { original: obj1[key], new: obj2[key] };
            }
        } else {
            result[key] = { original: obj1[key], new: undefined };
        }
    }
    for (const key in obj2) {
        if (!obj1.hasOwnProperty(key)) {
            result[key] = { original: undefined, new: obj2[key] };
        }
    }
    return result;
}


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


