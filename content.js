/**
 * Flowritext ChatGPT Prompts Organizer Add-on
 * 
 * Copyright (C) 2025 Flowritext
 * 
 * Licensed under the GNU Affero General Public License v3 or later.
 */

(function () {

    /**
     * Adds toggle buttons beside each chat history entry in the sidebar.
     * (Updated for ChatGPT.com 2025 UI)
     */
    function addToggleButtons() {
        const chatLinks = document.querySelectorAll(
            '.group\\/sidebar-expando-section #history > a.group.__menu-item.hoverable[href^="/c/"]'
        );

        chatLinks.forEach(anchor => {
            const hrefValue = anchor.getAttribute("href");
            const toggleButtonId = `toggle-${hrefValue.replace(/[^\w-]/g, "")}`;

            // Skip if already has button
            if (anchor.parentElement.querySelector(`#${toggleButtonId}`)) return;

            // Create toggle button
            const toggleButton = document.createElement("button");
            toggleButton.id = toggleButtonId;
            toggleButton.innerHTML = "▼";
            toggleButton.style.cssText = `
                cursor: pointer;
                background: #0d0d0d;
                color: #ececec;
                border: 1px solid #ececec;
                padding: 4px;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                transition: transform 0.3s ease, border 0.2s ease, box-shadow 0.2s ease;
            `;

            toggleButton.addEventListener("mouseenter", () => {
                toggleButton.style.border = "2px solid white";
                toggleButton.style.boxShadow = "0 0 8px white";
            });
            toggleButton.addEventListener("mouseleave", () => {
                toggleButton.style.border = "1px solid #ececec";
                toggleButton.style.boxShadow = "none";
            });

            toggleButton.addEventListener("click", (event) => {
                event.stopPropagation();
                updateHistory(hrefValue, anchor, toggleButton);
            });

            // Wrap button + link together
            const wrapper = document.createElement("div");
            wrapper.style.cssText = `
                display: flex;
                align-items: center;
                gap: 4px;
                padding-left: 8px;
            `;
            wrapper.appendChild(toggleButton);
            anchor.parentElement.insertBefore(wrapper, anchor);
            wrapper.appendChild(anchor);
        });
    }

    /**
     * Expands or collapses the chat preview under a sidebar item.
     */
    function updateHistory(id, anchor, toggleButton) {
        const charLimit = 28;

        // Close any open previews first
        document.querySelectorAll(".custom-collapsible-container").forEach(containerDiv => {
            containerDiv.style.maxHeight = "0px";
            containerDiv.style.opacity = "0";
            const previousToggle = containerDiv.previousElementSibling?.querySelector("button");
            if (previousToggle) previousToggle.style.transform = "rotate(0deg)";
            setTimeout(() => containerDiv.remove(), 300);
        });

        requestAnimationFrame(() => {
            setTimeout(() => {
                const articles = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
                const url = "/c/" + getLastSegment();

                if (id && id === url) {
                    let hasValidArticles = false;
                    let containerDiv = anchor.nextElementSibling;
                    const parentStyles = window.getComputedStyle(document.body);

                    // Toggle off if already open
                    if (containerDiv && containerDiv.classList.contains("custom-collapsible-container")) {
                        containerDiv.style.maxHeight = "0px";
                        containerDiv.style.opacity = "0";
                        toggleButton.style.transform = "rotate(0deg)";
                        setTimeout(() => containerDiv.remove(), 300);
                        return;
                    }

                    // Create collapsible container
                    containerDiv = document.createElement("div");
                    containerDiv.className = "custom-collapsible-container";
                    containerDiv.style.cssText = `
                        margin-top: 4px;
                        margin-left: 28px;
                        max-height: 0px;
                        width: 85%;
                        overflow: hidden;
                        opacity: 0;
                        transition: max-height 0.35s ease-out, opacity 0.35s ease-out, padding 0.3s ease-out;
                        padding-left: 5px;
                        border-left: 1px solid rgba(255,255,255,0.1);
                        border-radius: 6px;
                        background-color: ${parentStyles.backgroundColor};
                        color: ${parentStyles.color};
                    `;

                    // Inner scrollable area
                    const foundDiv = document.createElement("div");
                    foundDiv.style.cssText = `
                        margin-top: 5px;
                        
                        max-height: 200px;
                        overflow-y: auto;
                        padding: 4px 6px;
                        display: block;
                        scrollbar-width: thin;
                        scrollbar-color: #888 transparent;
                        background-color: ${parentStyles.backgroundColor};
                        color: ${parentStyles.color};
                        scroll-behavior: smooth;
                    `;

                    // Build chat text preview list
                    articles.forEach(article => {
                        const textElement = article.querySelector(".whitespace-pre-wrap");
                        if (textElement) {
                            hasValidArticles = true;
                            const fullText = textElement.textContent.trim();
                            const textPreview = fullText.substring(0, charLimit);

                            const link = document.createElement("a");
                            link.href = "#";
                            link.textContent = `• ${textPreview}...`;
                            link.title = fullText;
                            link.style.cssText = `
                                margin-left: 5px;
                                display: block;
                                margin-bottom: 5px;
                                color: rgb(207, 209, 211);
                                text-decoration: none;
                                font-style: italic;
                                font-size: 0.9rem;
                                opacity: 0;
                                transition: opacity 0.4s ease;
                            `;

                            link.addEventListener("click", (event) => {
                                event.preventDefault();
                                article.scrollIntoView({ behavior: "smooth", block: "start" });
                            });
                            link.addEventListener("mouseenter", () => link.style.color = "#fff");
                            link.addEventListener("mouseleave", () => link.style.color = "rgb(207, 209, 211)");

                            requestAnimationFrame(() => (link.style.opacity = "1"));
                            foundDiv.appendChild(link);
                        }
                    });

                    if (hasValidArticles) {
                        containerDiv.appendChild(foundDiv);
                        const wrapper = anchor.parentElement;
                        wrapper.insertAdjacentElement("afterend", containerDiv);

                        // Expand animation
                        requestAnimationFrame(() => {
                            containerDiv.style.maxHeight = "240px";
                            containerDiv.style.opacity = "1";
                            toggleButton.style.transform = "rotate(180deg)";
                        });
                    }
                }
            }, 100);
        });
    }

    /** Utility: get current conversation ID from URL */
    function getLastSegment() {
        const url = window.location.href;
        return url.substring(url.lastIndexOf("/") + 1);
    }

    /** Initialize once DOM is ready */
    function runWhenReady() {
        console.log("Flowritext ChatGPT Organizer initialized!");
        addToggleButtons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", runWhenReady);
    } else {
        runWhenReady();
    }

    /** Observe sidebar for dynamic changes */
    const sidebar = document.querySelector('.group\\/sidebar-expando-section');
    if (sidebar) {
        const observer = new MutationObserver(() => addToggleButtons());
        observer.observe(sidebar, { childList: true, subtree: true });
        window.addEventListener("beforeunload", () => observer.disconnect());
    }

})();
