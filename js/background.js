/* Begin of workaround to fix service-worker becoming inactive */
let lifeline;

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'keepAlive') {
        lifeline = port;
        setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
        port.onDisconnect.addListener(keepAliveForced);
    }
});

const keepAliveForced = () => {
    lifeline?.disconnect();
    lifeline = null;
    keepAlive();
}

const keepAlive = async () => {
    if (lifeline) return;
    for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => chrome.runtime.connect({ name: 'keepAlive' }),
            });
            chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
            return;
        } catch (e) { }
    }
    chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

const retryOnTabUpdate = async (tabId, info, tab) => {
    if (info.url && /^(file|https?):/.test(info.url)) {
        keepAlive();
    }
}

keepAlive();
/* End of workaround to fix service-worker becoming inactive */

chrome.storage.onChanged.addListener((changes, namespace) => {
    chrome.action.setTitle({
        title: changes.enabled?.newValue ? 'AEP analyzer is ON' : 'AEP analyzer is OFF'
    });

    chrome.action.setIcon({
        path: changes.enabled?.newValue ? '../img/icon-on.png' : '../img/icon-off.png'
    });
});

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        chrome.storage.local.get('enabled', (data) => {
            if (data.enabled) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (details.method === 'POST' && details.requestBody?.raw) {
                        details.postQuery = '';
                        for (let i = 0; i < details.requestBody.raw.length; ++i) {
                            details.postQuery += new TextDecoder().decode(details.requestBody.raw[i].bytes);
                        }
                    }
                    chrome.tabs.sendMessage(details.tabId, details);
                });
            }
        })
    },
    { urls: ["*://*/*/*/*/interact*"] }, ['requestBody']
)

/* chrome.runtime.onMessage.addListener((request, sender, reply) => {
    console.log('Request: ', request);
    return true;
}); */

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
});

chrome.management.onEnabled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
});

chrome.management.onDisabled.addListener(() => {
    chrome.storage.local.clear();
});