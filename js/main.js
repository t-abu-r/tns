/**
 * The National School & College (TNS) - Main Interactive Script
 * Vision Education System ("رَبِّ زِدْنِي عِلْمًا")
 */

(function () {
  'use strict';

  /* Broken-image fallback (SVG crest) so missing rough/ and assets/ images
     never leave broken icons on the page. */
  const LOGO_FALLBACK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="47" fill="#002147" stroke="#D4AF37" stroke-width="4"/>' +
    '<path d="M50 18 L82 48 L50 82 L18 48 Z" fill="none" stroke="#D4AF37" stroke-width="3"/>' +
    '<text x="50" y="55" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#D4AF37">TNS</text>' +
    '</svg>';

  function applyLogoFallback(img) {
    const src = img.getAttribute('src') || '';
    if (src.indexOf('data:image/svg+xml') === 0) return;
    img.setAttribute('src', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_FALLBACK));
  }

  document.addEventListener('error', function (event) {
    const target = event.target;
    if (target && target.tagName === 'IMG') applyLogoFallback(target);
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
      if (img.complete && img.naturalWidth === 0) applyLogoFallback(img);
    });
    initNavbar();
    initSmoothScroll();
    initHeroCarousel();
    initAcademicsTabFilter();
    initFAQAccordion();
    initScrollReveal();
  });

/* ==========================================================================
   1. NAVBAR & MOBILE MENU
   ========================================================================== */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

function initNavbar() {
  const navbar = document.getElementById('mainNav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('glass-nav-scrolled');
    } else {
      navbar.classList.remove('glass-nav-scrolled');
    }
  });

  if (mobileMenuBtn && mobileMenu) {
    const icon = mobileMenuBtn.querySelector('i');

    function openMenu() {
      mobileMenu.classList.remove('hidden');
      requestAnimationFrame(() => {
        mobileMenu.classList.add('mobile-drawer-open');
      });
      if (icon) icon.className = 'fa-solid fa-xmark text-2xl';
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      mobileMenuBtn.setAttribute('aria-label', 'Close menu');
    }

    function closeMenu() {
      mobileMenu.classList.add('hidden');
      mobileMenu.classList.remove('mobile-drawer-open');
      if (icon) icon.className = 'fa-solid fa-bars text-2xl';
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    }

    mobileMenuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    const menuButtons = mobileMenu.querySelectorAll('button');
    menuButtons.forEach(btn => {
      btn.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (mobileMenu.classList.contains('hidden')) return;
      if (!navbar.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }
}

/* Smooth-scroll for in-page anchors (header links, Apply Now, footer links).
   Handles the sticky header offset and waits for the mobile drawer to
   collapse before scrolling so the target position is correct. */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const scroll = () => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', id);
      }
    };

    const menu = document.getElementById('mobileMenu');
    const fromDrawer = menu && menu.contains(link);
    if (fromDrawer) {
      // The drawer's close handler runs before this document-level listener,
      // so wait for its collapse animation (0.35s) before scrolling.
      setTimeout(scroll, 380);
    } else {
      scroll();
    }
  });
}

/* ==========================================================================
   2. HERO SLIDER CAROUSEL
   ========================================================================== */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  let currentSlide = 0;
  const slideInterval = 5000;

  if (slides.length === 0) return;

  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  let timer = setInterval(nextSlide, slideInterval);

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goToSlide(idx);
      timer = setInterval(nextSlide, slideInterval);
    });
  });
}

/* ==========================================================================
   4. ACADEMICS SUBJECT FILTERING & LEVEL TABS
   ========================================================================== */
