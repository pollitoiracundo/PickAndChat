// Background service worker for Pick and Chat extension

let extensionEnabled = false;
let chatGPTWindowId = null;
let chatGPTTabId = null;

// Initialize extension state on startup
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        extensionEnabled = result.extensionEnabled || false;
        updateContextMenu();
    });
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({extensionEnabled: false});
    extensionEnabled = false;
    updateContextMenu();
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateExtensionState') {
        extensionEnabled = request.enabled;
        updateContextMenu();
    } else if (request.action === 'sendToChatGPT') {
        openOrUpdateChatGPT(request.text);
    }
    
    sendResponse({success: true});
});

function openOrUpdateChatGPT(text) {
    const encodedText = encodeURIComponent(text);
    const chatGPTUrl = `https://chatgpt.com/?q=${encodedText}`;

    if (chatGPTTabId !== null) {
        chrome.tabs.get(chatGPTTabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
                createWindow();
            } else {
                chrome.tabs.update(chatGPTTabId, { url: chatGPTUrl, active: true }, () => {
                    chrome.windows.update(chatGPTWindowId, { focused: true });
                });
            }
        });
    } else {
        createWindow();
    }

    function createWindow() {
        chrome.windows.create({
            url: chatGPTUrl,
            type: 'normal',
            focused: true
        }, (win) => {
            if (win && win.tabs && win.tabs[0]) {
                chatGPTWindowId = win.id;
                chatGPTTabId = win.tabs[0].id;
            }
        });
    }
}

// Update context menu based on extension state
function updateContextMenu() {
    chrome.contextMenus.removeAll(() => {
        if (extensionEnabled) {
            chrome.contextMenus.create({
                id: 'sendToChatGPT',
                title: 'Send to ChatGPT',
                contexts: ['all']
            });
        }
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'sendToChatGPT') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'extractAndSend'
        });
    }
});

// Handle tab updates to reinject content script state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.local.get(['extensionEnabled'], (result) => {
            const isEnabled = result.extensionEnabled || false;
            chrome.tabs.sendMessage(tabId, {
                action: 'toggleExtension',
                enabled: isEnabled
            }).catch(() => {
                // Ignore errors if content script is not ready
            });
        });
    }
});