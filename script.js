document.addEventListener("DOMContentLoaded", function () {
  // ============================================================
  // Theme switching logic
  // ============================================================

  const themeSelector = document.getElementById("theme-selector");
  const themeStylesheet = document.getElementById("theme-stylesheet");
  const html = document.documentElement;

  const themeMap = {
    "natural-light": {
      mode: "light",
      stylesheet: "css/styles.css",
    },
    "natural-dark": {
      mode: "dark",
      stylesheet: "css/styles.css",
    },
    "architectural-light": {
      mode: "light",
      stylesheet: "css/architectural.css",
    },
    "architectural-dark": {
      mode: "dark",
      stylesheet: "css/architectural.css",
    },
    "space-light": {
      mode: "light",
      stylesheet: "css/space.css",
    },
    "space-dark": {
      mode: "dark",
      stylesheet: "css/space.css",
    },
    "medieval-light": {
      mode: "light",
      stylesheet: "css/medieval.css",
    },
    "medieval-dark": {
      mode: "dark",
      stylesheet: "css/medieval.css",
    },
    "pulsetap-light": {
  mode: "pulsetap-light",
  stylesheet: "css/styles.css",
},
"pulsetap-dark": {
  mode: "pulsetap-dark",
  stylesheet: "css/styles.css",
},
pulsetap: {
  mode: "pulsetap-dark",
  stylesheet: "css/styles.css",
},
  };

  function applyTheme(themeName) {
    if (!themeName || !themeMap[themeName]) {
      themeName = "natural-light";
    }

    const theme = themeMap[themeName];
    html.setAttribute("data-theme", theme.mode);
    html.setAttribute("data-theme-name", themeName);
    document.body.setAttribute("data-theme-name", themeName);

    if (themeStylesheet) {
      themeStylesheet.setAttribute("href", theme.stylesheet);
    }

    try {
      localStorage.setItem("portfolio-theme", themeName);
    } catch (error) {
      console.warn("Could not save theme preference:", error);
    }
  }

  function ensurePulseTapThemeOptions() {
    if (!themeSelector) return;

    const existingValues = Array.from(themeSelector.options).map(function (option) {
      return option.value;
    });

    if (!existingValues.includes("pulsetap-dark")) {
      const option = document.createElement("option");
      option.value = "pulsetap-dark";
      option.textContent = "PulseTap Dark";
      themeSelector.appendChild(option);
    }

    if (!existingValues.includes("pulsetap-light")) {
      const option = document.createElement("option");
      option.value = "pulsetap-light";
      option.textContent = "PulseTap Light";
      themeSelector.appendChild(option);
    }
  }

  if (themeSelector) {
    ensurePulseTapThemeOptions();

    let savedTheme = "natural-light";

    try {
      savedTheme = localStorage.getItem("portfolio-theme") || themeSelector.value || "natural-light";
    } catch (error) {
      savedTheme = themeSelector.value || "natural-light";
    }

    if (themeMap[savedTheme]) {
      themeSelector.value = savedTheme;
    }

    applyTheme(themeSelector.value);

    themeSelector.addEventListener("change", function () {
      applyTheme(themeSelector.value);
    });
  }

  // ============================================================
  // Mobile menu toggle
  // ============================================================

  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");

      const expanded = navMenu.classList.contains("active");
      navToggle.setAttribute("aria-expanded", String(expanded));
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ============================================================
  // Canvas animation for drawing a horizontal line that disappears
  // ============================================================

  const canvases = document.querySelectorAll(".line-animation");

canvases.forEach(function (canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const parent = canvas.parentElement;
  const height = 20;
 let width = parent ? parent.clientWidth - 48 : 960;

 canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let x = 0;
  let y = height / 2;

  function resizeCanvas() {
   width = parent ? parent.clientWidth - 48 : 960;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    x = 0;
  }

  window.addEventListener("resize", resizeCanvas);

  function getAccentColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-color")
      .trim() || "#6b7d4b";
  }

 let leftToRight = Math.random() > 0.5;
let speed = leftToRight ? 1.2 : -1.2;
let path = [];

function drawLine() {
  ctx.clearRect(0, 0, width, height);

  // slight vertical drift (human feel)
  y += (Math.random() - 0.5) * 0.4;

  // clamp so it doesn't wander off
  y = Math.max(height / 2 - 3, Math.min(height / 2 + 3, y));

  path.push({ x, y });

  ctx.beginPath();

  path.forEach((p, i) => {
    const age = path.length - i;
   const opacity = Math.max(0, 1 - age / 80); // fade tail

    ctx.strokeStyle = `rgba(${getRGBValues(getAccentColor())}, ${opacity})`;
    ctx.lineWidth = 2 * (1 - age / 200);
    ctx.lineCap = "round";

    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
  });

  x += speed;

  // remove old trail
  path = path.filter(p =>
    leftToRight ? p.x >= 0 : p.x <= width
  );

  // reset when reaching edge
  if ((leftToRight && x > width) || (!leftToRight && x < 0)) {
    leftToRight = Math.random() > 0.5;
    speed = leftToRight ? 1.2 : -1.2;

    x = leftToRight ? 0 : width;
    y = height / 2;
    path = [];
  }

  requestAnimationFrame(drawLine);
}

  drawLine();
});

 function getRGBValues(color) {
  if (!color) return "107,125,75";

  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  const match = color.match(/\d+/g);
  return match ? match.slice(0, 3).join(",") : "107,125,75";
}

  // ============================================================
  // Guitar pieces loader
  // ============================================================

  function loadGuitarPieces() {
    const guitarList = document.getElementById("guitar-pieces-list");
    if (!guitarList) return;

    guitarList.innerHTML = "";

    fetch("https://raw.githubusercontent.com/kappter/portfolio/main/guitar_pieces.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load guitar_pieces.json: " + response.status + " " + response.statusText);
        }
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error("guitar_pieces.json is not a valid array");
        }

        if (data.length === 0) {
          guitarList.innerHTML = "<li>No guitar pieces available.</li>";
          return;
        }

        data.forEach(function (piece) {
          if (!piece.title || !piece.file) {
            console.warn("Invalid guitar piece entry:", piece);
            return;
          }

          const li = document.createElement("li");
          li.className = "guitar-piece";

          const title = document.createElement("h4");
          title.textContent = piece.title;

          const audio = document.createElement("audio");
          audio.controls = true;
          audio.preload = "metadata";

          const source = document.createElement("source");
          source.src = "audio/guitar_pieces/" + piece.file;
          source.type = piece.file.toLowerCase().endsWith(".mp3") ? "audio/mpeg" : "audio/wav";

          audio.appendChild(source);
          audio.appendChild(document.createTextNode("Your browser does not support the audio element."));

          li.appendChild(title);
          li.appendChild(audio);
          guitarList.appendChild(li);
        });
      })
      .catch(function (error) {
        console.error("Error loading guitar pieces:", error.message);
        guitarList.innerHTML = "<li>Unable to load guitar pieces at this time. Please try again later.</li>";
      });
  }

  loadGuitarPieces();

  // ============================================================
  // Carousel helpers
  // ============================================================

  const AUTO_ADVANCE_INTERVAL = 5000;