const subjectsData = {
  preolevel: [
    { name: "English", code: "Pre-O G8", stream: "all", icon: "fa-book", desc: "Foundational English grammar, composition, reading comprehension, and spoken communication skills.", topics: ["Grammar & Vocabulary", "Comprehension Skills", "Composition Writing", "Oral Communication"] },
    { name: "Mathematics", code: "Pre-O G8", stream: "all", icon: "fa-calculator", desc: "Core arithmetic, basic algebra, geometry, and introductory statistics to prepare for O-Level Mathematics.", topics: ["Number Systems", "Algebra Foundations", "Geometry Basics", "Data & Statistics"] },
    { name: "Science", code: "Pre-O G8", stream: "all", icon: "fa-flask", desc: "Integrated introduction to physics, chemistry, and biology concepts in modern science labs.", topics: ["Introduction to Physics", "Chemistry Fundamentals", "Biological Basics", "Scientific Method"] },
    { name: "Computer Science", code: "Pre-O G8", stream: "all", icon: "fa-laptop-code", desc: "Computer literacy, typing skills, word processing, spreadsheets, and introductory coding concepts.", topics: ["Computer Hardware", "Office Applications", "Internet & e-Safety", "Introduction to Coding"] },
    { name: "Pakistan Studies", code: "Pre-O G8", stream: "all", icon: "fa-earth-asia", desc: "Introduction to Pakistan's history, geography, culture, and civic responsibilities.", topics: ["Geography of Pakistan", "History & Heritage", "Civics & Citizenship", "Cultural Diversity"] },
    { name: "Islamiyat", code: "Pre-O G8", stream: "all", icon: "fa-mosque", desc: "Islamic studies foundation with emphasis on moral values, ethics, and discipline.", topics: ["Quranic Studies", "Seerat-un-Nabi", "Moral Ethics", "Good Manners & Discipline"] },
    { name: "Urdu", code: "Pre-O G8", stream: "all", icon: "fa-language", desc: "Urdu grammar, prose comprehension, creative composition, and basic literary appreciation.", topics: ["Urdu Grammar", "Prose Comprehension", "Composition Writing", "Literary Basics"] }
  ],

  olevel: [
    { 
      name: "Mathematics", 
      code: "4024 / 0580", 
      stream: "core", 
      icon: "fa-calculator", 
      desc: "Algebraic structures, trigonometry, vector geometry, statistics, and coordinate geometry.", 
      topics: ["Algebra & Functions", "Trigonometry", "Vectors & Matrices", "Statistics & Probability"],
      teacher: { name: "Sir. Muzaffar", role: "Senior Mathematics Specialist", imagePath: "assets/sir.muzafar_math_teacher.jpeg" }
    },
    { 
      name: "English Language", 
      code: "1123 / 0500", 
      stream: "core", 
      icon: "fa-book", 
      desc: "Reading comprehension, analytical essay writing, directed writing, and vocabulary skills.", 
      topics: ["Comprehension & Analysis", "Directed Writing", "Composition", "Language Usage"],
      teacher: { name: "Sir. Abid Nathaniel", role: "English Language Faculty Lead", imagePath: "assets/Sir. Abid Nathaniel_English_Faculty_lead.png" }
    },
    { 
      name: "Urdu", 
      code: "3248 / 0539", 
      stream: "core", 
      icon: "fa-language", 
      desc: "Urdu syllabus covering translation, essay writing, passage comprehension, and grammar.", 
      topics: ["Translation Skills", "Essay Writing", "Comprehension", "Grammar"],
      teacher: { name: "Sir. M Anis Hijazi", role: "Senior Urdu Faculty", imagePath: "assets/Sir.M_Anis_Hijazi_URDU.jpeg" }
    },
    { 
      name: "Islamiyat", 
      code: "2058 / 0493", 
      stream: "core", 
      icon: "fa-mosque", 
      desc: "Study of Quranic passages, Life of the Prophet (PBUH), early Muslim community, and Hadith.", 
      topics: ["Quranic Passages", "Life of Prophet (PBUH)", "First Islamic Community", "Hadiths of Prophet"],
      teacher: { name: "Sir. Saeed", role: "Islamiyat Senior Scholar", imagePath: "assets/Sir.Saeed_Islamiyat.jpeg" }
    },
    { 
      name: "Pakistan Studies", 
      code: "2059 / 0448", 
      stream: "core", 
      icon: "fa-earth-asia", 
      desc: "History and cultural heritage of Pakistan alongside physical geography, environment, and economy.", 
      topics: ["History of Pakistan", "Geography & Climate", "Natural Resources", "Economic Development"],
      teacher: { name: "Ms. Farhana Salman", role: "Pakistan Studies Specialist", imagePath: "assets/logo.jpg" }
    },
    { 
      name: "Chemistry", 
      code: "5070 / 0620", 
      stream: "science", 
      icon: "fa-flask", 
      desc: "Stoichiometry, organic chemistry, electrochemistry, periodic trends, and chemical energetics.", 
      topics: ["States of Matter", "Chemical Bonding", "Organic Chemistry", "Chemical Energetics"],
      teacher: { name: "Sir. Arslan Bukhari", role: "Senior Chemistry Faculty", imagePath: "assets/Sir.Arslan_Bukhari_Chemistry.jpeg" }
    },
    { 
      name: "Physics", 
      code: "5054 / 0625", 
      stream: "science", 
      icon: "fa-atom", 
      desc: "Fundamental principles of mechanics, thermal physics, waves, electricity, magnetism, and nuclear physics.", 
      topics: ["Kinematics & Dynamics", "Thermal Physics", "Electricity & Magnetism", "Atomic Physics"],
      teacher: { name: "Sir. Bilal Bhatti", role: "Senior Physics Specialist", imagePath: "assets/Physics_teacher_sir_bilal.jpeg" }
    },
    { 
      name: "Computer Science", 
      code: "2210 / 0478", 
      stream: "science", 
      icon: "fa-laptop-code", 
      desc: "Algorithm design, Python programming, database management, computer networks, and cybersecurity.", 
      topics: ["Logic Gates & Architecture", "Python Programming", "Database Concepts", "Automated Systems"],
      teacher: { name: "Sir. Farhan Durrani", role: "Head of Computer Science", imagePath: "assets/Sir.Farhan_Durrani_computer.jpeg" }
    },
    { 
      name: "Biology", 
      code: "5090 / 0610", 
      stream: "science", 
      icon: "fa-dna", 
      desc: "Cellular biology, human physiology, genetics, plant nutrition, ecology, and biotechnology.", 
      topics: ["Cell Structure", "Human Physiology", "Genetics & Inheritance", "Ecology & Ecosystems"],
      teacher: { name: "Ms. Samia Mohsin", role: "Senior Biology Faculty", imagePath: "assets/Ms.Samia_Mohsin_Biology.jpeg" }
    },
    { 
      name: "Commerce", 
      code: "7100 / IGCSE", 
      stream: "humanities-commerce", 
      icon: "fa-cart-shopping", 
      desc: "Commercial trade principles, international logistics, banking, insurance, and retail operations.", 
      topics: ["Commercial Structure", "Trade & Logistics", "Banking & Finance", "Insurance & Risk"],
      teacher: { name: "Sir. Yasir Hussain", role: "Commerce & Economics Lead", imagePath: "assets/sir.yasir_hussain_commerce_economics.jpeg" }
    },
    { 
      name: "Business Studies", 
      code: "7115 / 0450", 
      stream: "humanities-commerce", 
      icon: "fa-briefcase", 
      desc: "Business structure, marketing strategies, financial management, operations, and HR planning.", 
      topics: ["Business Activity", "Marketing Strategy", "Financial Planning", "Human Resources"],
      teacher: { name: "Ms. Sadia Faisal", role: "Head of Business Studies", imagePath: "assets/Ms. Sadia Faisal_Coordinator_Business.jpeg" }
    },
    { 
      name: "Economics", 
      code: "2281 / 0455", 
      stream: "humanities-commerce", 
      icon: "fa-coins", 
      desc: "Microeconomics, market demand/supply, macroeconomics, international trade, and government policies.", 
      topics: ["Basic Economic Problem", "Microeconomic Decision Makers", "Government Policies", "International Trade"],
      teacher: { name: "Sir. Yasir Hussain", role: "Senior Economics Faculty", imagePath: "assets/sir.yasir_hussain_commerce_economics.jpeg" }
    },
    { 
      name: "Environmental Management", 
      code: "5014 / 0680", 
      stream: "humanities-commerce", 
      icon: "fa-leaf", 
      desc: "Environmental systems, sustainable development, resource management, and ecological conservation.", 
      topics: ["Rocks & Minerals", "Energy & Environment", "Agriculture & Water", "Oceans & Atmosphere"],
      teacher: { name: "Ms. Breera Mehmood", role: "Environmental Management Specialist", imagePath: "assets/logo.jpg" }
    }
  ],

  alevel: [
    { 
      name: "Physics", 
      code: "9702", 
      stream: "sciences", 
      icon: "fa-atom", 
      desc: "Advanced mechanics, quantum physics, thermodynamics, oscillations, gravitational fields, and particle physics.", 
      topics: ["Circular Motion & Gravitation", "Oscillations & Waves", "Quantum Physics", "Practical Physics"],
      teacher: { name: "Sir. Bilal Bhatti", role: "A-Level Physics Specialist", imagePath: "assets/Physics_teacher_sir_bilal.jpeg" }
    },
    { 
      name: "Chemistry", 
      code: "9701", 
      stream: "sciences", 
      icon: "fa-flask", 
      desc: "Transition metals, organic synthesis mechanisms, reaction kinetics, physical chemistry, and spectroscopic analysis.", 
      topics: ["Physical Chemistry", "Inorganic & Transition Metals", "Organic Synthesis", "Analytical Techniques"],
      teacher: { name: "Sir. Usman Arshad", role: "A-Level Chemistry Lead", imagePath: "assets/a_levels_usman_arshad_chemistry.png" }
    },
    { 
      name: "Mathematics", 
      code: "9709", 
      stream: "sciences", 
      icon: "fa-square-root-variable", 
      desc: "Pure Mathematics (P1 & P3), Mechanics (M1), and Probability & Statistics (S1).", 
      topics: ["Pure Mathematics 1 & 3", "Mechanics 1", "Probability & Statistics 1", "Numerical Methods"],
      teacher: { name: "Sir. Muzaffar", role: "A-Level Pure Maths Lead", imagePath: "assets/sir.muzafar_math_teacher.jpeg" }
    },
    { 
      name: "Biology", 
      code: "9700", 
      stream: "sciences", 
      icon: "fa-dna", 
      desc: "Molecular genetics, biochemistry, gene technology, neurobiology, and biodiversity conservation.", 
      topics: ["Biochemistry & Enzymes", "Gene Technology", "Control & Coordination", "Ecosystem Dynamics"],
      teacher: { name: "Ms. Samia Mohsin", role: "A-Level Biology Specialist", imagePath: "assets/Ms.Samia_Mohsin_Biology.jpeg" }
    },
    { 
      name: "Economics", 
      code: "9708", 
      stream: "commerce", 
      icon: "fa-coins", 
      desc: "Market failure, behavioral economics, macroeconomic stability, international monetary systems, and development economics.", 
      topics: ["Price System & Microeconomy", "Government Intervention", "International Macroeconomics", "Economic Development"],
      teacher: { name: "Sir. Yasir Hussain", role: "A-Level Economics Head", imagePath: "assets/sir.yasir_hussain_commerce_economics.jpeg" }
    },
    { 
      name: "Business Studies", 
      code: "9609", 
      stream: "commerce", 
      icon: "fa-briefcase", 
      desc: "Strategic management, financial planning, marketing strategies, global business operations, and human resources.", 
      topics: ["Business Strategy", "Marketing Management", "Finance & Accounting", "Operations & HR"],
      teacher: { name: "Sir. Yasir Hussain", role: "A-Level Business Head", imagePath: "assets/sir.yasir_hussain_commerce_economics.jpeg" }
    },
    { 
      name: "Law", 
      code: "9084", 
      stream: "humanities", 
      icon: "fa-scale-balanced", 
      desc: "English legal system, law of contract, law of tort, and criminal law principles.", 
      topics: ["English Legal System", "Law of Contract", "Law of Tort", "Criminal Liability"],
      teacher: { name: "Ms. Farah", role: "A-Level Law Faculty", imagePath: "assets/logo.jpg" }
    },
    { 
      name: "Psychology", 
      code: "9990", 
      stream: "humanities", 
      icon: "fa-brain", 
      desc: "Clinical psychology, cognitive psychology, biological psychology, social psychology, and research methodology.", 
      topics: ["Biological & Cognitive", "Clinical Psychology", "Social Psychology", "Research Methodology"],
      teacher: { name: "Ms. Farhana Salman", role: "A-Level Psychology Lead", imagePath: "assets/logo.jpg" }
    },
    { 
      name: "Sociology", 
      code: "9699", 
      stream: "humanities", 
      icon: "fa-people-group", 
      desc: "Socialization, identity, media, global development, religion, and sociological research methodologies.", 
      topics: ["Socialization & Identity", "Media & Society", "Global Development", "Sociological Methods"],
      teacher: { name: "Ms. Farhana Salman", role: "A-Level Sociology Faculty", imagePath: "assets/logo.jpg" }
    },
    { 
      name: "Urdu", 
      code: "9686", 
      stream: "humanities", 
      icon: "fa-language", 
      desc: "Advanced Urdu language, classical & modern literature, essay writing, prose comprehension, and poetry analysis.", 
      topics: ["Urdu Composition", "Classical Literature", "Modern Literature", "Prose & Translation"],
      teacher: { name: "Sir. M Anis Hijazi", role: "A-Level Urdu Specialist", imagePath: "assets/Sir.M_Anis_Hijazi_URDU.jpeg" }
    }
  ]
};

