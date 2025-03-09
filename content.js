/**
 * Flowritext ChatGPT Prompts Organizer Add-on
 * 
 * Copyright (C) 2025 Flowritext
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

(function () {
    /**
     * Adds toggle buttons to each history item in the list.
     * Each button allows expanding/collapsing additional details.
     */
    function addToggleButtons() {
        // Select all list items representing history items
        const listItems = document.querySelectorAll('li.relative[data-testid^="history-item-"]');

        listItems.forEach(li => {
            const anchor = li.querySelector('a[href]'); // Get the first anchor inside the list item
            if (!anchor) return; // Skip if no anchor is found

            const hrefValue = anchor.getAttribute('href'); // Extract href attribute value
            const toggleButtonId = `toggle-${hrefValue.replace(/[^\w-]/g, '')}`; // Create a unique ID for toggle button

            // Prevent duplicate buttons from being added
            if (!li.querySelector(`#${toggleButtonId}`)) {
                const toggleButton = document.createElement('button');
                toggleButton.id = toggleButtonId;
                toggleButton.innerHTML = "▼"; // Default Down Icon
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

                // Hover effect for the button
                toggleButton.addEventListener("mouseenter", () => {
                    toggleButton.style.border = "2px solid white";
                    toggleButton.style.boxShadow = "0 0 8px white";
                });

                toggleButton.addEventListener("mouseleave", () => {
                    toggleButton.style.border = "1px solid #ececec";
                    toggleButton.style.boxShadow = "none";
                });

                // Click event to toggle history details
                toggleButton.addEventListener("click", (event) => {
                    event.stopPropagation();
                    updateHistory(hrefValue, li, toggleButton);
                });

                // Create a wrapper to align button and link
                const wrapper = document.createElement('div');
                wrapper.style.cssText = "display: flex; align-items: center; gap: 1px; padding-left: 8px;";

                wrapper.appendChild(toggleButton);
                anchor.before(wrapper); // Insert wrapper before anchor
                wrapper.appendChild(anchor);
            }
        });
    }

    /**
     * Expands or collapses the history details based on user interaction.
     * @param {string} id - The history item identifier.
     * @param {HTMLElement} li - The list item element.
     * @param {HTMLElement} toggleButton - The button controlling the toggle.
     */
    function updateHistory(id, li, toggleButton) {
        const charLimit = 28; // Limit the preview text length
        console.log("History updated for:", id);

        // Close any previously opened details
        document.querySelectorAll(".custom-collapsible-container").forEach(containerDiv => {
            containerDiv.style.maxHeight = "0px";
            containerDiv.style.opacity = "0";

            // Reset button rotation
            const previousToggle = containerDiv.previousElementSibling;
            if (previousToggle && previousToggle.tagName === "BUTTON") {
                previousToggle.style.transform = "rotate(0deg)";
            }

            setTimeout(() => containerDiv.remove(), 300);
        });

        requestAnimationFrame(() => {
            setTimeout(() => {
                const articles = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
                const url = "/c/" + getLastSegment();
                const anchor = li.querySelector('a[href]');

                if (id && id === url) {
                    let hasValidArticles = false;
                    let containerDiv = li.nextElementSibling;

                    // If the container already exists, close it
                    if (containerDiv && containerDiv.classList.contains("custom-collapsible-container")) {
                        containerDiv.style.maxHeight = "0px";
                        containerDiv.style.opacity = "0";
                        toggleButton.style.transform = "rotate(0deg)";
                        setTimeout(() => containerDiv.remove(), 300);
                        return;
                    }

                    // Create collapsible container for history details
                    containerDiv = document.createElement('div');
                    containerDiv.className = "custom-collapsible-container";
                    containerDiv.style.cssText = `
                        margin-top: 5px;
                        max-height: 0px;
                        overflow: hidden;
                        opacity: 0;
                        transition: max-height 0.3s ease-out, opacity 0.3s ease-out, padding 0.3s ease-out;
                        padding-left:5px;
                    `;

                    // Get parent styles for consistency
                    const parentStyles = window.getComputedStyle(document.body);
                    containerDiv.style.backgroundColor = parentStyles.backgroundColor;
                    containerDiv.style.color = parentStyles.color;

                    // Create content container
                    const foundDiv = document.createElement('div');
                    foundDiv.style.cssText = `
                        color: red;
                        margin-top: 5px;
                        max-height: 150px;
                        overflow-y: auto;
                        padding: 0 0px;
                        background: #f9f9f9;
                        display: block;
                    `;
                    foundDiv.style.backgroundColor = parentStyles.backgroundColor;
                    foundDiv.style.color = parentStyles.color;

                    // Add history text previews as clickable links
                    articles.forEach((article) => {
                        const textElement = article.querySelector(".whitespace-pre-wrap");
                        if (textElement) {
                            hasValidArticles = true;
                            const fullText = textElement.textContent.trim();
                            const textPreview = fullText.substring(0, charLimit);

                            const link = document.createElement("a");
                            link.href = "#";
                            link.textContent = '• ' + textPreview + "...";
                            link.title = fullText;
                            link.style.cssText = `
                            margin-left: 5px;
                                display: block;
                                margin-bottom: 5px;
                                color:rgb(207, 209, 211);
                                text-decoration: none;
                                font-style: italic;
                                font-size: .9rem;
                            `;

                            link.addEventListener("click", (event) => {
                                event.preventDefault();
                                article.scrollIntoView({ behavior: "smooth", block: "start" });
                            });

                            // Hover effect for the button
                            link.addEventListener("mouseenter", () => {
                                link.style.color = "#fff"; // Change text color
                            });
                            
                            link.addEventListener("mouseleave", () => {
                                link.style.color = "rgb(207, 209, 211)"; // Reset color to default
                            });
                            

                            foundDiv.appendChild(link);
                        }
                    });

                    if (hasValidArticles) {
                        containerDiv.appendChild(foundDiv);
                        li.insertAdjacentElement('afterend', containerDiv);

                        // Open animation
                        requestAnimationFrame(() => {
                            containerDiv.style.maxHeight = "200px";
                            containerDiv.style.opacity = "1";
                            foundDiv.style.padding = "5px";
                            toggleButton.style.transform = "rotate(180deg)";
                        });
                    }
                }
            }, 100);
        });
    }

    /**
     * Extracts the last segment from the current URL.
     * @returns {string} Last segment of the URL.
     */
    function getLastSegment() {
        const url = window.location.href;
        return url.substring(url.lastIndexOf('/') + 1);
    }

    /**
     * Initializes the script when the document is ready.
     */
    function runWhenReady() {
        console.log("Executing code now!");
        addToggleButtons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", runWhenReady);
    } else {
        runWhenReady();
    }

    // MutationObserver to monitor page changes
    const observer = new MutationObserver((mutations) => {
        let articleAdded = false;
        let bodyChanged = false;
        let contentChanged = false;

        addToggleButtons();

        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches('article[data-testid^="conversation-turn-"]')) {
                        articleAdded = true;
                    }
                });
            }

            if (mutation.target === document.body) {
                bodyChanged = true;
            }

            if (mutation.target.matches('article[data-testid^="conversation-turn-"]')) {
                contentChanged = true;
            }
        });

        if (articleAdded) console.log('Article Added');
        else if (bodyChanged) console.log('Body Changed');
        else if (contentChanged) console.log('Content Changed');
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup observer on page unload
    window.addEventListener("beforeunload", () => {
        observer.disconnect();
    });
})();
