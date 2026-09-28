"use strict";

/*
=========================================================
 ALICIA MINI APP
 Frontend uniquement
 bot.py n'est pas modifié
=========================================================
*/


/* ======================================================
   TELEGRAM WEB APP
====================================================== */

const tg = window.Telegram?.WebApp || null;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#f5f5f7");
        tg.setBackgroundColor("#f5f5f7");
    } catch (error) {
        console.warn("Telegram WebApp settings:", error);
    }
}


/* ======================================================
   ÉTAT DE L'APPLICATION
====================================================== */

const state = {
    currentPage: "homePage",

    stars: 0,

    user: {
        id: null,
        firstName: "Alicia",
        lastName: "",
        username: "",
        photoUrl: ""
    },

    projects: [],

    images: []
};


/* ======================================================
   OUTILS DOM
====================================================== */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => {
    return Array.from(document.querySelectorAll(selector));
};


/* ======================================================
   TOAST
====================================================== */

let toastTimer = null;

function showToast(message, icon = "ri-information-line") {

    const toast = $("#toast");
    const toastMessage = $("#toastMessage");

    if (!toast || !toastMessage) return;

    const iconElement = toast.querySelector("i");

    if (iconElement) {
        iconElement.className = icon;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* ======================================================
   NOM UTILISATEUR
====================================================== */

function getUserDisplayName() {

    const first = state.user.firstName || "";
    const last = state.user.lastName || "";

    const fullName = `${first} ${last}`.trim();

    return fullName || "Alicia";
}


/* ======================================================
   TELEGRAM USER
====================================================== */

function loadTelegramUser() {

    if (!tg || !tg.initDataUnsafe) {
        return;
    }

    const telegramUser = tg.initDataUnsafe.user;

    if (!telegramUser) {
        return;
    }

    state.user.id = telegramUser.id || null;
    state.user.firstName = telegramUser.first_name || "Alicia";
    state.user.lastName = telegramUser.last_name || "";
    state.user.username = telegramUser.username || "";
    state.user.photoUrl = telegramUser.photo_url || "";

    updateUserInterface();
}


/* ======================================================
   INTERFACE UTILISATEUR
====================================================== */

function updateUserInterface() {

    const displayName = getUserDisplayName();

    const userName = $("#userName");
    const profileName = $("#profileName");
    const profileFullName = $("#profileFullName");
    const profileUsername = $("#profileUsername");

    if (userName) {
        userName.textContent = displayName;
    }

    if (profileName) {
        profileName.textContent = displayName;
    }

    if (profileFullName) {
        profileFullName.textContent = displayName;
    }

    if (profileUsername) {

        if (state.user.username) {
            profileUsername.textContent =
                `@${state.user.username}`;
        } else if (state.user.id) {
            profileUsername.textContent =
                `ID ${state.user.id}`;
        } else {
            profileUsername.textContent =
                "Telegram";
        }
    }


    const userPhoto = $("#userPhoto");
    const profilePhoto = $("#profilePhoto");

    if (state.user.photoUrl) {

        if (userPhoto) {
            userPhoto.src = state.user.photoUrl;
        }

        if (profilePhoto) {
            profilePhoto.src = state.user.photoUrl;
        }
    }


    updateStarsUI();
}


/* ======================================================
   ÉTOILES
====================================================== */

function updateStarsUI() {

    const balanceElements = [
        $("#starsBalance"),
        $("#starsPageBalance"),
        $("#profileStars")
    ];

    balanceElements.forEach((element) => {

        if (!element) return;

        if (element.id === "profileStars") {
            element.textContent =
                `${formatNumber(state.stars)} ⭐`;
        } else {
            element.textContent =
                formatNumber(state.stars);
        }
    });
}


function formatNumber(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("fr-FR").format(number);
}


function setStars(amount) {

    state.stars = Math.max(0, Number(amount) || 0);

    updateStarsUI();

    saveLocalState();
}


/* ======================================================
   STOCKAGE LOCAL
====================================================== */

const STORAGE_KEY = "alicia_miniapp_state_v1";


function saveLocalState() {

    try {

        const data = {
            stars: state.stars,
            projects: state.projects,
            images: state.images
        };

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Impossible de sauvegarder l'état:",
            error
        );
    }
}


function loadLocalState() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) return;

        const data = JSON.parse(raw);

        if (typeof data.stars === "number") {
            state.stars = data.stars;
        }

        if (Array.isArray(data.projects)) {
            state.projects = data.projects;
        }

        if (Array.isArray(data.images)) {
            state.images = data.images;
        }

    } catch (error) {

        console.warn(
            "Impossible de charger l'état:",
            error
        );
    }
}


