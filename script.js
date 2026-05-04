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
    const container = canvas.closest(".container");
let width = container ? container.clientWidth : Math.min(window.innerWidth, 960);
    const height = 20;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const leftToRight = Math.random() > 0.5;
    let x = leftToRight ? 0 : width;
    const speed = leftToRight ? 0.5 + Math.random() : -(0.5 + Math.random());
    const baseY = height / 2;
    let targetY = baseY;
    let currentY = baseY;
    let pathPoints = [];
    let fadeDistance = width * 0.6;

    function resizeCanvas() {
      width = container ? container.clientWidth : Math.min(window.innerWidth, 960);
      fadeDistance = width * 0.6;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      x = leftToRight ? 0 : width;
      pathPoints = [];
      currentY = baseY;
      targetY = baseY;
      ctx.clearRect(0, 0, width, height);
    }

    window.addEventListener("resize", resizeCanvas);

    function getRGBValues(color) {
      if (!color) return "107, 125, 75";

      color = color.trim();

      if (color.startsWith("#") && color.length >= 7) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return r + ", " + g + ", " + b;
      }

      if (color.startsWith("rgb")) {
        const values = color.match(/\d+/g);
        if (values && values.length >= 3) {
          return values.slice(0, 3).join(", ");
        }
      }

      return "107, 125, 75";
    }

    function getAccentColor() {
      return getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim() || "#6b7d4b";
    }

    function drawLine() {
      ctx.clearRect(0, 0, width, height);

      if (Math.random() < 0.1) {
        targetY = baseY + (Math.random() - 0.5);
      }

      currentY += (targetY - currentY) * 0.2;
      currentY = Math.round(currentY * 2) / 2;
      x = Math.round(x * 2) / 2;

      pathPoints.push({ x: x, y: currentY });
      ctx.beginPath();

      pathPoints.forEach(function (point, index) {
        const distance = leftToRight ? x - point.x : point.x - x;
        let opacity = 1;

        if (distance > 0 && distance <= fadeDistance) {
          opacity = 1 - distance / fadeDistance;
        } else if (distance > fadeDistance) {
          opacity = 0;
        }

        ctx.strokeStyle = "rgba(" + getRGBValues(getAccentColor()) + ", " + opacity + ")";
        ctx.lineWidth = 2 * (1 + (Math.random() - 0.5) * 0.1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
        }
      });

      x += speed;
      const reachedEnd = leftToRight ? x >= width : x <= 0;

      ctx.lineTo(x, currentY);
      ctx.strokeStyle = getAccentColor();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      pathPoints = pathPoints.filter(function (point) {
        const distance = leftToRight ? x - point.x : point.x - x;
        return distance <= fadeDistance;
      });

      if (reachedEnd) {
        ctx.clearRect(0, 0, width, height);
        x = leftToRight ? 0 : width;
        pathPoints = [];
        currentY = baseY;
        targetY = baseY;
      }

      requestAnimationFrame(drawLine);
    }

    drawLine();
  });

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
  let isTransitioning = false;

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

  function changeImage(carouselImage, carouselCaption, images, currentIndex, setIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    if (!carouselImage) {
      isTransitioning = false;
      return;
    }

    if (!images || images.length === 0) {
      isTransitioning = false;
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
        carouselCaption.textContent = images[currentIndex].caption || formatCaption(images[currentIndex].file);
      }

      carouselImage.classList.remove("fade-out");
      isTransitioning = false;
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
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load art_images.json: " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("art_images.json is not a valid array");

        artImages = data
          .filter(function (item) {
            return item.file && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.file);
          })
          .map(function (item) {
            return {
              file: item.file,
              caption: item.caption || "",
              url: "https://raw.githubusercontent.com/kappter/portfolio/main/art/" + item.file,
            };
          });

        if (artImages.length === 0) return;

        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex, function (index) {
          artCurrentIndex = index;
        });

        artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, function () {
          changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
            artCurrentIndex = index;
          });
        });
      })
      .catch(function (error) {
        console.error("Error loading art images:", error.message);
      });

    if (artPrevButton) {
      artPrevButton.addEventListener("click", function () {
        artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, function (index) {
          artCurrentIndex = index;
        });
        artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, function () {
          changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
            artCurrentIndex = index;
          });
        });
      });
    }

    if (artNextButton) {
      artNextButton.addEventListener("click", function () {
        artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
          artCurrentIndex = index;
        });
        artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, function () {
          changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
            artCurrentIndex = index;
          });
        });
      });
    }

    artCarouselContainer.addEventListener("mouseenter", function () {
      artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
    });

    artCarouselContainer.addEventListener("mouseleave", function () {
      artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, function () {
        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
          artCurrentIndex = index;
        });
      });
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
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load photography_images.json: " + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error("photography_images.json is not a valid array");

        photographyImages = data
          .filter(function (item) {
            return item.file && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.file);
          })
          .map(function (item) {
            return {
              file: item.file,
              caption: item.caption || "",
              url: "https://raw.githubusercontent.com/kappter/portfolio/main/photography/" + item.file,
            };
          });

        if (photographyImages.length === 0) return;

        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex,
          function (index) {
            photographyCurrentIndex = index;
          }
        );

        photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, function () {
          changeImage(
            photographyCarouselImage,
            photographyCarouselCaption,
            photographyImages,
            photographyCurrentIndex + 1,
            function (index) {
              photographyCurrentIndex = index;
            }
          );
        });
      })
      .catch(function (error) {
        console.error("Error loading photography images:", error.message);
      });

    if (photographyPrevButton) {
      photographyPrevButton.addEventListener("click", function () {
        photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex - 1,
          function (index) {
            photographyCurrentIndex = index;
          }
        );
        photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, function () {
          changeImage(
            photographyCarouselImage,
            photographyCarouselCaption,
            photographyImages,
            photographyCurrentIndex + 1,
            function (index) {
              photographyCurrentIndex = index;
            }
          );
        });
      });
    }

    if (photographyNextButton) {
      photographyNextButton.addEventListener("click", function () {
        photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex + 1,
          function (index) {
            photographyCurrentIndex = index;
          }
        );
        photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, function () {
          changeImage(
            photographyCarouselImage,
            photographyCarouselCaption,
            photographyImages,
            photographyCurrentIndex + 1,
            function (index) {
              photographyCurrentIndex = index;
            }
          );
        });
      });
    }

    photographyCarouselContainer.addEventListener("mouseenter", function () {
      photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
    });

    photographyCarouselContainer.addEventListener("mouseleave", function () {
      photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, function () {
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex + 1,
          function (index) {
            photographyCurrentIndex = index;
          }
        );
      });
    });
  }

  // ============================================================
  // Fallback event delegation for carousel buttons
  // ============================================================

  if (artCarouselContainer) {
    artCarouselContainer.addEventListener("click", function (event) {
      const prevButton = event.target.closest(".art-carousel .carousel-prev");
      const nextButton = event.target.closest(".art-carousel .carousel-next");

      if (prevButton) {
        artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, function (index) {
          artCurrentIndex = index;
        });
      }

      if (nextButton) {
        artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
        changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
          artCurrentIndex = index;
        });
      }
    });
  }

  if (photographyCarouselContainer) {
    photographyCarouselContainer.addEventListener("click", function (event) {
      const prevButton = event.target.closest(".photography-carousel .carousel-prev");
      const nextButton = event.target.closest(".photography-carousel .carousel-next");

      if (prevButton) {
        photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex - 1,
          function (index) {
            photographyCurrentIndex = index;
          }
        );
      }

      if (nextButton) {
        photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
        changeImage(
          photographyCarouselImage,
          photographyCarouselCaption,
          photographyImages,
          photographyCurrentIndex + 1,
          function (index) {
            photographyCurrentIndex = index;
          }
        );
      }
    });
  }

  // ============================================================
  // Keyboard navigation for both carousels
  // ============================================================

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
      changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, function (index) {
        artCurrentIndex = index;
      });

      photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
      changeImage(
        photographyCarouselImage,
        photographyCarouselCaption,
        photographyImages,
        photographyCurrentIndex - 1,
        function (index) {
          photographyCurrentIndex = index;
        }
      );
    }

    if (event.key === "ArrowRight") {
      artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
      changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, function (index) {
        artCurrentIndex = index;
      });

      photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
      changeImage(
        photographyCarouselImage,
        photographyCarouselCaption,
        photographyImages,
        photographyCurrentIndex + 1,
        function (index) {
          photographyCurrentIndex = index;
        }
      );
    }
  });
});
