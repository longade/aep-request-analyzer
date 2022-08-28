var enabled = true; //enabled by default
const enableToggle = document.querySelector('#enable-toggle');
const enableToggleLabel = document.querySelector('.toggle-label');

chrome.storage.local.get('enabled', data => {
    enabled = !!data.enabled;
    if (enabled) {
        enableToggle.setAttribute('checked', enabled);
    }
    enableToggleLabel.textContent = enabled ? 'Disable' : 'Enable';
});

enableToggle.addEventListener('change', () => {
    enabled = !enabled;
    if (enabled) {
        enableToggle.setAttribute('checked', enabled);
    }
    else {
        enableToggle.removeAttribute('checked');
    }
    enableToggleLabel.textContent = enabled ? 'Disable' : 'Enable';
    chrome.storage.local.set({ enabled: enabled });
});