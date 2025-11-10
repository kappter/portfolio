let map, journeyData = [], markers = [], animInterval = null;
const playBtn = document.getElementById('playBtn');
const slider = document.getElementById('yearSlider');
const yearDisplay = document.getElementById('yearDisplay');
const csvUpload = document.getElementById('csvUpload');
const destinationList = document.getElementById('destination-list');
const errorMsg = document.getElementById('errorMsg');
const helpBtn = document.getElementById('helpBtn');
const helpPopup = document.getElementById('csvHelp');

// Help popup logic
helpBtn.onclick = (e) => {
  e.stopPropagation();
  helpPopup.style.display = helpPopup.style.display === "block" ? "none" : "block";
};
document.body.addEventListener('click', e => {
  if (!helpBtn.contains(e.target) && !helpPopup.contains(e.target)) {
    helpPopup.style.display = "none";
  }
});

function validateHeaders(fields) {
  const req = ['year', 'age', 'location', 'lat', 'lon', 'livingWith'];
  let lower = fields.map(f => f.trim().toLowerCase());
  return req.every(h => lower.includes(h));
}

// On page load, use journey.csv as default demo
window.onload = function() {
  loadDemoCSV();
}

function trace(msg) {
  console.log(msg);
  errorMsg.style.display = "inline";
  errorMsg.textContent = msg;
}

// Load journey.csv as default
function loadDemoCSV() {
  trace('Attempting to load journey.csv as demo...');
  fetch('journey.csv')
    .then(response => {
      if (!response.ok) throw new Error("CSV not found or not served");
      return response.text();
    })
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          trace('PapaParse complete');
          console.log('Headers found:', results.meta.fields);
          if(!validateHeaders(results.meta.fields)) {
            trace("Demo file missing required headers: " + results.meta.fields);
            hideMapUI();
            return;
          }
          journeyData = results.data.filter(r =>
            r.lat && r.lon && r.year && r.location && r.lat !== "-1" && r.lon !== "-1"
          );
          trace(`Loaded records: ${journeyData.length}`);
          journeyData.forEach(d => {
            d.lat = parseFloat(d.lat);
            d.lon = parseFloat(d.lon);
            d.year = parseInt(d.year, 10);
            d.age = d.age || '';
            d.location = d.location || 'Unknown';
            d.livingWith = d.livingWith || '';
          });
          errorMsg.style.display = "none";
          showMapUI();
          if (map) { resetMap(); } else { initMap(); }
          buildDestinationList();
          setupSlider();
          updateMap(0);
          fitMapBounds();
        },
        error: function(err) {
          trace('PapaParse error:' + err.message);
          hideMapUI();
        }
      });
    })
    .catch(err => {
      trace(err.message);
      hideMapUI();
    });
}

// File upload replaces demo
csvUpload.addEventListener('change', function(evt) {
  trace('Upload event triggered');
  playBtn.disabled = true;
  slider.disabled = true;
  yearDisplay.textContent = "Loading...";
  errorMsg.style.display = "none";
  if (!csvUpload.files.length) return;
  const file = csvUpload.files[0];
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      trace('PapaParse complete (upload)');
      console.log('Upload headers found:', results.meta.fields);
      if(!validateHeaders(results.meta.fields)) {
        trace("Missing required headers: " + results.meta.fields);
        yearDisplay.textContent = "Upload CSV to start";
        hideMapUI();
        return;
      }
      journeyData = results.data.filter(r =>
        r.lat && r.lon && r.year && r.location && r.lat !== "-1" && r.lon !== "-1"
      );
      trace(`Loaded upload records: ${journeyData.length}`);
      journeyData.forEach(d => {
        d.lat = parseFloat(d.lat);
        d.lon = parseFloat(d.lon);
        d.year = parseInt(d.year, 10);
        d.age = d.age || '';
        d.location = d.location || 'Unknown';
        d.livingWith = d.livingWith || '';
      });
      showMapUI();
      if (map) { resetMap(); } else { initMap(); }
      buildDestinationList();
      setupSlider();
      updateMap(0);
      fitMapBounds();
    },
    error: function(err) {
      trace('PapaParse error:' + err.message);
      hideMapUI();
    }
  });
});

function showMapUI() {
  document.getElementById('map').style.display = "block";
  destinationList.style.display = "block";
  playBtn.disabled = false;
  slider.disabled = false;
}
function hideMapUI() {
  document.getElementById('map').style.display = "none";
  destinationList.style.display = "none";
  playBtn.disabled = true;
  slider.disabled = true;
}
function initMap() {
  map = L.map('map').setView([journeyData[0].lat, journeyData[0].lon], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}
function resetMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  map.eachLayer(function(layer) {
    if (!(layer instanceof L.TileLayer)) {
      map.removeLayer(layer);
    }
  });
}
function updateMap(idx) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  for (let i = 0; i <= idx; i++) {
    let d = journeyData[i];
    let marker = L.circleMarker([d.lat, d.lon], {
      radius: 7,
      color: '#0066cc',
      fillColor: '#a8e0ff',
      fillOpacity: 0.9
    })
    .bindPopup(`<strong>${d.location} (${d.year})</strong><br>With: ${d.livingWith}`)
    .addTo(map);
    markers.push(marker);
    if (i > 0) {
      let prev = journeyData[i - 1];
      L.polyline([[prev.lat, prev.lon], [d.lat, d.lon]], {color: '#888'}).addTo(map);
    }
  }
  yearDisplay.textContent = journeyData[idx].year + " (Age " + journeyData[idx].age + ")";
  highlightDestinations(idx);
}
function buildDestinationList() {
  const ul = document.getElementById('destinations');
  ul.innerHTML = '';
  journeyData.forEach((d, i) => {
    let li = document.createElement('li');
    li.textContent = `${d.year}: ${d.location}`;
    li.id = `dest-${i}`;
    li.onclick = () => {
      slider.value = i;
      updateMap(i);
      pauseAnimation();
    };
    ul.appendChild(li);
  });
}
function highlightDestinations(currentIdx) {
  journeyData.forEach((_d, i) => {
    const li = document.getElementById(`dest-${i}`);
    if (!li) return;
    if (i <= currentIdx) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
}
function setupSlider() {
  slider.max = journeyData.length - 1;
  slider.value = 0;
  slider.oninput = function() {
    updateMap(Number(this.value));
    pauseAnimation();
  };
  playBtn.onclick = togglePlay;
}
function togglePlay() {
  if (animInterval) {
    pauseAnimation();
  } else {
    playAnimation();
  }
}
function playAnimation() {
  playBtn.textContent = 'Pause';
  let idx = Number(slider.value);
  if (idx >= journeyData.length - 1) idx = 0;
  animInterval = setInterval(() => {
    if (idx >= journeyData.length - 1) {
      pauseAnimation();
      return;
    }
    idx++;
    slider.value = idx;
    updateMap(idx);
  }, 1500);
}
function pauseAnimation() {
  clearInterval(animInterval);
  animInterval = null;
  playBtn.textContent = 'Play';
}
function fitMapBounds() {
  let latlngs = journeyData.map(d => [d.lat, d.lon]);
  let bounds = L.latLngBounds(latlngs);
  map.fitBounds(bounds, {padding: [30, 30]});
}
