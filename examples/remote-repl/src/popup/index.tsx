import '../style.css';

function Popup() {
  const handleStart = async () => {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (currentTab) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'create-embed-service' });
    }
  };

  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-gap-2">
      <button className="plasmo-btn-neutral plasmo-btn plasmo-btn-sm" onClick={handleStart}>
        create-embed-service
      </button>
    </div>
  );
}

export default Popup;
