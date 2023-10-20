export function getLoadedPostNodes() {
    // Tweets can be found as article nodes with this specific attribute and value
    return document.querySelectorAll('article[data-testid="tweet"]')
}

export function extractTweetText(tweetNode) {
    // Tweet text often has multiple spans and anchors as children
    // TODO: fix this selector, as it isn't perfect yet
    const textNodes = tweetNode.querySelector('div[data-testid="tweetText"] span, div[data-testid="tweetText"] a')
    return textNodes.map((node) => node.innerHTML).join()
}