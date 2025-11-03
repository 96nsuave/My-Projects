// Initialize icons (safeguard if lucide is present)
if (window.lucide) lucide.createIcons();

// ===== NAVBAR TOGGLE =====
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("active");
  });
}

// ===== SCROLL PROGRESS BAR =====
const progress = document.getElementById("scroll-progress");
window.addEventListener("scroll", () => {
  if (!progress) return;
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progress.style.width = pct + "%";
});

// ===== FADE-UP ON SCROLL =====
const fadeElems = document.querySelectorAll(".fade-up");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        o.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });
  fadeElems.forEach((el) => obs.observe(el));
} else {
  // fallback
  fadeElems.forEach((el) => el.classList.add("visible"));
}

// ===== CATEGORY FILTER (no "All") =====
const categoryButtons = document.querySelectorAll(".categories button");
const projectCards = document.querySelectorAll(".project-card");

function showCategory(category) {
  projectCards.forEach((card) => {
    if (card.dataset.category === category) {
      card.style.display = "block";
      // allow animation
      setTimeout(() => card.classList.add("visible"), 60);
    } else {
      card.classList.remove("visible");
      setTimeout(() => (card.style.display = "none"), 220);
    }
  });
}

// attach click handlers
if (categoryButtons.length) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      showCategory(cat);
      // scroll to projects area a bit down
      const projects = document.getElementById("projects");
      if (projects) projects.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // On load, show the active category (first active button)
  window.addEventListener("DOMContentLoaded", () => {
    const active = document.querySelector(".categories button.active");
    const initialCat = active ? active.dataset.category : (categoryButtons[0] && categoryButtons[0].dataset.category);
    if (initialCat) showCategory(initialCat);
  });
}

// ===== CATEGORY TILE SLIDESHOWS (2x2 homepage tiles) =====
const tiles = document.querySelectorAll(".tile");
tiles.forEach((tile) => {
  const container = tile.querySelector(".tile-slideshow");
  if (!container) return;
  // parse slides data from data-slides attribute
  let slides = [];
  try {
    slides = JSON.parse(container.getAttribute("data-slides") || "[]");
  } catch (e) { slides = []; }

  // create slide elements
  slides.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "slide";
    if (i === 0) div.classList.add("active");
    // set background using provided bg or fallback
    div.style.background = s.bg || "linear-gradient(135deg,#010101,#001017)";
    div.innerHTML = `<div class="label">${s.label || ""}</div>`;
    container.appendChild(div);
  });

  // auto-cycle
  let idx = 0;
  if (slides.length > 1) {
    setInterval(() => {
      const slideEls = container.querySelectorAll(".slide");
      slideEls[idx] && slideEls[idx].classList.remove("active");
      idx = (idx + 1) % slideEls.length;
      slideEls[idx] && slideEls[idx].classList.add("active");
    }, 2800); // 2.8s per slide
  }

  // clicking a tile should activate that category in Projects
  tile.addEventListener("click", () => {
    const cat = tile.dataset.category;
    const btn = document.querySelector(`.categories button[data-category="${cat}"]`);
    if (btn) btn.click();
  });
});

// ===== PROJECT MODAL (click link to open, click outside to close) =====
const modal = document.getElementById("project-modal");
const modalImage = document.getElementById("modal-image");
const modalVideo = document.getElementById("modal-video");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalLink = document.getElementById("modal-link");
const closeBtn = document.querySelector(".close-modal");

// open when a project link is clicked (if link present)
document.querySelectorAll(".project-card a").forEach((a) => {
  a.addEventListener("click", (e) => {
    // we allow default navigation if target is external path; user requested click opens popup
    e.preventDefault();
    const card = a.closest(".project-card");
    if (!card || !modal) return;

    const title = a.querySelector("h4") ? a.querySelector("h4").textContent : "";
    const desc = a.querySelector("p") ? a.querySelector("p").textContent : "";
    const media = card.dataset.media || "";
    const type = card.dataset.type || "image";

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalLink) modalLink.href = a.getAttribute("href") || "#";

    // reset media display
    if (modalImage) { modalImage.style.display = "none"; modalImage.src = ""; }
    if (modalVideo) { modalVideo.style.display = "none"; modalVideo.src = ""; modalVideo.pause(); }

    if (type === "video" && media) {
      modalVideo.src = media;
      modalVideo.style.display = "block";
      modalVideo.play().catch(() => {});
    } else if (media) {
      modalImage.src = media;
      modalImage.style.display = "block";
    } else {
      // fallback: show placeholder gradient background (we can show the title only)
      if (modalImage) {
        modalImage.style.display = "block";
        modalImage.src = ""; // no external image provided
        modalImage.style.background = "linear-gradient(135deg,#001017,#071017)";
      }
    }

    modal.classList.add("show");
    if (modal) modal.setAttribute("aria-hidden", "false");
  });
});

// close handlers
if (closeBtn) closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  if (modalVideo) { modalVideo.pause(); modalVideo.src = ""; }
  if (modal) modal.setAttribute("aria-hidden", "true");
});
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
    if (modalVideo) { modalVideo.pause(); modalVideo.src = ""; }
    if (modal) modal.setAttribute("aria-hidden", "true");
  }
});

// ===== ACTIVE NAV HIGHLIGHT (simple, efficient) =====
const navLinksA = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  let current = "";
  sections.forEach((s) => {
    if (s.offsetTop - 120 <= y) current = s.id;
  });
  navLinksA.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});
// ===== VISITOR COUNTER (no login needed) =====
fetch("https://api.countapi.xyz/hit/yourdomain.com/visits")
  .then((res) => res.json())
  .then((data) => {
    const counter = document.getElementById("visitor-count");
    if (counter) counter.textContent = data.value.toLocaleString();
  })
  .catch(() => {
    const counter = document.getElementById("visitor-count");
    if (counter) counter.textContent = "Error";
  });
