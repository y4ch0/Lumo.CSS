const modalAnimationDuration = 300;

function animateModal(dialog, direction, onFinish) {
    const body = dialog.querySelector("section");
    const opening = direction === "open";

    const opacity = new Animation(new KeyframeEffect(dialog, [{ opacity: opening ? 0 : 1 }, { opacity: opening ? 1 : 0 }], { duration: modalAnimationDuration, easing: "ease" }), document.timeline);

    const transform = new Animation(
        new KeyframeEffect(body, [{ transform: `translateY(${opening ? "-3rem" : "0"})` }, { transform: `translateY(${opening ? "0" : "-3rem"})` }], { duration: modalAnimationDuration, easing: "ease" }),
        document.timeline
    );

    opacity.play();
    transform.play();

    if (!opening) {
        opacity.onfinish = () => {
            dialog.close();
            onFinish?.();
        };
    }
}

function openModal(modal) {
    modal.setAttribute("open", "open");
    animateModal(modal, "open");
}

function closeModal(modal, cb) {
    animateModal(modal, "close", cb);
}

export function initLumo(root = document) {
    const onClick = (e) => {
        const target = e.target;
        const openTrigger = target.closest("[data-target]");
        const closeTrigger = target.closest("[data-close]");
        const openModalEl = root.querySelector("dialog[open]");

        if (openTrigger) {
            e.preventDefault();
            const modal = root.getElementById(openTrigger.dataset.target);
            if (!modal) return;

            if (openModalEl && openModalEl !== modal) {
                closeModal(openModalEl, () => openModal(modal));
            } else if (!openModalEl) {
                openModal(modal);
            }
            return;
        }

        if (openModalEl) {
            const locked = openModalEl.hasAttribute("data-locked");
            const backdrop = target === openModalEl;

            if (closeTrigger || (backdrop && !locked)) {
                closeModal(openModalEl);
            }
        }
    };

    const onKeydown = (e) => {
        if (e.key !== "Escape") return;
        const modal = root.querySelector("dialog[open]");
        if (modal && !modal.hasAttribute("data-locked")) {
            closeModal(modal);
        }
    };

    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKeydown);

    return () => {
        root.removeEventListener("click", onClick);
        root.removeEventListener("keydown", onKeydown);
    };
}
