// Background service worker for timer persistence

// Enable side panel on install
chrome.runtime.onInstalled.addListener(() => {
  // Set side panel options - available on all URLs
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    chrome.storage.local.get(['activeSession'], (result) => {
      if (result.activeSession) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/fayd_logo.png',
          title: 'Fayd',
          message: 'Your focus session timer is still running!'
        });
      }
    });
  }
});

// Keep track of timer in background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SESSION') {
    chrome.storage.local.set({ activeSession: message.session });
    chrome.alarms.create('focusTimer', { periodInMinutes: 1 });
  } else if (message.type === 'END_SESSION') {
    chrome.storage.local.remove('activeSession');
    chrome.alarms.clear('focusTimer');
  }
  sendResponse({ success: true });
});
