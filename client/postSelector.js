export function getLoadedPostNodes() {
    // Tweets can be found as article nodes with this specific attribute and value
    return document.querySelectorAll('article[data-testid="tweet"]')
}

export function extractTweetText(tweetNode) {
    return tweetNode.querySelector('div[data-testid="tweetText"] > span').innerHTML
}