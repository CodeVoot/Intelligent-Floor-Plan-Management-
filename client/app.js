                           // Handling client request 

// Update the floor plan
// Cache for offline changes
let offlineChangesCache = JSON.parse(localStorage.getItem('offlineChanges')) || {};

// Update the floor plan
function updateFloorPlan() {
    const floorId = document.getElementById('floorId').value;
    const layout = document.getElementById('layout').value;

    if (navigator.onLine) {
        // Try to update server if online
        axios.post('http://localhost:3000/floor-plan/update', {
                floorId,
                layout,
                timestamp: Date.now(),
                role: 'Admin'
            })
            .then(response => {
                document.getElementById('responseMessage').innerHTML = response.data.message;
            })
            .catch(error => {
                console.log('Server not reachable or other error:', error.message);

                // Save locally if server isn't reachable
                saveChangesLocally(floorId, layout);
            });
    } else {
        // Save changes locally if offline
        saveChangesLocally(floorId, layout);
    }
}

// Save changes locally to localStorage
function saveChangesLocally(floorId, layout) {
    try {
        offlineChangesCache[floorId] = layout;
        localStorage.setItem('offlineChanges', JSON.stringify(offlineChangesCache));
        document.getElementById('responseMessage').innerHTML = "You are offline. Changes saved locally.";
    } catch (error) {
        document.getElementById('responseMessage').innerHTML = "Failed to save changes locally: " + error.message;
    }
}

// Automatically sync data when back online
window.addEventListener('online', () => {
    console.log("Back online! Syncing data...");
    syncOfflineChanges();
});

// Function to sync offline changes with the server when back online
function syncOfflineChanges() {
    if (Object.keys(offlineChangesCache).length > 0) {
        // Loop through the offline changes and send each to the server
        for (const floorId in offlineChangesCache) {
            const layout = offlineChangesCache[floorId];

            // Try sending each offline change to the server
            axios.post('http://localhost:3000/floor-plan/update', {
                    floorId,
                    layout,
                    timestamp: Date.now(),
                    role: 'Admin'
                })
                .then(response => {
                    console.log(`Successfully synced floor ${floorId}.`);
                    document.getElementById('responseMessage').innerHTML = `Successfully synced floor ${floorId}.`;
                    
                    // Remove the synced change from the cache
                    delete offlineChangesCache[floorId];
                    localStorage.setItem('offlineChanges', JSON.stringify(offlineChangesCache));
                })
                .catch(error => {
                    // server offline
                    console.log(`Failed to sync floor ${floorId}:`, error.message);
                });
        }
    } else {
        console.log("No offline changes to sync.");
    }
}

// Run syncOfflineChanges() on page load if online
if (navigator.onLine) {
    syncOfflineChanges();
}


// Suggest a meeting room (remains the same)
function suggestMeetingRoom() {
    const participants = document.getElementById('participants').value;

    axios.post('http://localhost:3000/meeting-room/suggest', {
        participants: parseInt(participants)
    })
    .then(response => {
        document.getElementById('responseMessage').innerHTML = "Suggested Room: " + JSON.stringify(response.data.room);
    })
    .catch(error => {
        document.getElementById('responseMessage').innerHTML = "Suggestion failed: " + error.message;
    });
}

