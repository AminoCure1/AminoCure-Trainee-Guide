/* =========================================
   AMINO CURE
   دليل التدريب الصيدلي في السودان
   Search • Filters • Mobile Navigation
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* 1. عناصر الصفحة */

  const searchInput = document.getElementById("searchInput");
  const stateFilter = document.getElementById("stateFilter");
  const areaFilter = document.getElementById("areaFilter");

  const searchButton = document.getElementById("searchButton");
  const resetSearch = document.getElementById("resetSearch");
  const emptyReset = document.getElementById("emptyReset");

  const resultsCount = document.getElementById("resultsCount");
  const pharmaciesList = document.getElementById("pharmaciesList");
  const emptyState = document.getElementById("emptyState");

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  const currentYear = document.getElementById("currentYear");


  /* 2. قراءة بيانات الصيدليات والولايات */

  function getPharmacyData() {
    if (
      typeof pharmacies !== "undefined" &&
      Array.isArray(pharmacies)
    ) {
      return pharmacies;
    }

    if (
      typeof window.pharmacies !== "undefined" &&
      Array.isArray(window.pharmacies)
    ) {
      return window.pharmacies;
    }

    return null;
  }

  function getStateData() {
    if (
      typeof sudanStates !== "undefined" &&
      Array.isArray(sudanStates)
    ) {
      return sudanStates;
    }

    if (
      typeof window.sudanStates !== "undefined" &&
      Array.isArray(window.sudanStates)
    ) {
      return window.sudanStates;
    }

    return null;
  }


  /* 3. أدوات مساعدة */

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ");
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[char];
    });
  }

  function isValidExternalUrl(value) {
    try {
      const url = new URL(value);

      return url.protocol === "https:" ||
             url.protocol === "http:";
    } catch {
      return false;
    }
  }

  function safeExternalLink(value, label, className) {
    if (!value || !isValidExternalUrl(value)) {
      return "";
    }

    return `
      <a
        class="${className || ""}"
        href="${escapeHTML(value)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${label}
      </a>
    `;
  }


  /* 4. تعبئة الولايات */

  function populateStates() {
    if (!stateFilter) return;

    const states = getStateData();

    if (!states) {
      console.error(
        "Amino Cure: تعذر تحميل قائمة الولايات من pharmacies.js"
      );
      return;
    }

    const previousValue = stateFilter.value;

    stateFilter.innerHTML =
      '<option value="">كل الولايات</option>';

    states.forEach(function (state) {
      const option = document.createElement("option");

      option.value = state;
      option.textContent = state;

      stateFilter.appendChild(option);
    });

    if (states.includes(previousValue)) {
      stateFilter.value = previousValue;
    }
  }


  /* 5. إنشاء بطاقة الصيدلية */

  function createPharmacyCard(pharmacy) {
    const card = document.createElement("article");

    card.className = "pharmacy-card";

    if (pharmacy.isDemo) {
      card.classList.add("is-demo");
    }

    const name = escapeHTML(pharmacy.name);
    const state = escapeHTML(pharmacy.state);
    const area = escapeHTML(pharmacy.area);
    const address = escapeHTML(pharmacy.address);
    const description = escapeHTML(pharmacy.description);

    const isDemo = pharmacy.isDemo === true;

    const locationText = [state, area]
      .filter(Boolean)
      .join(" — ");

    let badge = "";
    let contactActions = "";

    if (isDemo) {
      badge = `
        <span
          class="pharmacy-badge"
          style="color:#7654c8;background:#eee8ff"
        >
          بيانات تجريبية فقط
        </span>

        <span class="demo-label">
          ليست صيدلية تم التحقق منها
        </span>
      `;
    } else {
      badge = `
        <span class="pharmacy-badge">
          تستقبل استفسارات التدريب
        </span>
      `;

      const phone = String(pharmacy.phone || "").trim();

      let phoneAction = "";

      if (/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
        const telNumber = phone.replace(/[^\d+]/g, "");

        phoneAction = `
          <a
            class="btn btn-primary"
            href="tel:${escapeHTML(telNumber)}"
          >
            الاتصال بالصيدلية
          </a>
        `;
      }

      const mapsAction = safeExternalLink(
        pharmacy.mapsUrl,
        "عرض الموقع",
        "btn btn-secondary"
      );

      const facebookAction = safeExternalLink(
        pharmacy.facebookUrl,
        "فيسبوك",
        "btn btn-secondary"
      );

      const instagramAction = safeExternalLink(
        pharmacy.instagramUrl,
        "إنستغرام",
        "btn btn-secondary"
      );

      contactActions = `
        <div class="pharmacy-actions">
          ${phoneAction}
          ${mapsAction}
          ${facebookAction}
          ${instagramAction}
        </div>
      `;
    }

    let details = "";

    if (address) {
      details += `
        <div class="pharmacy-detail">
          <span class="pharmacy-detail-icon">📍</span>
          <span>${address}</span>
        </div>
      `;
    }

    if (!isDemo && pharmacy.lastVerified) {
      details += `
        <div class="pharmacy-detail">
          <span class="pharmacy-detail-icon">🗓️</span>
          <span>
            آخر تحقق من البيانات:
            ${escapeHTML(pharmacy.lastVerified)}
          </span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="pharmacy-card-top">
        <div class="pharmacy-icon" aria-hidden="true">💊</div>

        <div class="pharmacy-title-wrap">
          <h3 class="pharmacy-title">${name}</h3>

          <p class="pharmacy-location">
            ${locationText || "الموقع غير محدد"}
          </p>
        </div>
      </div>

      ${badge}

      <p class="pharmacy-description">
        ${description || "لا توجد تفاصيل إضافية."}
      </p>

      ${
        details
          ? `<div class="pharmacy-details">${details}</div>`
          : ""
      }

      ${contactActions}
    `;

    return card;
  }


  /* 6. البحث والتصفية */

  function getFilteredPharmacies() {
    const allPharmacies = getPharmacyData() || [];

    const query = normalizeText(
      searchInput ? searchInput.value : ""
    );

    const selectedState = stateFilter
      ? stateFilter.value
      : "";

    const selectedArea = normalizeText(
      areaFilter ? areaFilter.value : ""
    );

    return allPharmacies.filter(function (pharmacy) {
      const searchableText = normalizeText([
        pharmacy.name,
        pharmacy.state,
        pharmacy.area,
        pharmacy.address,
        pharmacy.description
      ].join(" "));

      const matchesQuery =
        !query || searchableText.includes(query);

      const matchesState =
        !selectedState || pharmacy.state === selectedState;

      const matchesArea =
        !selectedArea ||
        normalizeText(pharmacy.area).includes(selectedArea);

      return matchesQuery &&
             matchesState &&
             matchesArea;
    });
  }


  /* 7. عرض النتائج وإزالة التحميل */

  function renderPharmacies() {
    if (!pharmaciesList) return;

    const allPharmacies = getPharmacyData();

    /* إذا لم يتم تحميل ملف البيانات */

    if (!allPharmacies) {
      pharmaciesList.innerHTML = `
        <div class="loading-state">
          <span class="loading-icon" aria-hidden="true">⚠️</span>
          <p>تعذر تحميل بيانات الصيدليات. تحقق من ملف pharmacies.js.</p>
        </div>
      `;

      pharmaciesList.hidden = false;

      if (resultsCount) {
        resultsCount.textContent = "تعذر تحميل البيانات";
      }

      if (emptyState) {
        emptyState.hidden = true;
      }

      console.error(
        "Amino Cure: ملف pharmacies.js غير محمّل أو البيانات غير معرّفة."
      );

      return;
    }

    const filteredPharmacies = getFilteredPharmacies();

    pharmaciesList.innerHTML = "";

    filteredPharmacies.forEach(function (pharmacy) {
      pharmaciesList.appendChild(
        createPharmacyCard(pharmacy)
      );
    });

    const count = filteredPharmacies.length;

    if (resultsCount) {
      resultsCount.textContent =
        count === 1
          ? "تم العثور على نتيجة واحدة"
          : `عدد النتائج: ${count}`;
    }

    if (emptyState) {
      emptyState.hidden = count !== 0;
    }

    pharmaciesList.hidden = count === 0;
  }


  /* 8. إعادة ضبط البحث */

  function clearSearch() {
    if (searchInput) searchInput.value = "";
    if (stateFilter) stateFilter.value = "";
    if (areaFilter) areaFilter.value = "";

    renderPharmacies();

    if (searchInput) {
      searchInput.focus();
    }
  }


  /* 9. أحداث البحث */

  if (searchButton) {
    searchButton.addEventListener("click", renderPharmacies);
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderPharmacies);
  }

  if (stateFilter) {
    stateFilter.addEventListener("change", renderPharmacies);
  }

  if (areaFilter) {
    areaFilter.addEventListener("input", renderPharmacies);
  }

  if (resetSearch) {
    resetSearch.addEventListener("click", clearSearch);
  }

  if (emptyReset) {
    emptyReset.addEventListener("click", clearSearch);
  }


  /* 10. قائمة التنقل في الهاتف */

  function closeMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mainNav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", function () {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }


  /* 11. سنة حقوق النشر */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

/* =========================================
   12. الوضع الفاتح والداكن
========================================= */

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.documentElement.dataset.theme =
    isDark ? "dark" : "light";

  if (themeToggle) {
    themeToggle.textContent = isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
      "aria-label",
      isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
    );

    themeToggle.title =
      isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن";
  }
}

let savedTheme = "dark";

try {
  savedTheme = localStorage.getItem("aminoCureTheme") || "dark";
} catch (error) {
  savedTheme = "dark";
}

applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    const currentTheme =
      document.documentElement.dataset.theme || "light";

    const newTheme =
      currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);

    try {
      localStorage.setItem("aminoCureTheme", newTheme);
    } catch (error) {
      // سيعمل تبديل المظهر حتى إذا تعذر حفظ الاختيار.
    }
  });
}
  /* 12. تشغيل الموقع */

  populateStates();
  renderPharmacies();

});
/* =====================================
   AMINO CURE — BACK TO TOP FUNCTION
===================================== */

const backToTopButton = document.getElementById("backToTop");

if (backToTopButton) {
  // إظهار الزر بعد النزول في الصفحة
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  }, { passive: true });

  // الرجوع لأعلى الصفحة بسلاسة
  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
    }
