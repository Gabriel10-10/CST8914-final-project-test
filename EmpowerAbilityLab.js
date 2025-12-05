// EmpowerAbilityLab.js

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
   * TABS BEHAVIOR (HOME / SERVICES / SCHEDULE)
   * ========================================= */
  const tabs = Array.from(document.querySelectorAll(".tab-button"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  // Take "tab-home" and return "home"
  function getRouteFromTab(tab) {
    const id = tab.id || "";
    if (id.startsWith("tab-")) {
      return id.slice(4);
    }
    return id;
  }

  // Find the tab that matches a route like "home" or "services"
  function getTabFromRoute(route) {
    if (!route) {
      return tabs[0] || null;
    }
    return tabs.find((t) => t.id === `tab-${route}`) || tabs[0] || null;
  }

  // Turn this tab on and hide the others
  function setActiveTab(tab, options = {}) {
    if (!tab) return;

    const { focusTab = true } = options;
    const targetId = tab.getAttribute("aria-controls");

    // Update tabs
    tabs.forEach((t) => {
      const isActive = t === tab;
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.tabIndex = isActive ? 0 : -1;
    });

    // Update panels
    panels.forEach((panel) => {
      panel.hidden = panel.id !== targetId;
    });

    // Update document title based on data-title
    const newTitle = tab.dataset.title;
    if (newTitle) {
      document.title = newTitle;
    }

    if (focusTab) {
      tab.focus();
    }
  }

  // Change the hash so Back/Forward knows about this tab
  function goToTab(tab) {
    if (!tab) return;

    const route = getRouteFromTab(tab);
    if (!route) {
      // If for some reason there is no route, just switch visually
      setActiveTab(tab, { focusTab: true });
      return;
    }

    const newHash = `#${route}`;

    if (window.location.hash === newHash) {
      // Hash is already set, so just update the UI
      setActiveTab(tab, { focusTab: true });
    } else {
      // Changing the hash will trigger the hashchange event
      window.location.hash = route;
    }
  }

  // When the hash changes (click or Back/Forward), sync the UI
  function handleHashChange() {
    const route = window.location.hash.replace("#", "");
    const tabFromHash = getTabFromRoute(route);
    setActiveTab(tabFromHash, { focusTab: true });
  }

  // Small helper so the inline onclick="activateTab()" in the HTML stays safe
  window.activateTab = function () {
    const defaultTab =
      tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
    if (defaultTab) {
      goToTab(defaultTab);
    }
  };

  // Mouse / keyboard click on a tab button
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      goToTab(tab);
    });

    // Keyboard navigation for tabs (ARROW LEFT/RIGHT, HOME, END)
    tab.addEventListener("keydown", (event) => {
      const { key } = event;
      const currentIndex = tabs.indexOf(tab);

      if (key === "ArrowRight") {
        event.preventDefault();
        const nextTab = tabs[(currentIndex + 1) % tabs.length];
        // Here we only move focus; pressing Space/Enter will "click" the tab
        nextTab.focus();
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        prevTab.focus();
      } else if (key === "Home") {
        event.preventDefault();
        if (tabs[0]) {
          goToTab(tabs[0]);
        }
      } else if (key === "End") {
        event.preventDefault();
        const lastTab = tabs[tabs.length - 1];
        if (lastTab) {
          goToTab(lastTab);
        }
      }
    });
  });

  // Listen for browser Back/Forward
  window.addEventListener("hashchange", handleHashChange);

  // On first load, use the hash if present; otherwise keep the default tab
  if (window.location.hash && window.location.hash !== "#") {
    handleHashChange();
  } else {
    const defaultTab =
      tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
    setActiveTab(defaultTab, { focusTab: false });
  }

  /* ==========================
   * MODAL (DIALOG) BEHAVIOR
   * ========================== */
  const modal = document.getElementById("modal");
  const openModalButton = document.getElementById("open-modal-button");
  const closeModalButton = document.getElementById("close-modal-button");
  let lastFocusedElement = null;

  function handleModalKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  function openModal() {
    if (!modal || !closeModalButton) return;

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.addEventListener("keydown", handleModalKeydown);
    
    //Prevent background scrolling
    document.body.classList.add('modal-open');

    //Move focus to close button
    closeModalButton.focus();
  }

  function closeModal() {
    if (!modal) return;

    modal.hidden = true;
    document.removeEventListener("keydown", handleModalKeydown);

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    
    //Restore background scrolling
    document.body.classList.remove('modal-open');
  }

  // Focus trap until closed
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (openModalButton && closeModalButton && modal) {
    openModalButton.addEventListener("click", openModal);
    closeModalButton.addEventListener("click", closeModal);

    // Close when clicking on the dark backdrop
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
  /* ==========================
   * FORM + SWITCH BEHAVIOR
   * ========================== */
  const scheduleForm = document.querySelector(".schedule-form");

  if (scheduleForm) {
    // 1) Keep the form from doing a full page reload
    scheduleForm.addEventListener("submit", (event) => {
      event.preventDefault();

      showAlert(
        "Your request has been submitted successfully! We will contact you soon.",
        "success"
      );

      // reset form after success
      scheduleForm.reset();

      // hide conditional textarea since it's tied to a checkbox
      if (typeof updateEventStoryVisibility === "function") {
        updateEventStoryVisibility();
      }
    });

    // 2) Prevent Enter on normal checkboxes from submitting the form
    scheduleForm.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;

      const target = event.target;

      // Normal checkboxes (NOT the switch)
      if (
        target.matches('input[type="checkbox"]') &&
        !target.matches('[role="switch"]')
      ) {
        // We don't toggle them on Enter; Space is the correct key.
        event.preventDefault(); // stop accidental submit
      }
    });
  }

  // 3) Make Enter toggle the switch (role="switch"), like APG example
  const switchInput = document.querySelector('input[role="switch"]');

  if (switchInput) {
    switchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // don't submit the form
        switchInput.click(); // let the browser toggle checked state
      }
      // Space is already handled natively by the checkbox.
    });
  }

  /* ==========================
   * CONDITIONAL EVENT STORY FIELD + LIVE REGION
   * ========================== */
  const speakerCheckbox = document.getElementById("speaker");
  const eventStoryRow = document.getElementById("event-story-row");
  const speakerStatus = document.getElementById("speaker-status");

  if (speakerCheckbox && eventStoryRow) {
    function updateEventStoryVisibility() {
      const show = speakerCheckbox.checked;

      // Show / hide the conditional block
      eventStoryRow.hidden = !show;
      speakerCheckbox.setAttribute("aria-expanded", show ? "true" : "false");

      // Update live region so screen readers announce the change
      if (speakerStatus) {
        speakerStatus.textContent = show
          ? 'Additional question available: "Tell us about your event".'
          : "";
      }
    }

    // Initial state (in case browser restores checkbox)
    updateEventStoryVisibility();

    // Toggle visibility and announcement on change
    speakerCheckbox.addEventListener("change", updateEventStoryVisibility);
  }

  /* ==========================
   * SUCCESS ALERT ON SUBMIT
   * ========================== */
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  function showAlert(message, type = "success") {
    if (!alertPlaceholder) return;

    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <div>${message}</div>
        <button type="button" class="btn-close" aria-label="Close"></button>
      </div>
    `;

    // Clear any previous alert
    alertPlaceholder.innerHTML = "";
    alertPlaceholder.append(wrapper);

    const alertDiv = wrapper.querySelector(".alert");
    const closeBtn = wrapper.querySelector(".btn-close");

    // Manually dismiss the alert when the close button is clicked
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        wrapper.remove();
      });
    }

    // Optional: move focus to the alert for SR users
    if (alertDiv) {
      alertDiv.setAttribute("tabindex", "-1");
      alertDiv.focus();
    }
  }
});
