document.addEventListener("DOMContentLoaded", () => {
    const modalAnimationDuration = 300;

    // --- Modal Handling ---

    function animateModal(dialog, direction, onFinishCallback) {
        const modalBody = dialog.querySelector("section");
        const isOpening = direction === "open";
        const opacityKeyframes = [{ opacity: isOpening ? "0" : "1" }, { opacity: isOpening ? "1" : "0" }];
        const transformKeyframes = [{ transform: `translateY(${isOpening ? "-3rem" : "0"})` }, { transform: `translateY(${isOpening ? "0" : "-3rem"})` }];

        const animation = new Animation(
            new KeyframeEffect(dialog, opacityKeyframes, {
                duration: modalAnimationDuration,
                easing: "ease",
            }),
            document.timeline
        );

        const animation1 = new Animation(
            new KeyframeEffect(modalBody, transformKeyframes, {
                duration: modalAnimationDuration,
                easing: "ease",
            }),
            document.timeline
        );

        animation.play();
        animation1.play();

        if (!isOpening) {
            animation.onfinish = () => {
                dialog.close();
                if (onFinishCallback) {
                    onFinishCallback();
                }
            };
        }
    }

    function openModal(modal) {
        modal.setAttribute("open", "open");
        animateModal(modal, "open");
    }

    function closeModal(modal, callback) {
        animateModal(modal, "close", callback);
    }

    document.addEventListener("click", (event) => {
        const { target } = event;
        const openTrigger = target.closest("[data-target]");
        const closeTrigger = target.closest("[data-close]");
        const currentlyOpenModal = document.querySelector("dialog[open]");

        // --- Handle Modal Opening ---
        if (openTrigger) {
            const modalId = openTrigger.getAttribute("data-target");
            const modalToOpen = document.getElementById(modalId);

            if (modalToOpen) {
                if (currentlyOpenModal && currentlyOpenModal !== modalToOpen) {
                    // A different modal is open; close it, then open the new one.
                    closeModal(currentlyOpenModal, () => openModal(modalToOpen));
                } else if (!currentlyOpenModal) {
                    // No modal is open; just open it.
                    openModal(modalToOpen);
                }
                // If the targeted modal is already the one that's open, do nothing.
            }
            return; // An open action was attempted, so we are done.
        }

        // --- Handle Modal Closing ---
        // This logic runs only if the click was not on an openTrigger.
        if (currentlyOpenModal) {
            const isBackgroundClick = target.matches("dialog[open]");
            const isLocked = currentlyOpenModal.hasAttribute("data-locked");

            if (closeTrigger || (isBackgroundClick && !isLocked)) {
                closeModal(currentlyOpenModal);
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const openModalElement = document.querySelector("dialog[open]");
            if (openModalElement && !openModalElement.hasAttribute("data-locked")) {
                closeModal(openModalElement);
            }
        }
    });

    // --- Dropdown Handling ---

    document.addEventListener("click", (event) => {
        const isClickInsideDropdown = event.target.closest("details.dropdown[open]");
        if (!isClickInsideDropdown) {
            document.querySelectorAll("details.dropdown[open]").forEach((dropdown) => {
                dropdown.removeAttribute("open");
            });
        }
    });

    // --- Navbar Handling ---

    const navButton = document.querySelector("header nav > button[role='menu']");
    const navList = document.querySelector("header nav > ul");
    const navCloseButton = document.querySelector("header nav ul button[aria-label='close']");

    function toggleNavbar() {
        if (navList) {
            const isVisible = navList.style.display === "flex";
            navList.style.display = isVisible ? "none" : "flex";
        }
    }

    if (navButton) {
        navButton.addEventListener("click", toggleNavbar);
    }

    if (navCloseButton) {
        navCloseButton.addEventListener("click", toggleNavbar);
    }

    const tabsComponents = document.querySelectorAll("article.tabs");

    tabsComponents.forEach((component) => {
        const tabsList = component.querySelector('[role="tablist"]');
        const tabs = tabsList.querySelectorAll('[role="tab"]');
        const tabPanelsContainer = component.querySelector(".tabs-content");
        const tabPanels = tabPanelsContainer.querySelectorAll('[role="tabpanel"]');

        function hideAllTabsAndPanels() {
            tabs.forEach((tab) => tab.setAttribute("aria-selected", "false"));
            tabPanels.forEach((panel) => panel.setAttribute("hidden", ""));
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                hideAllTabsAndPanels();
                tab.setAttribute("aria-selected", "true");
                tabPanels[index].removeAttribute("hidden");
            });

            tab.addEventListener("keydown", (event) => {
                const currentIndex = Array.from(tabs).indexOf(event.currentTarget);
                let nextIndex = currentIndex;

                switch (event.key) {
                    case "ArrowRight":
                        nextIndex = (currentIndex + 1) % tabs.length;
                        break;
                    case "ArrowLeft":
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                        break;
                    case "Home":
                        nextIndex = 0;
                        break;
                    case "End":
                        nextIndex = tabs.length - 1;
                        break;
                    default:
                        return;
                }

                event.preventDefault();
                tabs[nextIndex].click();
                tabs[nextIndex].focus();
            });
        });
    });
});