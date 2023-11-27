chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    windowType: 'normal',
    currentWindow: true
  });
  if (currentTab) {
    chrome.tabs.sendMessage(currentTab.id, message, sendResponse);
  }
});