const streamTabsConfig = {
  preolevel: [],
  olevel: [
    { id: "core", label: "Compulsory Core", icon: "fa-star" },
    { id: "science", label: "Science Stream", icon: "fa-flask" },
    { id: "humanities-commerce", label: "Humanities & Commerce", icon: "fa-briefcase" }
  ],
  alevel: [
    { id: "all", label: "All Streams", icon: "fa-layer-group" },
    { id: "sciences", label: "Sciences", icon: "fa-atom" },
    { id: "commerce", label: "Commerce", icon: "fa-chart-line" },
    { id: "humanities", label: "Humanities", icon: "fa-scale-balanced" }
  ]
};

let currentLevel = 'olevel';
let currentSubStream = 'core';

function initAcademicsTabFilter() {
  const levelTabs = document.querySelectorAll('.level-tab');

  levelTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      if (!targetBtn) return;

      levelTabs.forEach(t => {
        t.classList.remove('active');
        t.removeAttribute('aria-selected');
      });
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');

      currentLevel = targetBtn.getAttribute('data-level');

      if (currentLevel === 'preolevel') {
        currentSubStream = 'all';
      } else if (currentLevel === 'olevel') {
        currentSubStream = 'core';
      } else if (currentLevel === 'alevel') {
        currentSubStream = 'all';
      }

      renderSubStreamButtons();
      renderSubjects();
    });
  });

  renderSubStreamButtons();
  renderSubjects();
}