/* ======================================================
   NAVIGATION
====================================================== */

function showPage(pageId) {

    const page = document.getElementById(pageId);

    if (!page) {
        console.warn(
            `Page introuvable: ${pageId}`
        );
        return;
    }


    $$(".page").forEach((item) => {
        item.classList.remove("active-page");
    });


    page.classList.add("active-page");


    state.currentPage = pageId;


    updateBottomNavigation(pageId);


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function updateBottomNavigation(pageId) {

    $$(".nav-item").forEach((button) => {

        const target =
            button.dataset.page;

        button.classList.toggle(
            "active",
            target === pageId
        );
    });
}


/* ======================================================
   BOUTONS DATA-PAGE
====================================================== */

function initializeNavigation() {

    $$("[data-page]").forEach((button) => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            if (!page) return;

            showPage(page);
        });
    });
}


/* ======================================================
   SPLASH SCREEN
====================================================== */

function startSplashScreen() {

    const splash = $("#splashScreen");
    const progress = $("#loadingProgress");
    const app = $("#app");

    if (!splash || !app) return;

    app.classList.add("hidden");


    let value = 0;

    const interval = setInterval(() => {

        value += Math.floor(
            Math.random() * 12
        ) + 7;

        if (value >= 100) {
            value = 100;
        }

        if (progress) {
            progress.style.width =
                `${value}%`;
        }

        if (value >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                splash.classList.add("hide");

                app.classList.remove("hidden");

            }, 350);
        }

    }, 110);
}


/* ======================================================
   COMPTEUR DU PROMPT
====================================================== */

function initializePromptCounter() {

    const textarea = $("#imagePrompt");
    const counter = $("#promptCounter");

    if (!textarea || !counter) return;

    const update = () => {

        counter.textContent =
            `${textarea.value.length} / 2000`;
    };

    textarea.addEventListener(
        "input",
        update
    );

    update();
}


/* ======================================================
   GÉNÉRATION D'IMAGE
====================================================== */

async function generateImage() {

    const textarea = $("#imagePrompt");

    if (!textarea) return;

    const prompt =
        textarea.value.trim();

    if (!prompt) {

        showToast(
            "Décris d'abord l'image que tu veux créer.",
            "ri-edit-line"
        );

        textarea.focus();

        return;
    }


    const button =
        $("#generateImageButton");

    if (!button) return;


    const originalHTML =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML = `
        <i class="ri-loader-4-line"></i>
        Génération...
    `;


    /*
    ------------------------------------------------------
    IMPORTANT

    Ici nous préparons seulement le frontend.

    L'API réelle sera connectée plus tard dans :
        /api/images

    On ne met aucune clé API dans app.js.
    ------------------------------------------------------
    */


    try {

        /*
        Exemple futur :

        const response = await fetch(
            "/api/images/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    prompt
                })
            }
        );

        const data = await response.json();
        */

        await wait(900);


        showToast(
            "Génération prête.",
            "ri-sparkling-2-line"
        );

    } catch (error) {

        console.error(
            "Image generation error:",
            error
        );

        showToast(
            "Une erreur est survenue.",
            "ri-error-warning-line"
        );

    } finally {

        button.disabled = false;

        button.innerHTML =
            originalHTML;
    }
}


/* ======================================================
   ATTENTE
====================================================== */

function wait(milliseconds) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            milliseconds
        )
    );
}


/* ======================================================
   NOUVEAU PROJET
====================================================== */

