document.addEventListener("DOMContentLoaded", () => {
    const autoJoinCheckbox = document.getElementById("autoJoinCheckbox");
    const micOffCheckbox = document.getElementById("micOffCheckbox");
    const videoOffCheckbox = document.getElementById("videoOffCheckbox");
    const refreshIntervalInput = document.getElementById("refreshInterval");
    const saveSettingsButton = document.getElementById("saveSettings");

    // Load settings
    chrome.storage.sync.get(["autoJoin", "micOff", "videoOff", "refreshInterval"], (settings) => {
        autoJoinCheckbox.checked = settings.autoJoin ?? true;
        micOffCheckbox.checked = settings.micOff ?? true;
        videoOffCheckbox.checked = settings.videoOff ?? true;
        refreshIntervalInput.value = settings.refreshInterval ?? 5; // Default to 5 minutes
    });

    // Save settings
    saveSettingsButton.addEventListener("click", () => {
        chrome.storage.sync.set({
            autoJoin: autoJoinCheckbox.checked,
            micOff: micOffCheckbox.checked,
            videoOff: videoOffCheckbox.checked,
            refreshInterval: parseInt(refreshIntervalInput.value) || 5
        }, () => {
            alert("Settings saved!");
        });
    });
});