function renderSubStreamButtons() {
  const filterContainer = document.getElementById('streamFilterContainer');
  const bannerContainer = document.getElementById('preOLevelBannerContainer');

  if (!filterContainer) return;

  if (currentLevel === 'preolevel') {
    filterContainer.classList.add('hidden');
    filterContainer.innerHTML = '';

    if (bannerContainer) {
      bannerContainer.classList.remove('hidden');
      bannerContainer.innerHTML = `
        <div class="info-banner">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          <span>Pre-O Level Foundation Program — All 7 Subjects are Compulsory</span>
        </div>
      `;
    }
    return;
  }

  if (bannerContainer) {
    bannerContainer.classList.remove('hidden');

    if (currentLevel === 'preolevel') {
      bannerContainer.innerHTML = `
        <div class="info-banner">
          <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          <span>Pre-O Level Foundation Program — All 7 Subjects are Compulsory</span>
        </div>
      `;
    } else {
      bannerContainer.innerHTML = '';
    }
  }

  filterContainer.classList.remove('hidden');

  const config = streamTabsConfig[currentLevel] || [];
  filterContainer.innerHTML = config.map(btn => {
    const isActive = btn.id === currentSubStream;
    return `
      <button class="substream-btn ${isActive ? 'active' : ''}" data-substream="${btn.id}">
        <i class="fa-solid ${btn.icon}" aria-hidden="true"></i>
        ${btn.label}
      </button>
    `;
  }).join('');

  const subBtns = filterContainer.querySelectorAll('.substream-btn');
  subBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget;
      currentSubStream = target.getAttribute('data-substream');

      subBtns.forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      renderSubjects();
    });
  });
}

