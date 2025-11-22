let map = L.map('map').setView([0,0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

document.getElementById('csvInput').addEventListener('change', function (e) {
    Papa.parse(e.target.files[0], {
        header: true,
        dynamicTyping: true,
        complete: function (results) {

            // Convert CSV rows into usable coordinate pairs
            const coords = results.data
                .filter(row => row.lat && row.lon)
                .map(row => [parseFloat(row.lat), parseFloat(row.lon)]);

            if (coords.length === 0) {
                alert("No valid lat/lon data found in the CSV.");
                return;
            }

            // Fit map to all points
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds);

            // Draw the polyline path
            L.polyline(coords, {
                weight: 4,
                opacity: 0.9
            }).addTo(map);
        }
    });
});
