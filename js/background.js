
var debug = true;

/* chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log('wake me up');
}); */

chrome.action.onClicked.addListener(
    (tab) => {

        debug = !debug;

        chrome.action.setTitle({
            title: debug ? 'AEP analyzer is ON' : 'AEP analyzer is OFF'
        });

        chrome.action.setIcon({
            path: debug ? '../img/icon.png' : '../img/icon-off.png'
        });

    }
);

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (debug) {
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
    },
    { urls: ["*://*/*/*/*/interact*"] }, ['requestBody']
)

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    console.log('Request: ', request);
    return true;
});