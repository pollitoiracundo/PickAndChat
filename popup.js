document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-btn');
    const statusSpan = document.getElementById('status');
    
    // Load the current state
    chrome.storage.local.get(['extensionEnabled'], function(result) {
        const isEnabled = result.extensionEnabled || false;
        updateUI(isEnabled);
    });
    
    toggleBtn.addEventListener('click', function() {
        chrome.storage.local.get(['extensionEnabled'], function(result) {
            const currentState = result.extensionEnabled || false;
            const newState = !currentState;
            
            chrome.storage.local.set({extensionEnabled: newState}, function() {
                updateUI(newState);
                
                // Send message to content script to update state
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleExtension',
                        enabled: newState
                    });
                });
                
                // Update background script
                chrome.runtime.sendMessage({
                    action: 'updateExtensionState',
                    enabled: newState
                });
            });
        });
    });
    
    function updateUI(isEnabled) {
        if (isEnabled) {
            statusSpan.textContent = 'enabled';
            statusSpan.className = 'enabled';
            toggleBtn.textContent = 'Disable';
            toggleBtn.className = 'toggle-button enabled';
        } else {
            statusSpan.textContent = 'disabled';
            statusSpan.className = 'disabled';
            toggleBtn.textContent = 'Enable';
            toggleBtn.className = 'toggle-button';
        }
    }
});