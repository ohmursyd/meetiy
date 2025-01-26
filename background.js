// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.active) {
        // Add a red dot to the browser action icon
        chrome.action.setBadgeText({ text: "●", tabId: sender.tab.id });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: sender.tab.id });
    }
});
