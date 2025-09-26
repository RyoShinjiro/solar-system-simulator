// Data planets (distance in AU, period in years, diameter in km, color)
const PLANETS = [
    {
        name: "Mercury",
        color: "#cfcfcf",
        orbit: 0.39, period: 0.241, diameter: 4879,
        info: "Planet terkecil & terdekat Matahari. Tidak punya atmosfer tebal."
    },
    {
        name: "Venus",
        color: "#e7d59d",
        orbit: 0.72, period: 0.615, diameter: 12104,
        info: "Suhu terpanas, atmosfer CO₂ tebal, kadang disebut 'kembaran Bumi'."
    },
    {
        name: "Earth",
        color: "#62b2f6",
        orbit: 1, period: 1, diameter: 12756,
        info: "Rumah kita! Hanya planet yang diketahui memiliki kehidupan."
    },
    {
        name: "Mars",
        color: "#e16a44",
        orbit: 1.52, period: 1.88, diameter: 6792,
        info: "Planet merah, punya gunung tertinggi & lembah terluas di tata surya."
    },
    {
        name: "Jupiter",
        color: "#f3c176",
        orbit: 5.20, period: 11.86, diameter: 142984,
        info: "Planet terbesar. Memiliki 'Bintik Merah Besar' dan banyak bulan."
    },
    {
        name: "Saturn",
        color: "#ebdb8c",
        orbit: 9.58, period: 29.46, diameter: 120536,
        info: "Dikenal dengan cincin spektakuler yang indah."
    },
    {
        name: "Uranus",
        color: "#8de0ec",
        orbit: 19.18, period: 84.01, diameter: 51118,
        info: "Planet gas es, rotasi hampir horizontal."
    },
    {
        name: "Neptune",
        color: "#497bfa",
        orbit: 30.07, period: 164.8, diameter: 49528,
        info: "Planet terjauh, warna biru pekat, angin tercepat di tata surya."
    },
];

// Matahari
const SUN = { name: "Sun", color: "#ffe066", diameter: 1391000 };

// Konstanta visual
const AU = 100; // 1 AU = 100px
const SUN_RADIUS = 32;
const SCALE_PLANET = 0.012; // diameter planet agar proporsional visual

// Canvas setup
const canvas = document.getElementById('solarCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;
let centerX = width/2, centerY = height/2;

let zoom = 1;
let offsetX = 0, offsetY = 0;
let dragging = false, dragStart = {x:0, y:0}, dragOffsetStart={x:0, y:0};

// Animasi waktu
let startTime = Date.now();

// Resize handler
function resizeCanvas() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    centerX = width/2 + offsetX;
    centerY = height/2 + offsetY;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Night mode
document.getElementById('nightMode').onclick = () => {
    document.body.classList.toggle('nightmode');
};

// Zoom controls
document.getElementById('zoomIn').onclick = () => {
    zoom = Math.min(3, zoom * 1.2);
};
document.getElementById('zoomOut').onclick = () => {
    zoom = Math.max(0.15, zoom / 1.2);
};
canvas.addEventListener('wheel', (e) => {
    if (e.deltaY < 0) zoom = Math.min(3, zoom * 1.09);
    else zoom = Math.max(0.12, zoom / 1.09);
    e.preventDefault();
}, {passive:false});

// Drag to pan
canvas.addEventListener('mousedown', e => {
    dragging = true;
    dragStart = {x: e.clientX, y: e.clientY};
    dragOffsetStart = {x: offsetX, y: offsetY};
});
canvas.addEventListener('mousemove', e => {
    if (dragging) {
        offsetX = dragOffsetStart.x + (e.clientX - dragStart.x);
        offsetY = dragOffsetStart.y + (e.clientY - dragStart.y);
        centerX = width/2 + offsetX;
        centerY = height/2 + offsetY;
    }
});
window.addEventListener('mouseup', () => dragging = false);

// Touch (mobile drag)
canvas.addEventListener('touchstart', e => {
    if(e.touches.length === 1) {
        dragging = true;
        dragStart = {x: e.touches[0].clientX, y: e.touches[0].clientY};
        dragOffsetStart = {x: offsetX, y: offsetY};
    }
}, {passive:false});
canvas.addEventListener('touchmove', e => {
    if (dragging && e.touches.length === 1) {
        offsetX = dragOffsetStart.x + (e.touches[0].clientX - dragStart.x);
        offsetY = dragOffsetStart.y + (e.touches[0].clientY - dragStart.y);
        centerX = width/2 + offsetX;
        centerY = height/2 + offsetY;
    }
}, {passive:false});
window.addEventListener('touchend', () => dragging = false);

// Planet info pop-up
const planetInfo = document.getElementById('planetInfo');
const planetName = document.getElementById('planetName');
const planetDetails = document.getElementById('planetDetails');
document.getElementById('closeInfo').onclick = () => planetInfo.style.display = "none";

// Handle click planet
canvas.addEventListener('click', e => {
    // Convert mouse to solar coords
    const rect = canvas.getBoundingClientRect();
    let mx = (e.clientX - rect.left - centerX) / zoom;
    let my = (e.clientY - rect.top - centerY) / zoom;
    // Cek collision dengan planet
    let found = null;
    PLANETS.forEach(planet => {
        let t = ((Date.now()-startTime)/1000)/planet.period/3*2; // Perputaran lambat
        let angle = t % (2*Math.PI);
        let r = planet.orbit * AU;
        let x = Math.cos(angle) * r;
        let y = Math.sin(angle) * r;
        let px = x, py = y;
        let pr = Math.max(planet.diameter*SCALE_PLANET, 9);
        if (
            (mx - px)*(mx - px) + (my - py)*(my - py) < pr*pr*1.2
        ) found = planet;
    });
    if (found) {
        showPlanetInfo(found);
    }
});

// Show planet info
function showPlanetInfo(planet) {
    planetInfo.style.display = "block";
    planetName.textContent = planet.name;
    planetDetails.innerHTML = `
        <b>Diameter:</b> ${planet.diameter.toLocaleString()} km<br>
        <b>Jarak ke Matahari:</b> ${planet.orbit} AU<br>
        <b>Periode Orbit:</b> ${planet.period} tahun<br>
        <b>Info:</b> ${planet.info}
    `;
}

// Main drawing
function draw() {
    ctx.clearRect(0,0,width,height);
    // Draw Sun
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.beginPath();
    ctx.arc(0,0, SUN_RADIUS*zoom, 0, 2*Math.PI);
    ctx.fillStyle = SUN.color;
    ctx.shadowColor = "#ff8";
    ctx.shadowBlur = 35*zoom;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Draw orbits
    PLANETS.forEach(planet => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = "#fff2";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0,0, planet.orbit*AU*zoom, 0, 2*Math.PI);
        ctx.stroke();
        ctx.restore();
    });

    // Draw Planets
    PLANETS.forEach(planet => {
        let t = ((Date.now()-startTime)/1000)/planet.period/3*2;
        let angle = t % (2*Math.PI);
        let r = planet.orbit * AU * zoom;
        let x = centerX + Math.cos(angle) * r;
        let y = centerY + Math.sin(angle) * r;
        let radius = Math.max(planet.diameter * SCALE_PLANET * zoom, 9*zoom);

        // Planet body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        ctx.fillStyle = planet.color;
        ctx.shadowColor = planet.color+"b0";
        ctx.shadowBlur = 12*zoom;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Name
        ctx.font = `${11*zoom+7}px Arial`;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(planet.name, x, y + radius + 18*zoom);
    });

    requestAnimationFrame(draw);
}
draw();