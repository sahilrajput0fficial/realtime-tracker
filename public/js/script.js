const socket = io();
socket.on("connect", () => {
  console.log("Connected to server");
});
if (navigator.geolocation) {
  (navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);

      //console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

      socket.emit("send-location", { latitude, longitude });

    },
    (error) => {
      console.error("Error getting location:", error);
    },
  ),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });
}

//map bnana
const currentLatitude = localStorage.getItem("latitude") || 20.5937;
const currentLongitude = localStorage.getItem("longitude") || 78.9629;
const map = L.map("map").setView([currentLatitude, currentLongitude], 10);


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);



const markers = {};
socket.on("recieved-loc", (data) => {
    console.log("Received location data:", data);
  const { id, latitude, longitude ,email , username} = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);

    }
    else{
        
        markers[id] = L.marker([latitude, longitude],).addTo(map).bindPopup(`<b>Username</b>: ${username} <br><b>Email:${email}`).openPopup();

    }
    L.Routing.control({
      waypoints: [
        L.latLng(currentLatitude,currentLongitude), 
        L.latLng(28.65, 77.27),
      ],
      
      routeWhileDragging: true,
    }).addTo(map);
  
  console.log(`Received location from ${id}: Latitude: ${latitude}, Longitude: ${longitude}`);

});


socket.on("disconnect", (data) => {
    const { id } = data;
    if (markers[id]) {
      map.removeLayer(markers[id]);
      delete markers[id];
      console.log(`User with id ${id} disconnected and marker removed.`);
    }
});



