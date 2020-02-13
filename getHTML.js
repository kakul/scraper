function getDOMString (root) {
    return root.documentElement.innerHTML
}

chrome.runtime.sendMessage({
    action: "getHTML",
    source: getDOMString(document)
})