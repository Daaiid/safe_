console.log("safe_ extension loaded!");


let posts = {};

function getLoadedPostNodes() {
    // Tweets can be found as article nodes with this specific attribute and value
    return document.querySelectorAll('article[data-testid="tweet"]')
}

function extractTweetText(tweetNode) {
    // const textNodes = tweetNode.querySelectorAll('div[data-testid="tweetText"] span, div[data-testid="tweetText"] a')
    const spans = tweetNode.querySelectorAll('div[data-testid="tweetText"] span')
   
    const nodeArray = Array.from(spans)

    let spanText = nodeArray.map(span => span.innerText).join('');

    return spanText
}

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

window.addEventListener("load", waitForTweets, false);

function waitForTweets(evt) {
    var jsInitChecktimer = setInterval(checkForJS_Finish, 111);

    function checkForJS_Finish() {
        console.log("waiting for tweets...");
        if (document.querySelector('article[data-testid="tweet"]')) {
            clearInterval(jsInitChecktimer);


            document.addEventListener("scroll", processTweets);
            processTweets();
        }
    }
}

function processTweets() {
    let postNodes = Array.from(getLoadedPostNodes())

    // let elem = p[0].querySelector('div[data-testid="tweetText"] span, div[data-testid="tweetText"] a')

    // p.map((node) => console.log(extractTweetText(node)))
    postNodes.map((node) => {
        let tweetText = extractTweetText(node);

        if(tweetText == "") {
            return;
        }

        //hash tweet text
        let hash = stringToHash(tweetText);

        if(!posts[hash]) {
            posts[hash] = {domNode: node, tweetText: tweetText};
            
            console.log(posts[hash]);
            // console.log("new tweet (" + hash + "s): " + tweetText);
            // console.log(node);

            //TODO:
            //Change get parameter to POST body parameters
            fetch(`http://10.155.111.231:8000/ValidatePost/?content=${tweetText}&hash=${hash}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
            }
            }).then(response => {
                response.json().then(data => {
                    console.log(data);
                });
            });
        }


    });

}
