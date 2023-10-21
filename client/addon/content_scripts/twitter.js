console.debug("safe_ extension loaded!");

const SAFE__API_HOST_NICOLA = "10.155.111.231:8000"
const SAFE__API_HOST_NICOLA_HOME = "10.155.228.64:8000"
const SAFE__API_HOST_LOCAL = "127.0.0.1:8000"
const SAFE__API_HOST = SAFE__API_HOST_NICOLA_HOME

const SAFE__API_ENDPOINT_V1 = `http://${SAFE__API_HOST}/ValidatePost/`
const SAFE__API_ENDPOINT_V2 = `http://${SAFE__API_HOST}/ValidatePost2/`

const SAFE__API_REWRITE_ENDPOINT_V1 = `http://${SAFE__API_HOST}/RewritePost/`

const SAFE__API_ENDPOINT = SAFE__API_ENDPOINT_V2;

// threshold for post polarity score to be considered offensive
// posts with lower scores will be blurred
const POST_POLARITY_SCORE_THRESHOLD = 0.95;


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
const CSS_BLUR_CHANGE_INTENDED = 'safe_blurchangeintended'

const TWEET_EDIT_PREFIX = "[sentiment normalized by safe_]: "

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
    modifiedTweetSpan.innerHTML = TWEET_EDIT_PREFIX + text;

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

const blurObserver = new MutationObserver(blurAgain) 

function blurAgain(mutations) {
    mutations.forEach((mut) => {
         const classes = mut.target.classList;
         if (mut.oldValue.includes(CSS_BLUR_TWEET) &&
             !classes.contains(CSS_BLUR_TWEET) &&
             !classes.contains(CSS_BLUR_CHANGE_INTENDED)) {
             classes.add(CSS_BLUR_TWEET);
         }
    })
 }

function waitForTweets() {
    console.log("waiting for tweets...");
    var jsInitChecktimer = setInterval(checkForJS_Finish, 111);

    function checkForJS_Finish() {
        if (document.querySelector(SELECTOR_TWEET_ARTICLE)) {
            console.log("found first tweet!");
            clearInterval(jsInitChecktimer);

            document.addEventListener("scroll", processTweets);
            preventUnblur();
            processTweets();
        }
    }
}

function removeBlur(node) {
    node.classList.add(CSS_BLUR_CHANGE_INTENDED);
    node.classList.remove(CSS_BLUR_TWEET);
}

function preventUnblur() {
    const config = {attributeOldValue: true, subtree: true, attributeFilter: ["class"]};
    // Selects a div that is inside a section and has a previous sibling that's a h1
    const timelineNode = document.querySelector('section > h1 + div');

    blurObserver.observe(timelineNode, config);
}

async function processPostScore(apiResponse) {

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

            // NEG score: lower score is less negative
            postScorePolarity = apiResponse[0]['label'] === 'NEG' ? apiResponse[0]['score'] : 0;
                       
            console.log(apiResponse[0])
            // console.log(apiResponse[0]['label'])
            // console.log(apiResponse[0]['score'])
            // console.log(postScorePolarity)

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

        if (postScorePolarity > POST_POLARITY_SCORE_THRESHOLD) {

            console.debug("post text: " + posts[postHash].tweetText);
            console.debug("post polarity: " + postScorePolarity);
            console.debug("post objectivity: " + postScoreObjectivity);

            //Todo fetch modified tweet text from server and update the tweet
            let requestObject = {
                content: posts[postHash].tweetText,
                hash: postHash
            }

            console.log("sent response to gpt3.5-turbo")
            fetch(SAFE__API_REWRITE_ENDPOINT_V1, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestObject)
            }).then(response => {
                response.json().then(data => {
                    console.log("got response from gpt3.5-turbo")
                    // process the api response and update the tweet
                    processPostUpdate(data);
                });
            });
            console.log("after fetch, should happen immediately after fetch")
            

            // post.domNode.innerText = "Sample Text";

        }
        else { // post is safe, so unblur
            blurObserver.disconnect();
            removeBlur(post.domNode);
            preventUnblur();
        }
    }
}

function processPostUpdate(apiResponse) {
    postHash = apiResponse[1];
    postText = apiResponse[0];

    if (!postHash) {
        return;
    }

    if (posts[postHash]) {
        let post = posts[postHash];

        updateTweetText(post.domNode, postText);

        removeBlur(post.domNode);
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
            response.json().then(async data => {
                // process the api response and update the tweet
                processPostScore(data);
            });
        });

    });

}