function createProject() {

    const name =
        window.prompt(
            "Nom du projet :"
        );

    if (!name) return;


    const cleanName =
        name.trim();

    if (!cleanName) return;


    const project = {

        id:
            Date.now(),

        name:
            cleanName,

        language:
            "HTML",

        createdAt:
            new Date().toISOString(),

        files: [

            {
                name: "index.html",

                content:
                    "<!DOCTYPE html>\n<html>\n<head>\n<title>Mon projet</title>\n</head>\n<body>\n<h1>Bonjour Alicia</h1>\n</body>\n</html>"
            }

        ]
    };


    state.projects.unshift(project);

    saveLocalState();

    renderProjects();

    showPage("projectsPage");

    showToast(
        "Projet créé.",
        "ri-checkbox-circle-line"
    );
}


/* ======================================================
   PROJETS
====================================================== */

function renderProjects() {

    renderProjectList(
        $("#projectsList")
    );

    renderProjectList(
        $("#allProjects")
    );

    renderRecentProjects();
}


function renderProjectList(container) {

    if (!container) return;


    container.innerHTML = "";


    if (state.projects.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="ri-code-box-line"></i>
                </div>

                <p>Aucun projet</p>

                <span>
                    Crée ton premier projet.
                </span>
            </div>
        `;

        return;
    }


    state.projects.forEach(project => {

        const element =
            document.createElement("button");

        element.className =
            "settings-item project-item";

        element.innerHTML = `

            <span class="settings-icon">
                <i class="ri-code-box-line"></i>
            </span>

            <span class="settings-text">

                <strong>
                    ${escapeHTML(project.name)}
                </strong>

                <small>
                    ${escapeHTML(project.language)}
                </small>

            </span>

            <i class="ri-arrow-right-s-line"></i>
        `;


        element.addEventListener(
            "click",
            () => openProject(project.id)
        );


        container.appendChild(element);
    });
}


/* ======================================================
   PROJETS RÉCENTS
====================================================== */

function renderRecentProjects() {

    const container =
        $("#recentProjects");

    if (!container) return;


    container.innerHTML = "";


    if (state.projects.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="ri-folder-open-line"></i>
                </div>

                <p>
                    Aucun projet pour le moment.
                </p>

                <span>
                    Commence ton premier projet.
                </span>

            </div>
        `;

        return;
    }


    state.projects
        .slice(0, 3)
        .forEach(project => {

            const element =
                document.createElement("button");

            element.className =
                "settings-item";

            element.innerHTML = `

                <span class="settings-icon">
                    <i class="ri-code-s-slash-line"></i>
                </span>

                <span class="settings-text">

                    <strong>
                        ${escapeHTML(project.name)}
                    </strong>

                    <small>
                        ${escapeHTML(project.language)}
                    </small>

                </span>

                <i class="ri-arrow-right-s-line"></i>
            `;


            element.addEventListener(
                "click",
                () => openProject(project.id)
            );


            container.appendChild(element);
        });
}


/* ======================================================
   OUVRIR PROJET
====================================================== */

function openProject(projectId) {

    const project =
        state.projects.find(
            item => item.id === projectId
        );

    if (!project) return;


    showToast(
        `Projet « ${project.name} » sélectionné.`,
        "ri-code-box-line"
    );

    /*
    L'éditeur de code complet sera ajouté
    dans la prochaine partie du projet.
    */
}


/* ======================================================
   GALERIE
====================================================== */

function renderGallery() {

    const preview =
        $("#imageGalleryPreview");

    const full =
        $("#fullGallery");


    renderGalleryContainer(
        preview,
        4
    );

    renderGalleryContainer(
        full,
        null
    );
}


