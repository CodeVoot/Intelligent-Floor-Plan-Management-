const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files
app.use(cors()); // Cross-Origin Resource Sharing) policy if your client and server are on different ports or domains

// Load data from data.json
const dataFilePath = path.join(__dirname, 'data.json');
let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

let floorPlans = data.floorPlans;
let meetingRooms = data.meetingRooms;
let offlineChanges = data.offlineChanges;

// Function to save data to data.json
function saveData() {
    const updatedData = { floorPlans, meetingRooms, offlineChanges };
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf-8');
}

// Routes

// Update Floor Plan
app.post('/floor-plan/update', (req, res) => {
    const { floorId, layout, timestamp, role } = req.body;

    if (!floorPlans[floorId] || (timestamp > floorPlans[floorId].timestamp && role === 'Admin')) {
        floorPlans[floorId] = { layout, timestamp };
        saveData();  // Save data after updating the floor plan
        res.json({ message: "Floor plan updated successfully." });
    } else {
        res.status(409).json({ message: "Conflict detected. Changes not applied." });
    }
});



// Suggest a meeting room
app.post('/meeting-room/suggest', (req, res) => {
    const { participants } = req.body;

    const suggestedRoom = meetingRooms
        .filter(room => room.capacity >= participants)
        .sort((a, b) => a.proximity - b.proximity)[0];

    if (suggestedRoom) {
        res.json({ room: suggestedRoom });
    } else {
        res.status(404).json({ message: "No suitable room available." });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

