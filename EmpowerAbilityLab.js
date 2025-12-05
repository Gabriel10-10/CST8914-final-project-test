// EmpowerAbilityLab.js

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
   * TABS BEHAVIOR (HOME / SERVICES / SCHEDULE)
   * ========================================= */
  const tabs = Array.from(document.querySelectorAll(".tab-button"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));

  function activateTab(tab) {
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
      //document.title = newTitle;
    }
    document.title = newTitle;
    tab.focus();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab);
    });

    // Keyboard navigation for tabs (ARROW LEFT/RIGHT, HOME, END)
    tab.addEventListener("keydown", (event) => {
      const { key } = event;
      const currentIndex = tabs.indexOf(tab);

      if (key === "ArrowRight") {
        event.preventDefault();
        const nextTab = tabs[(currentIndex + 1) % tabs.length];
        nextTab.focus();
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        prevTab.focus();
      } else if (key === "Home") {
        event.preventDefault();
        activateTab(tabs[0]);
      } else if (key === "End") {
        event.preventDefault();
        activateTab(tabs[tabs.length - 1]);
      }
    });
  });

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
    closeModalButton.focus();
  }

  function closeModal() {
    if (!modal) return;

    modal.hidden = true;
    document.removeEventListener("keydown", handleModalKeydown);

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

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