let artIsTransitioning = false;
let photographyIsTransitioning = false;

  function formatCaption(filename) {
    const name = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    return name.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function startAutoAdvance(interval, changeFunction) {
    interval = stopAutoAdvance(interval);
    interval = setInterval(changeFunction, AUTO_ADVANCE_INTERVAL);
    return interval;
  }

  function stopAutoAdvance(interval) {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    return interval;
  }

 function changeImage(carouselImage, carouselCaption, images, currentIndex, setIndex, carouselType) {
  const isArt = carouselType === "art";

  if (isArt && artIsTransitioning) return;
  if (!isArt && photographyIsTransitioning) return;

  if (isArt) {
    artIsTransitioning = true;
  } else {
    photographyIsTransitioning = true;
  }

  if (!carouselImage || !images || images.length === 0) {
    if (isArt) artIsTransitioning = false;
    else photographyIsTransitioning = false;
    return;
  }

  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;

  setIndex(currentIndex);

  carouselImage.classList.add("fade-out");

  setTimeout(function () {
    carouselImage.src = images[currentIndex].url;
    carouselImage.alt = formatCaption(images[currentIndex].file);

    if (carouselCaption) {
      carouselCaption.textContent =
        images[currentIndex].caption || formatCaption(images[currentIndex].file);
    }

    carouselImage.classList.remove("fade-out");

    if (isArt) {
      artIsTransitioning = false;
    } else {
      photographyIsTransitioning = false;
    }
  }, 500);
}

// ============================================================
// Art Carousel Logic
// ============================================================

const artCarouselImage = document.getElementById("carousel-image");
const artCarouselCaption = document.getElementById("carousel-caption");
const artPrevButton = document.querySelector(".art-carousel .carousel-prev");
const artNextButton = document.querySelector(".art-carousel .carousel-next");
const artCarouselContainer = document.querySelector(".art-carousel");

let artImages = [];
let artCurrentIndex = 0;
let artAutoAdvanceInterval = null;

if (artCarouselImage && artCarouselContainer) {
  fetch("https://raw.githubusercontent.com/kappter/portfolio/main/art_images.json")
    .then(r => r.json())
    .then(data => {
      artImages = data.map(item => ({
        file: item.file,
        caption: item.caption || "",
        url: "https://raw.githubusercontent.com/kappter/portfolio/main/art/" + item.file,
      }));

      changeImage(
        artCarouselImage,
        artCarouselCaption,
        artImages,
        artCurrentIndex,
        i => artCurrentIndex = i,
        "art"
      );

      artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
        changeImage(
          artCarouselImage,
          artCarouselCaption,
          artImages,
          artCurrentIndex + 1,
          i => artCurrentIndex = i,
          "art"
        );
      });
    });

  artPrevButton?.addEventListener("click", () => {
    artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
    changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, i => artCurrentIndex = i, "art");
  });

  artNextButton?.addEventListener("click", () => {
    artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
    changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, i => artCurrentIndex = i, "art");
  });
}


