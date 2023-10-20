//============================================================
// Constants and global variables
//============================================================
const JiraTaskRegex = /https:\/\/(?<atlassiantennant>[a-z]+)\.atlassian\.net.+projects\/(?<projectid>[A-Za-z]+).+(?<issueid>\2-[\d]+)/;
const JiraTaskBrowseRegex = /https:\/\/(?<atlassiantennant>[a-z]+)\.atlassian\.net.+browse\/(?<issueid>[A-Za-z]+-[\d]+)/;

const btn_copytitleid = document.getElementById("btn_copytitle");
const btn_adbuchungid = document.getElementById("btn_adbuchung");

const usageHintParagraph = document.getElementById("usage-hint");

let JiraRegexMatch, atlassiantennant, issueid;

//============================================================
// Functions
//============================================================
const days = (date_1, date_2) =>{
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
}

const getJiraIssueTitle = (atlassiantennant, issueid) => {

    return new Promise((resolve) => {

        const issueXmlUrl = `https://${atlassiantennant}.atlassian.net/si/jira.issueviews:issue-xml/${issueid}/${issueid}.xml`;

        fetch(issueXmlUrl).then(response => response.text()).then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            const issueTitle = xmlDoc.getElementsByTagName("title")[1].childNodes[0].nodeValue;
            console.log(issueTitle);

            resolve(issueTitle);

        });

    });

}

//============================================================
// Main
//============================================================
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    JiraRegexMatch = JiraTaskRegex.exec(tabs[0].url);

    if(!JiraRegexMatch) {
        JiraRegexMatch = JiraTaskBrowseRegex.exec(tabs[0].url);
    }

    if(JiraRegexMatch) {
        console.log("Regex Return:");
        console.log(JiraRegexMatch);

        btn_copytitleid.style.display = "block";
        btn_adbuchungid.style.display = "block";
        usageHintParagraph.style.display = "none";

        atlassiantennant = JiraRegexMatch.groups.atlassiantennant;
        issueid = JiraRegexMatch.groups.issueid;

    }
});


//============================================================
// Copy Title Event-Handler
//============================================================
if (btn_copytitleid) {
    btn_copytitleid.onclick = function() {

        getJiraIssueTitle(atlassiantennant, issueid).then(issueTitle => {
            navigator.clipboard.writeText(issueTitle).then(function() {
                console.log("Copied to clipboard");
                window.close();
            });
        });

    };
}

//============================================================
// AD Buchung Event-Handler
//============================================================
if (btn_adbuchungid) {
    btn_adbuchungid.onclick = function() {

        getJiraIssueTitle(atlassiantennant, issueid).then(issueTitle => {

            let today = new Date();
            let adtdOriginDate = new Date(1899, 12, 1);
            
            adtdTodayDate = days(today, adtdOriginDate) + 1;
            console.log("AdTd Today Date:" + adtdTodayDate);

            navigator.clipboard.writeText(issueTitle).then(function() {
                console.log("Copied to clipboard");

                let width = 800;
                let height = 600;
                let left = (screen.width / 2) - (width / 2);
                let top = (screen.height / 2) - (height / 2);

                let windowProxy = window.open(
                    'http://adtd:3950/ActivityDesk/buchung.aspx?action=new&date=' + 
                    adtdTodayDate + 
                    '&type=0&stamm=1&kunde=D00327&projekt=P1472&vorgang=5185&beleg=73121', 
                    '_blank', 
                    `left=${left}, top=${top}, width=${width}, height=${height}`
                );

                console.log(windowProxy.document);
                //Fenster darf zu diesem Zeitpunkt nicht geschlossen werden, da das Pupup auf window.opener.location zugreift
                //Wenn das Fenster geschlossen wird, wird window.opener.location auf null gesetzt und das AD/TD Fenster kann nicht mehr geschlossen werden
                //window.close();
            });

        });         

    };
}