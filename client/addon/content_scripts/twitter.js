console.log("safe_ extension loaded!");

const SAFE__API_ENDPOINT_V1 = "http://10.155.111.231:8000/ValidatePost/"
const SAFE__API_ENDPOINT_V2 = "http://10.155.111.231:8000/ValidatePost2/"

const SAFE__API_ENDPOINT = SAFE__API_ENDPOINT_V2;

// threshold for post polarity score to be considered offensive
// 
const POST_POLARITY_SCORE_THRESHOLD = 0;

// dictionary of all collected tweets with hash as key and post object as value
// post object contains the tweet text and the dom node
// Example: posts[hash] = { domNode: node, tweetText: tweetText };
let posts = {};


// CSS Selectors
const SELECTOR_TWEET_ARTICLE = 'article[data-testid="tweet"]'

const SELECTOR_TWEET_TEXT = 'div[data-testid="tweetText"]'
const SELECTOR_TWEET_TEXT_SPANS = 'div[data-testid="tweetText"] span'


// CSS classes
const CSS_BLUR_TWEET = 'safe_blurredtweet'


//
// Functions to interact with Twitter
//

function getAllTweetNodes() {
    // Tweets can be found as article nodes with this specific attribute and value
    return document.querySelectorAll(SELECTOR_TWEET_ARTICLE)
}

function getAllTweetNodeSpans(tweetNode) {
    return tweetNode.querySelectorAll(SELECTOR_TWEET_TEXT_SPANS)
}

function getTweetText(tweetNode) {
    // const textNodes = tweetNode.querySelectorAll('div[data-testid="tweetText"] span, div[data-testid="tweetText"] a')
    const spans = getAllTweetNodeSpans(tweetNode)

    const nodeArray = Array.from(spans)

    let spanText = nodeArray.map(span => span.innerText).join('');

    return spanText
}

function updateTweetText(tweetNode, text) {
    const spans = getAllTweetNodeSpans(tweetNode)

    const nodeArray = Array.from(spans)
    nodeArray.forEach(span => span.remove())


    let nodeToInsertModifiedTweet = tweetNode.querySelector(SELECTOR_TWEET_TEXT)

    let modifiedTweetSpan = document.createElement('span')
    modifiedTweetSpan.innerHTML = text;

    nodeToInsertModifiedTweet.appendChild(modifiedTweetSpan)
}

//
// Helper functions
//


function stringToHash(string) {
    let hash = 0;
    if (string.length == 0) return hash;

    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return hash;
}

//
// Main
//

window.addEventListener("load", waitForTweets, false);

function waitForTweets(evt) {
    console.log("waiting for tweets...");
    var jsInitChecktimer = setInterval(checkForJS_Finish, 111);

    function checkForJS_Finish() {
        if (document.querySelector(SELECTOR_TWEET_ARTICLE)) {
            console.log("found first tweet!");
            clearInterval(jsInitChecktimer);

            document.addEventListener("scroll", processTweets);
            processTweets();
        }
    }
}

function processPostScore(apiResponse) {

    let postHash = null;
    let postScorePolarity = null;
    let postScoreObjectivity = null;

    switch (SAFE__API_ENDPOINT) {
        case SAFE__API_ENDPOINT_V1:
            postScorePolarity = apiResponse[0][0];
            postScoreObjectivity = apiResponse[0][1];
            postHash = apiResponse[1];
        
            break;
        case SAFE__API_ENDPOINT_V2:
            postHash = apiResponse[1];

            postScorePolarity = apiResponse[0]['label'] === 'NEG' ? POST_POLARITY_SCORE_THRESHOLD -1 : 0;
            console.log(apiResponse);

            // {'label': 'NEU', 'score': 0.9493444561958313}
            break;
    
        default:
            break;
    }

    if (!postHash) {
        return;
    }

    if (posts[postHash]) {
        let post = posts[postHash];

        if (postScorePolarity < POST_POLARITY_SCORE_THRESHOLD) {
            //blurr tweet
            // post.domNode.classList.add(CSS_BLUR_TWEET);

            // post.domNode.style.backgroundColor = "red";

            console.log("post text: " + posts[postHash].tweetText);
            console.log("post polarity: " + postScorePolarity);
            console.log("post objectivity: " + postScoreObjectivity);


            //Todo fetch modified tweet text from server and update the tweet
            // updateTweetText(post.domNode, "This tweet has been flagged as potentially offensive. Click to view.");

            // post.domNode.innerText = "Sample Text";

        }
        else {
            // post is safe, unblurr
            post.domNode.classList.remove(CSS_BLUR_TWEET);

            // post.domNode.style.backgroundColor = "green";
        }
    }
}

function processTweets() {
    let tweetNodes = Array.from(getAllTweetNodes())

    tweetNodes.map((node) => {

        let tweetText = getTweetText(node);

        // skip if tweet text is empty
        if (tweetText == "") {
            return;
        }

        //hash tweet text
        let hash = stringToHash(tweetText);

        // if tweet is already in posts dictionary, skip it
        if(posts[hash]){
            return;
        }

        // blur the tweet as soon as it is loaded
        node.classList.add(CSS_BLUR_TWEET);

        // add tweet to posts dictionary
        posts[hash] = { domNode: node, tweetText: tweetText };

        // console.log(posts[hash]);
        // console.log("new tweet (" + hash + "s): " + tweetText);
        // console.log(node);

        // send tweet text to api for analysis
        let requestObject = {
            content: tweetText,
            hash: hash
        }

        fetch(SAFE__API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestObject)
        }).then(response => {
            response.json().then(data => {
                // process the api response and update the tweet
                processPostScore(data);
            });
        });

    });

}