function renderGalleryContainer(
    container,
    limit
) {

    if (!container) return;


    container.innerHTML = "";


    if (state.images.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="ri-image-line"></i>
                </div>

                <p>
                    Aucune image
                </p>

                <span>
                    Tes créations apparaîtront ici.
                </span>

            </div>
        `;

        return;
    }


    const images =
        limit
            ? state.images.slice(0, limit)
            : state.images;


    images.forEach(image => {

        if (!image.url) return;


        const img =
            document.createElement("img");

        img.className =
            "gallery-image";

        img.src =
            image.url;

        img.alt =
            image.prompt || "Image générée";

        img.loading =
            "lazy";


        container.appendChild(img);
    });
}


/* ======================================================
   ÉCHAPPEMENT HTML
====================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ======================================================
   NOTIFICATION TELEGRAM
====================================================== */

function initializeTelegramButtons() {

    const notificationButton =
        $("#notificationButton");

    if (!notificationButton) return;


    notificationButton.addEventListener(
        "click",
        () => {

            if (tg) {

                try {

                    tg.HapticFeedback?.impactOccurred(
                        "light"
                    );

                } catch (error) {
                    console.warn(error);
                }
            }


            showToast(
                "Aucune nouvelle notification.",
                "ri-notification-3-line"
            );
        }
    );
}


/* ======================================================
   HAPTIC FEEDBACK
====================================================== */

function initializeHaptics() {

    if (!tg?.HapticFeedback) {
        return;
    }


    $$("button").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                try {

                    tg.HapticFeedback.impactOccurred(
                        "light"
                    );

                } catch (error) {
                    // Rien à faire si Telegram
                    // ne supporte pas le retour haptique.
                }
            },
            {
                passive: true
            }
        );
    });
}


/* ======================================================
   BOUTON NOUVEAU PROJET
====================================================== */

function initializeProjectButton() {

    const button =
        $("#newProjectButton");

    if (!button) return;

    button.addEventListener(
        "click",
        createProject
    );
}


/* ======================================================
   BOUTON GÉNÉRATION
====================================================== */

function initializeImageGenerator() {

    const button =
        $("#generateImageButton");

    if (!button) return;

    button.addEventListener(
        "click",
        generateImage
    );
}


/* ======================================================
   BOUTON ÉTOILES
====================================================== */

function initializeStarsButton() {

    const button =
        $("#starsButton");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            showPage("starsPage");

        }
    );
}


/* ======================================================
   PARAMÈTRES
====================================================== */

function initializeSettings() {

    const settingsPage =
        $("#settingsPage");

    if (!settingsPage) return;


    const settingsButtons =
        settingsPage.querySelectorAll(
            ".settings-item"
        );


    settingsButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                () => {

                    const messages = [

                        "La personnalisation sera disponible bientôt.",

                        "Le changement de langue sera disponible bientôt.",

                        "Le centre d'aide sera disponible bientôt.",

                        "Alicia Studio — propulsé par NEXA."
                    ];


                    showToast(
                        messages[index] ||
                        "Cette option sera bientôt disponible.",
                        "ri-settings-3-line"
                    );
                }
            );
        }
    );
}


/* ======================================================
   INITIALISATION
====================================================== */

function initializeApp() {

    loadLocalState();

    loadTelegramUser();

    initializeNavigation();

    initializePromptCounter();

    initializeProjectButton();

    initializeImageGenerator();

    initializeStarsButton();

    initializeTelegramButtons();

    initializeSettings();

    renderProjects();

    renderGallery();

    updateStarsUI();

    showPage("homePage");

    startSplashScreen();

    setTimeout(() => {
        initializeHaptics();
    }, 500);
}


/* ======================================================
   LANCEMENT
====================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();
}
/* ======================================================
   ALICIA — TOUCH / DRAWING EFFECTS
====================================================== */
function addTouchEffects(){
    const selectors=[".icon-button",".quick-button",".tool-card",".settings-item",".small-action",".primary-button",".generate-button",".nav-item",".nav-main-button"];
    document.addEventListener("pointerdown",(event)=>{
        const target=event.target.closest(selectors.join(","));
        if(!target)return;
        target.classList.remove("alicia-pressed");
        requestAnimationFrame(()=>target.classList.add("alicia-pressed"));
        window.setTimeout(()=>target.classList.remove("alicia-pressed"),260);
    },{passive:true});
}
document.addEventListener("DOMContentLoaded",addTouchEffects);


/* ============================================================
   ALICIA MINI APPS — BACKEND INTEGRATION
   Backend: https://aliciaminipps.onrender.com
   ============================================================ */
(() => {
  const ALICIA_BACKEND_URL = "https://aliciaminipps.onrender.com".replace(/\/+$/, "");
  const ALICIA_API = `${ALICIA_BACKEND_URL}`;

  function aliciaTelegramUser() {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return u ? {
      telegram_id: Number(u.id),
      first_name: u.first_name || "",
      username: u.username || ""
    } : null;
  }

  async function aliciaApi(path, options = {}) {
    const response = await fetch(`${ALICIA_API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      throw new Error(data.detail || `Erreur API (${response.status})`);
    }
    return data;
  }

  async function syncAliciaUser() {
    const user = aliciaTelegramUser();
    if (!user) return null;
    const data = await aliciaApi("/users", {
      method: "POST",
      body: JSON.stringify(user)
    });
    window.AliciaBackendUser = data;
    window.AliciaCredits = Number(data.credits || 0);
    updateAliciaCreditDisplays(window.AliciaCredits);
    return data;
  }

  function updateAliciaCreditDisplays(credits) {
    const starsPage = document.getElementById("starsPageBalance");
    if (starsPage) starsPage.textContent = Number(credits || 0).toLocaleString("fr-FR");
    const ids = ["creditsBalance", "aliciaCredits", "profileCredits", "homeCredits"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = Number(credits || 0).toLocaleString("fr-FR");
    });
    document.querySelectorAll("[data-alicia-credits]").forEach(el => {
      el.textContent = Number(credits || 0).toLocaleString("fr-FR");
    });
  }

  async function refreshAliciaCredits() {
    const user = aliciaTelegramUser();
    if (!user) return null;
    const data = await aliciaApi(`/users/${encodeURIComponent(user.telegram_id)}`);
    window.AliciaCredits = Number(data.credits || 0);
    updateAliciaCreditDisplays(window.AliciaCredits);
    return data;
  }

  async function createAliciaPayment(stars) {
    const user = aliciaTelegramUser();
    if (!user) throw new Error("Ouvre Alicia Mini Apps depuis Telegram.");
    if (!Number.isInteger(Number(stars)) || Number(stars) <= 0) {
      throw new Error("Nombre de Stars invalide.");
    }
    return aliciaApi("/payments/create", {
      method: "POST",
      body: JSON.stringify({
        telegram_id: Number(user.telegram_id),
        stars: Number(stars)
      })
    });
  }

  async function getAliciaPayment(paymentId) {
    const user = aliciaTelegramUser();
    if (!user) throw new Error("Utilisateur Telegram introuvable.");
    return aliciaApi(
      `/payments/${encodeURIComponent(paymentId)}?telegram_id=${encodeURIComponent(user.telegram_id)}`
    );
  }

  async function waitForAliciaPayment(paymentId, attempts = 20, delay = 2500) {
    for (let i = 0; i < attempts; i++) {
      const payment = await getAliciaPayment(paymentId);
      if (payment.status === "validated") {
        await refreshAliciaCredits();
        return payment;
      }
      if (payment.status === "paid") return payment;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return getAliciaPayment(paymentId);
  }

  // Public helpers for the existing UI or future subscription buttons.
  window.AliciaBackend = {
    url: ALICIA_BACKEND_URL,
    api: aliciaApi,
    user: aliciaTelegramUser,
    syncUser: syncAliciaUser,
    refreshCredits: refreshAliciaCredits,
    createPayment: createAliciaPayment,
    getPayment: getAliciaPayment,
    waitForPayment: waitForAliciaPayment
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await syncAliciaUser();
    } catch (error) {
      console.warn("[Alicia Backend]", error.message);
    }
  });
})();


