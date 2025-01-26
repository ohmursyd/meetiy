const checkInterval = 2000; // Check every 2 seconds

// Function to auto-refresh the page if no meeting is active
const autoRefreshBeforeMeeting = (enabled, interval) => {
    if (!enabled) return;

    const leaveCallButton = document.querySelector('[aria-label*="Leave call"]') ||
                            Array.from(document.querySelectorAll('button')).find(button =>
                                button.innerText.toLowerCase().includes("leave call")
                            );

    if (leaveCallButton) {
        console.log("User is in a meeting. Auto-refresh is disabled.");
        return; // Do not refresh if the user is already in a meeting
    }

    console.log(`Auto-refresh enabled. Refreshing the page in ${interval} minutes if no meeting is active...`);
    setTimeout(() => location.reload(), interval * 60 * 1000); // Convert minutes to milliseconds
};


const tryJoinMeet = (autoJoin, micOff, videoOff) => {
    if (!autoJoin) return;

    const leaveCallButton = document.querySelector('[aria-label*="Leave call"]') ||
        Array.from(document.querySelectorAll('button')).find(button =>
            button.innerText.toLowerCase().includes("leave call")
        );

    if (leaveCallButton) {
        console.log("User is in a meeting. Stopping 'tryJoinMeet' checks.");
        return; // Stop further execution if the user is already in a call
    }

    // Enhanced participant detection logic using Array.from and find
    const participants = Array.from(document.querySelectorAll('[role="status"], [aria-live], span, div')).find(el => {
        const text = el.textContent.toLowerCase();
        return text.includes("participant") || text.includes("in this call") ||
            text.match(/\d+\s*(participants|people)/);
    });

    const joinNowButton = Array.from(document.querySelectorAll('button')).find(button =>
        button.innerText.toLowerCase().includes("join now")
    );
    const askToJoinButton = Array.from(document.querySelectorAll('button')).find(button =>
        button.innerText.toLowerCase().includes("ask to join")
    );

    if (joinNowButton || askToJoinButton) {
        console.log("Join button detected:", joinNowButton ? "'Join now'" : "'Ask to join'");
    }

    ensureMicAndVideoOff(micOff, videoOff);

    if (participants && participants.textContent.match(/\d+/) && (joinNowButton || askToJoinButton)) {
        const participantCount = parseInt(participants.textContent.match(/\d+/)[0], 10);
        console.log(`Detected ${participantCount} participants. Attempting to join...`);
        if (joinNowButton) {
            console.log("Found 'Join now' button. Clicking...");
            joinNowButton.click();
        } else if (askToJoinButton) {
            console.log("Found 'Ask to join' button. Clicking...");
            askToJoinButton.click();
        }
    } else {
        console.log("Waiting for participants or join buttons...");
    }
};

// Function to ensure mic and video are off
const ensureMicAndVideoOff = (micOff, videoOff) => {
    if (micOff) {
        const micButton = document.querySelector('[aria-label*="Turn off microphone"]') || document.querySelector('[aria-label*="Turn on microphone"]');
        if (micButton && micButton.getAttribute('aria-label').includes("Turn on microphone")) {
            console.log("Turning off microphone...");
            micButton.click();
        }
    }

    if (videoOff) {
        const videoButton = document.querySelector('[aria-label*="Turn off camera"]') || document.querySelector('[aria-label*="Turn on camera"]');
        if (videoButton && videoButton.getAttribute('aria-label').includes("Turn on camera")) {
            console.log("Turning off camera...");
            videoButton.click();
        }
    }
};

// Load settings and start functionality
chrome.storage.sync.get(["autoJoin", "micOff", "videoOff", "refreshInterval"], (settings) => {
    const autoJoin = settings.autoJoin ?? true;
    const micOff = settings.micOff ?? true;
    const videoOff = settings.videoOff ?? true;
    const refreshInterval = settings.refreshInterval ?? 5;

    // Set up auto-refresh before joining a meeting
    autoRefreshBeforeMeeting(autoJoin, refreshInterval);

    // Periodically check for buttons and auto-join
    const intervalId = setInterval(() => {
        const leaveCallButton = document.querySelector('[aria-label*="Leave call"]') ||
                                Array.from(document.querySelectorAll('button')).find(button =>
                                    button.innerText.toLowerCase().includes("leave call")
                                );

        if (leaveCallButton) {
            console.log("User is in a meeting. Clearing 'tryJoinMeet' interval.");
            clearInterval(intervalId); // Stop checks when the user is in a meeting
            return;
        }

        tryJoinMeet(autoJoin, micOff, videoOff);
    }, checkInterval);
});

// Notify background script that the extension is active
chrome.runtime.sendMessage({ active: true });
