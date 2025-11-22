let map = L.map('map').setView([0,0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

document.getElementById('csvInput').addEventListener('change', function(e){
    Papa.parse(e.target.files[0], {
        header: true,
        dynamicTyping: true,
        complete: function(result){
            let coords = result.data
                .filter(r => r.lat && r.lng)
                .map(r => [r.lat, r.lng]);

            if(coords.length){
                let bounds = L.latLngBounds(coords);
                map.fitBounds(bounds);
                L.polyline(coords).addTo(map);
            } else {
                alert("No valid coordinates found.");
            }
        }
    });
});
