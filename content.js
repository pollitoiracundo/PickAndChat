// Content script for Pick and Chat extension

let extensionEnabled = false;
let currentHighlightedElement = null;
let lastClickedElement = null;

// Initialize the content script
init();

function init() {
    // Get initial state from storage
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        extensionEnabled = result.extensionEnabled || false;
        if (extensionEnabled) {
            enableHighlighting();
        }
    });
    
    // Listen for messages from background and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleExtension') {
            extensionEnabled = request.enabled;
            if (extensionEnabled) {
                enableHighlighting();
            } else {
                disableHighlighting();
            }
        } else if (request.action === 'extractAndSend') {
            if (lastClickedElement) {
                extractAndSendText(lastClickedElement);
            }
        }
        sendResponse({success: true});
    });
}

function enableHighlighting() {
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('contextmenu', handleContextMenu);
}

function disableHighlighting() {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('contextmenu', handleContextMenu);
    removeHighlight();
}

function handleMouseOver(event) {
    if (!extensionEnabled) return;
    
    const element = event.target;
    
    // Skip if it's the same element or if it's a child of the highlighted element
    if (element === currentHighlightedElement) return;
    
    // Skip certain elements that shouldn't be highlighted
    if (shouldSkipElement(element)) return;
    
    removeHighlight();
    addHighlight(element);
}

function handleMouseOut(event) {
    if (!extensionEnabled) return;
    
    // Only remove highlight if we're not moving to a child element
    const element = event.target;
    const relatedTarget = event.relatedTarget;
    
    if (!relatedTarget || !element.contains(relatedTarget)) {
        // Small delay to prevent flickering when moving between elements
        setTimeout(() => {
            if (currentHighlightedElement === element) {
                removeHighlight();
            }
        }, 10);
    }
}

function handleContextMenu(event) {
    if (!extensionEnabled) return;
    
    lastClickedElement = event.target;
}

function shouldSkipElement(element) {
    // Skip script, style, and other non-visible elements
    const tagName = element.tagName.toLowerCase();
    const skipTags = ['script', 'style', 'meta', 'link', 'title', 'head'];
    
    if (skipTags.includes(tagName)) {
        return true;
    }
    
    // Skip if element has no visible content
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return true;
    }
    
    // Skip if element is not visible
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
        return true;
    }
    
    return false;
}

function addHighlight(element) {
    currentHighlightedElement = element;
    element.classList.add('pick-and-chat-highlight');
    
    // Adjust tooltip position if near top of viewport
    const rect = element.getBoundingClientRect();
    if (rect.top < 30) {
        element.classList.add('tooltip-bottom');
    }
}

function removeHighlight() {
    if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove('pick-and-chat-highlight', 'tooltip-bottom');
        currentHighlightedElement = null;
    }
}

function extractAndSendText(element) {
    if (!element) return;
    
    // Get the innerHTML and strip HTML tags
    let text = element.innerHTML;
    
    // Remove HTML tags but preserve some formatting
    text = text.replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to newlines
                .replace(/<\/p>/gi, '\n\n')     // Add double newlines after paragraphs
                .replace(/<\/div>/gi, '\n')     // Add newlines after divs
                .replace(/<\/li>/gi, '\n')      // Add newlines after list items
                .replace(/<[^>]*>/g, '')        // Remove all HTML tags
                .replace(/&nbsp;/g, ' ')        // Convert &nbsp; to spaces
                .replace(/&amp;/g, '&')         // Convert &amp; to &
                .replace(/&lt;/g, '<')          // Convert &lt; to <
                .replace(/&gt;/g, '>')          // Convert &gt; to >
                .replace(/&quot;/g, '"')        // Convert &quot; to "
                .replace(/&#39;/g, "'")         // Convert &#39; to '
                .trim();                        // Remove leading/trailing whitespace
    
    // Clean up excessive whitespace and newlines
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n')  // Max 2 consecutive newlines
                .replace(/[ \t]+/g, ' ')           // Normalize spaces
                .replace(/\n /g, '\n')             // Remove spaces after newlines
                .trim();
    
    if (text) {
        // Send to background script to open ChatGPT
        chrome.runtime.sendMessage({
            action: 'sendToChatGPT',
            text: text
        });
    }
}

// Clean up when the page unloads
window.addEventListener('beforeunload', () => {
    disableHighlighting();
});