function renderSubjects() {
  const container = document.getElementById('subjectGridContainer');
  if (!container) return;

  const list = subjectsData[currentLevel] || [];
  const filtered = list.filter(item => {
    if (currentSubStream === 'all') return true;
    return item.stream === currentSubStream;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
        <p class="font-semibold">No subjects listed under this stream for ${currentLevel.toUpperCase()}.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    // Pre-O Level Cards (Grade 8): Exclude teacher photos/details completely
    if (currentLevel === 'preolevel' || !item.teacher) {
      return `
        <div class="subject-card">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <span class="card-icon"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
              <span class="code-chip"><span>Code: ${item.code}</span></span>
            </div>
            <h3 class="card-title">${item.name}</h3>
            <span class="card-kicker">Grade 8 Foundation Subject</span>
            <div class="card-action">
              <button onclick="openSubjectDetail('${item.name}', '${item.code}', '${encodeURIComponent(item.desc)}', '${encodeURIComponent(JSON.stringify(item.topics))}')"
                      class="btn btn-outline btn-block btn-sm">
                <span>View Detailed Syllabus</span>
                <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Prominent Faculty Cards for O-Level & A-Level (Top Half Photo Header)
    return `
      <div class="subject-card">
        <div class="card-photo">
          <img src="${item.teacher.imagePath}"
               alt="${item.teacher.name}"
               loading="lazy"
               onerror="this.onerror=null; this.src='assets/logo.jpg';" />
          <div class="code-chip">
            <span>Code: ${item.code}</span>
            <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
          </div>
        </div>

        <div class="card-body">
          <h3 class="card-title">${item.name}</h3>

          <div class="faculty-row">
            <span class="faculty-avatar"><i class="fa-solid fa-user-tie" aria-hidden="true"></i></span>
            <div>
              <span class="faculty-role">Faculty In-Charge</span>
              <span class="faculty-name">${item.teacher.name}</span>
              <span class="faculty-role">${item.teacher.role}</span>
            </div>
          </div>

          <div class="card-action">
            <button onclick="openSubjectDetail('${item.name}', '${item.code}', '${encodeURIComponent(item.desc)}', '${encodeURIComponent(JSON.stringify(item.topics))}')"
                    class="btn btn-outline btn-block btn-sm">
              <span>View Detailed Syllabus</span>
              <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Subject Detail Modal Trigger
window.openSubjectDetail = function(name, code, encodedDesc, encodedTopics) {
  const desc = decodeURIComponent(encodedDesc);
  const topics = JSON.parse(decodeURIComponent(encodedTopics));

  const modalHtml = `
    <div id="subjectModal" class="modal-backdrop animate-fadeIn">
      <div class="modal-card max-w-lg" role="dialog" aria-modal="true" aria-label="${name} syllabus details">
        <div class="modal-header">
          <div class="flex items-center gap-3">
            <span class="event-status">CAIE ${code}</span>
            <span class="text-xs" style="color: var(--muted);">Cambridge Pathway</span>
          </div>
          <button type="button" onclick="closeSubjectModal()" class="modal-close" aria-label="Close syllabus dialog">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div class="modal-body">
          <h3 class="font-serif-header font-bold text-2xl mb-3" style="color: var(--navy);">${name}</h3>
          <p class="text-sm leading-relaxed mb-6" style="color: var(--muted);">${desc}</p>

          <h4 class="font-bold text-xs uppercase mb-3" style="color: var(--navy); letter-spacing: 0.08em;">Core Syllabus Topics</h4>
          <ul class="space-y-2 mb-6">
            ${topics.map(t => `
              <li class="flex items-center text-sm" style="color: var(--ink);">
                <i class="fa-solid fa-circle-check text-emerald-600 mr-2.5 text-xs" aria-hidden="true"></i>
                <span>${t}</span>
              </li>
            `).join('')}
          </ul>

          <div class="flex flex-wrap items-center justify-between gap-3 p-4 border border-slate-200 rounded" style="background: var(--paper);">
            <div>
              <span class="block text-xs font-bold" style="color: var(--muted);">Academic Counseling Desk</span>
              <span class="text-xs" style="color: var(--ink);">Need advice selecting this subject?</span>
            </div>
            <a href="admissions.html" onclick="closeSubjectModal()" class="btn btn-navy btn-sm">
              Ask Counselor
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.id = 'subjectModalWrapper';
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper);
};

window.closeSubjectModal = function() {
  const wrapper = document.getElementById('subjectModalWrapper');
  if (wrapper) wrapper.remove();
};

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');

        faqItems.forEach(other => {
          other.querySelector('.faq-content')?.classList.add('hidden');
          other.querySelector('.faq-icon')?.classList.remove('rotate-180');
          const otherBtn = other.querySelector('.faq-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });
}
})();