// ============================================================
// Photography Carousel Logic
// ============================================================

const photographyCarouselImage = document.getElementById("photography-carousel-image");
const photographyCarouselCaption = document.getElementById("photography-carousel-caption");
const photographyPrevButton = document.querySelector(".photography-carousel .carousel-prev");
const photographyNextButton = document.querySelector(".photography-carousel .carousel-next");
const photographyCarouselContainer = document.querySelector(".photography-carousel");

let photographyImages = [];
let photographyCurrentIndex = 0;
let photographyAutoAdvanceInterval = null;

if (photographyCarouselImage && photographyCarouselContainer) {
  fetch("https://raw.githubusercontent.com/kappter/portfolio/main/photography_images.json")
    .then(r => r.json())
    .then(data => {
      photographyImages = data.map(item => ({
        file: item.file,
        caption: item.caption || "",
        url: "https://raw.githubusercontent.com/kappter/portfolio/main/photography/" + encodeURIComponent(item.file),
      }));

      changeImage(
        photographyCarouselImage,
        photographyCarouselCaption,
        photographyImages,
        photographyCurrentIndex,
        i => photographyCurrentIndex = i,
        "photography"
      );

      photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex + 1,
          i => photographyCurrentIndex = i,
          "photography"
        );
      });
    });

  photographyPrevButton?.addEventListener("click", () => {
    photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
    changeImage(
      photographyCarouselImage,
      photographyCarouselCaption,
      photographyImages,
      photographyCurrentIndex - 1,
      i => photographyCurrentIndex = i,
      "photography"
    );
  });

  photographyNextButton?.addEventListener("click", () => {
    photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
    changeImage(
      photographyCarouselImage,
      photographyCarouselCaption,
      photographyImages,
      photographyCurrentIndex + 1,
      i => photographyCurrentIndex = i,
      "photography"
    );
  });

  photographyCarouselImage.addEventListener("error", () => {
    console.warn("Skipping broken image");
    changeImage(
      photographyCarouselImage,
      photographyCarouselCaption,
      photographyImages,
      photographyCurrentIndex + 1,
      i => photographyCurrentIndex = i,
      "photography"
    );
  });
}
  });