// Image fallback for Telegram users without an accessible profile photo.
document.addEventListener("DOMContentLoaded", () => {
  [document.getElementById("userPhoto"), document.getElementById("profilePhoto")].forEach(img => {
    if (!img) return;
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "1";
        img.src = "assets/nexa-logo.png";
      }
    });
  });
});


/* ============================================================
   ALICIA MINI APPS — ADMIN ACCESS
   Five taps on the displayed app version opens the admin panel.
   Backend remains the authority for admin permissions.
   ============================================================ */
(() => {
  const VERSION_SELECTORS = [
    "#appVersion", "#version", ".app-version", ".version",
    "[data-version]", ".settings-version", "#settingsVersion"
  ];

  let taps = 0;
  let resetTimer = null;

  function findVersionElements() {
    const found = [];
    VERSION_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => found.push(el));
    });
    // Fallback: elements whose visible text looks like a version.
    document.querySelectorAll("body *").forEach(el => {
      if (el.children.length === 0 && /^v?\d+(?:\.\d+){1,3}$/i.test((el.textContent || "").trim())) {
        found.push(el);
      }
    });
    return [...new Set(found)];
  }

  function openAdminPanel() {
    const panel = document.getElementById("adminAccessPanel");
    if (!panel) return;
    panel.hidden = false;
    const input = document.getElementById("adminUserIdInput");
    if (input) input.focus();
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    }
  }

  function closeAdminPanel() {
    const panel = document.getElementById("adminAccessPanel");
    if (panel) panel.hidden = true;
  }

  function fiveTapHandler() {
    taps++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { taps = 0; }, 1500);
    if (taps >= 5) {
      taps = 0;
      openAdminPanel();
    }
  }

  function loadAdminPayments() {
    const list = document.getElementById("adminPaymentsList");
    const idInput = document.getElementById("adminUserIdInput");
    if (!list || !idInput) return;
    const adminId = Number(idInput.value);
    if (!adminId) {
      list.innerHTML = "<div>Entre ton ID Telegram administrateur.</div>";
      return;
    }
    list.innerHTML = "Chargement des paiements…";
    fetch(`${window.AliciaBackend?.url || "https://aliciaminipps.onrender.com"}/admin/payments?admin_user_id=${encodeURIComponent(adminId)}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || "Accès refusé");
        return data;
      })
      .then(rows => {
        if (!rows.length) {
          list.innerHTML = "<div>Aucun paiement enregistré.</div>";
          return;
        }
        list.innerHTML = rows.map(p => {
          const pending = p.status === "paid";
          return `
            <div class="alicia-admin-payment">
              <b>Paiement #${p.id}</b>
              <div>Utilisateur : ${p.telegram_id}</div>
              <div>Stars : ${p.stars}</div>
              <div>Statut : ${p.status}</div>
              ${pending ? `
                <input type="number" min="0" placeholder="Crédits à ajouter" data-credit-for="${p.id}">
                <button type="button" data-validate-payment="${p.id}">Valider et ajouter les crédits</button>
              ` : ""}
            </div>`;
        }).join("");

        list.querySelectorAll("[data-validate-payment]").forEach(btn => {
          btn.addEventListener("click", async () => {
            const paymentId = Number(btn.dataset.validatePayment);
            const input = list.querySelector(`[data-credit-for="${paymentId}"]`);
            const credits = Number(input?.value || 0);
            const adminUserId = Number(idInput.value);
            if (!credits) return alert("Indique le nombre de crédits à ajouter.");
            btn.disabled = true;
            try {
              const r = await fetch(`${window.AliciaBackend?.url || "https://aliciaminipps.onrender.com"}/admin/payments/${paymentId}/validate`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({admin_user_id: adminUserId, credits})
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.detail || "Validation impossible");
              alert(`Paiement validé. ${data.credits_added} crédits ajoutés.`);
              loadAdminPayments();
            } catch (e) {
              alert(e.message);
              btn.disabled = false;
            }
          });
        });
      })
      .catch(e => { list.innerHTML = `<div>Erreur : ${e.message}</div>`; });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      findVersionElements().forEach(el => {
        el.addEventListener("click", fiveTapHandler);
        el.style.cursor = "pointer";
        el.title = "Appuyer 5 fois pour l'accès admin";
      });
    }, 300);

    document.getElementById("adminCloseBtn")?.addEventListener("click", closeAdminPanel);
    document.getElementById("adminOpenBtn")?.addEventListener("click", loadAdminPayments);
    document.getElementById("adminAccessPanel")?.addEventListener("click", e => {
      if (e.target.id === "adminAccessPanel") closeAdminPanel();
    });
  });
})();


/* ============================================================
   ALICIA MINI APPS — TELEGRAM PROFILE + STARS
   ============================================================ */
(() => {
  const tg = window.Telegram?.WebApp;
  const backend = () => window.AliciaBackend?.url || "https://aliciaminipps.onrender.com";

  function telegramUser() {
    const u = tg?.initDataUnsafe?.user;
    return u ? {
      id: Number(u.id),
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      username: u.username || "",
      photo_url: u.photo_url || ""
    } : null;
  }

  function setAvatar() {
    const u = telegramUser();
    if (!u) return;
    document.querySelectorAll(
      'img[data-telegram-avatar], #profileAvatar, #userAvatar, #userPhoto, #profilePhoto, .profile-avatar img, .avatar img, .large-profile-photo img'
    ).forEach(img => {
      if (u.photo_url) {
        img.src = u.photo_url;
        img.alt = u.first_name || "Profil";
        img.referrerPolicy = "no-referrer";
      }
    });
    document.querySelectorAll("[data-telegram-name]").forEach(el => {
      el.textContent = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || "Utilisateur";
    });
  }

  function setupAdminAutoId() {
    const input = document.getElementById("adminUserIdInput");
    if (input) {
      const u = telegramUser();
      if (u) {
        input.value = String(u.id);
        input.readOnly = true;
      }
    }
  }

  async function startStarsPayment(stars) {
    const status = document.getElementById("aliciaStarsPaymentStatus");
    const u = telegramUser();
    if (!u) throw new Error("Ouvre Alicia Mini Apps depuis Telegram.");

    if (status) status.textContent = "Préparation du paiement…";

    // The backend must return invoice_url from a Telegram Stars invoice.
    const result = await window.AliciaBackend.createPayment(stars);

    if (!result.invoice_url) {
      if (status) status.textContent =
        "Le paiement est prêt côté compte, mais la facture Telegram Stars n'est pas encore reliée au bot.";
      throw new Error("invoice_url manquant côté backend.");
    }

    if (!tg?.openInvoice) {
      window.open(result.invoice_url, "_blank");
      return result;
    }

    if (status) status.textContent = "Ouverture du paiement Telegram…";

    tg.openInvoice(result.invoice_url, async (paymentStatus) => {
      if (paymentStatus === "paid") {
        if (status) status.textContent = "Paiement reçu. Validation des crédits en cours…";
        try {
          await window.AliciaBackend.waitForPayment(result.payment_id, 30, 2000);
          if (status) status.textContent = "Paiement reçu. Les crédits seront ajoutés après validation.";
          try { await window.AliciaBackend.refreshCredits(); } catch (_) {}
        } catch (e) {
          if (status) status.textContent = "Paiement reçu. Actualise ton compte dans quelques instants.";
        }
      } else if (paymentStatus === "cancelled") {
        if (status) status.textContent = "Paiement annulé.";
      } else if (paymentStatus === "failed") {
        if (status) status.textContent = "Paiement échoué.";
      }
    });

    return result;
  }

  function setupStarsButtons() {
    document.querySelectorAll("[data-stars-plan]").forEach(btn => {
      if (btn.dataset.aliciaStarsBound) return;
      btn.dataset.aliciaStarsBound = "1";
      btn.addEventListener("click", async () => {
        const stars = Number(btn.dataset.starsPlan);
        try {
          await startStarsPayment(stars);
        } catch (e) {
          const status = document.getElementById("aliciaStarsPaymentStatus");
          if (status) status.textContent = e.message;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      setAvatar();
      setupAdminAutoId();
      setupStarsButtons();
    }, 400);
  });

  window.AliciaTelegramProfile = { get: telegramUser, refreshPhoto: setAvatar };
  window.AliciaStars = { pay: startStarsPayment };
})();
