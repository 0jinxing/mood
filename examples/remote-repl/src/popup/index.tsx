import '../style.css';

function Popup() {
  const handleStart = async () => {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (currentTab) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'create-embed-service' });
      chrome.action.setBadgeText({ text: '整', tabId: currentTab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#85a5ff', tabId: currentTab.id });
      chrome.action.setBadgeTextColor({ color: '#fff', tabId: currentTab.id });
    }
  };

  const handleOpenOptions = async () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-gap-2">
      <button className="plasmo-btn plasmo-btn-sm" onClick={handleStart}>
        开
      </button>
      <button className="plasmo-btn-neutral plasmo-btn plasmo-btn-sm" onClick={handleOpenOptions}>
        整
      </button>
    </div>
  );
}

export default Popup;
