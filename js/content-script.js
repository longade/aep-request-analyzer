const s = document.createElement('script');
s.src = chrome.runtime.getURL('js/request-analyzer.js');
s.onload = () => {
    s.remove();
};
(document.head || document.documentElement).appendChild(s);

// workaround to fix service-worker becoming inactive -> polling every 10 seconds
const wakeup = () => {
    setTimeout(() => {
        chrome.runtime.sendMessage('ping', () => {});
        wakeup();
    }, 10000);
}
wakeup();

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        sendResponse(JSON.stringify("response"));
        analyzeRequest(request);
    }
);