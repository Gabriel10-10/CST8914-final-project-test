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
        activateTab(nextTab);
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        activateTab(prevTab);
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
});
