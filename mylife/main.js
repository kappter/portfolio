let map, journeyData = [], markers = [], animInterval = null;
const playBtn = document.getElementById('playBtn');
const slider = document.getElementById('yearSlider');
const yearDisplay = document.getElementById('yearDisplay');
const csvUpload = document.getElementById('csvUpload');
const destinationList = document.getElementById('destination-list');
const errorMsg = document.getElementById('errorMsg');
const helpBtn = document.getElementById('helpBtn');
const helpPopup = document.getElementById('csvHelp');

helpBtn.onclick = (e) => { e.stopPropagation(); helpPopup.style.display = helpPopup.style.display==='block'?'none':'block'; };
document.body.addEventListener('click', e => { if(!helpBtn.contains(e.target)&&!helpPopup.contains(e.target)){ helpPopup.style.display='none'; } });

function trace(msg){console.log(msg);errorMsg.style.display="inline";errorMsg.textContent=msg;}

window.onload=function(){loadDemoCSV();}

function loadDemoCSV(){
    fetch('journeys.csv')
    .then(r=>{if(!r.ok)throw new Error('CSV not found');return r.text();})
    .then(t=>{Papa.parse(t,{header:true,skipEmptyLines:true,complete:results=>{setupJourney(results.data)}})})
    .catch(err=>{trace(err.message);});
}

csvUpload.addEventListener('change',function(evt){
    if(!csvUpload.files.length)return;
    const file=csvUpload.files[0];
    Papa.parse(file,{header:true,skipEmptyLines:true,complete:results=>{setupJourney(results.data)}});
});

function setupJourney(data){
    journeyData = data.filter(r=>r.lat&&r.lon&&r.year);
    journeyData.forEach(d=>{d.lat=parseFloat(d.lat);d.lon=parseFloat(d.lon);d.year=parseInt(d.year,10);d.age=d.age||'';d.location=d.location||'Unknown';d.livingWith=d.livingWith||'';});
    showMapUI();if(map){resetMap();}else{initMap();}buildDestinationList();setupSlider();updateMap(0);fitMapBounds();playAnimation();
}

function showMapUI(){document.getElementById('map').style.display="block";destinationList.style.display="block";playBtn.disabled=false;slider.disabled=false;}
function hideMapUI(){document.getElementById('map').style.display="none";destinationList.style.display="none";playBtn.disabled=true;slider.disabled=true;}
function initMap(){map=L.map('map').setView([journeyData[0].lat,journeyData[0].lon],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors'}).addTo(map);}
function resetMap(){markers.forEach(m=>map.removeLayer(m));markers=[];map.eachLayer(l=>{if(!(l instanceof L.TileLayer))map.removeLayer(l);});}
function updateMap(idx){markers.forEach(m=>map.removeLayer(m));markers=[];for(let i=0;i<=idx;i++){let d=journeyData[i];let marker=L.circleMarker([d.lat,d.lon],{radius:7,color:'#0066cc',fillColor:'#a8e0ff',fillOpacity:0.9}).bindPopup(`<strong>${d.location} (${d.year})</strong><br>With: ${d.livingWith}`).addTo(map);markers.push(marker);if(i>0){let prev=journeyData[i-1];L.polyline([[prev.lat,prev.lon],[d.lat,d.lon]],{color:'#888'}).addTo(map);}}yearDisplay.textContent=journeyData[idx].year+" (Age "+journeyData[idx].age+")";highlightDestinations(idx);}
function buildDestinationList(){const ul=document.getElementById('destinations');ul.innerHTML='';journeyData.forEach((d,i)=>{let li=document.createElement('li');li.textContent=`${d.year}: ${d.location}`;li.id=`dest-${i}`;li.onclick=()=>{slider.value=i;updateMap(i);pauseAnimation();};ul.appendChild(li);});}
function highlightDestinations(c){journeyData.forEach((_d,i)=>{const li=document.getElementById(`dest-${i}`);if(!li)return;i<=c?li.classList.add('active'):li.classList.remove('active');});}
function setupSlider(){slider.max=journeyData.length-1;slider.value=0;slider.oninput=function(){updateMap(Number(this.value));pauseAnimation();};playBtn.onclick=togglePlay;}
function togglePlay(){animInterval?pauseAnimation():playAnimation();}
function playAnimation(){playBtn.textContent='Pause';let idx=Number(slider.value);animInterval=setInterval(()=>{if(idx>=journeyData.length-1){pauseAnimation();return;}idx++;slider.value=idx;updateMap(idx);},1500);}
function pauseAnimation(){clearInterval(animInterval);animInterval=null;playBtn.textContent='Play';}
function fitMapBounds(){let latlngs=journeyData.map(d=>[d.lat,d.lon]);let bounds=L.latLngBounds(latlngs);map.fitBounds(bounds,{padding:[30,30]});}