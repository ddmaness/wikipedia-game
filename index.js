
var player = {
    score : 0,
    urlLinks: [],
    links : [],
    startingLink: '',
    targetLink: '',
    previousLink: '',
    workingLink: '',
    article: undefined,
}



var queries = [
    'Athens',
    'Stoicism',
    'Ancient_Rome',
    'Battle_of_Marathon',
]


// Return random element from queries array
function randomQuery() {
    var index = Math.floor(Math.random() * Math.floor(queries.length));
    var query = queries[index];
    queries.splice(index, 1);
    return query;
}



// capture two random elements from the queries array to serve as the starting topics for the game
function startingLinks() {
    player.startingLink = randomQuery();
    player.targetLink = randomQuery();
    player.previousLink = player.startingLink;
}



// Hide and element and reveal another to emulate a 'screen switching' effect
function switchScreen(idToHide, idToReveal) {
    document.getElementById(idToHide).classList.remove('is-visible');
    document.getElementById(idToReveal).classList.add('is-visible');
}



// retrieve the summary section of two random elements from the queries array
function loadSummary(query, queryTwo) {
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + query + '&format=json&section=0&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-output&origin=*'
    var urlTwo = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + queryTwo + '&format=json&section=0&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-output&origin=*'
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            document.getElementById('starting-link').innerHTML = res.parse.text['*'];
            var links = document.getElementsByTagName('a');
            var linksArr = Array.prototype.slice.call(links);
            linksArr.forEach(function(elem){
                elem.classList.add('invalid-link');
            })
            var xhrTwo = new XMLHttpRequest();
            xhrTwo.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var res = JSON.parse(this.responseText);
                    document.getElementById('target-link').innerHTML = res.parse.text['*'];
                    var links = document.getElementsByTagName('a');
                    var linksArr = Array.prototype.slice.call(links);
                    linksArr.forEach(function(elem){
                        elem.classList.add('invalid-link');
                    })
                }
            }
            xhrTwo.open("GET", urlTwo, false);
            xhrTwo.send();
        }
    }
    xhr.open("GET", url, false);
    xhr.send();
}



function loadJSON(query) {
    // Remove 'start digging button if hasn't been removed already
    var startDiggingButton =document.getElementById('start-digging-button')
    if (!startDiggingButton.classList.contains('removed')){
        startDiggingButton.classList.add('removed');
    }
    // Retrieve wiki of query topic and display formated version on page
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + query + '&format=json&redirects=1&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-output&origin=*'
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            player.article = JSON.parse(this.responseText);
            setTimeout(function(){
                document.getElementById('prompt-input').classList.add('is-visible');
                document.getElementById('prompt-confirm-button').classList.add('is-visible');
                document.getElementById('prompt-cancel-button').classList.add('is-visible');
            },1000)
        }
    }
    xhr.open("GET", url, false);
    xhr.send();
}



function displayArticle() {
    document.getElementById('page').innerHTML = player.article.parse.text['*'];
    var links = document.getElementsByTagName('a');
    var linksArr = Array.prototype.slice.call(links);
    linksArr.forEach(function(elem){
        if (/^https?:|.ogv$|.webm$|.ogg$|.svg$|Portal:|Special:/.test(elem.href)) {
            elem.classList.add('invalid-link');
        }
        else {
            elem.addEventListener("click", promptConnection)
        }
    })
}



function confirmConnection() {
    var userInput = document.getElementById('prompt-input');
    var previousLink = removeUrlEncoding(player.previousLink);
    var workingLink = removeUrlEncoding(player.workingLink);
    if(userInput.value.length === 0) {
        document.getElementById('prompt-input-required').classList.add('is-visible');
        return;
    }
    if(player.workingLink.toUpperCase() !== player.targetLink.toUpperCase() && player.score >= 9) {
        endGame('lose')        
    }
    if(player.workingLink.toUpperCase() === player.targetLink.toUpperCase()) {
        endGame('win')
    }
    else {
        document.getElementById('prompt-overlay').classList.remove('is-visible');
        player.score++;
        document.getElementById('score').innerText = player.score;
        player.urlLinks.push(player.previousLink);
        player.links.push('(' + previousLink + ') is connected to (' + workingLink + ') because ' + userInput.value)
        player.previousLink = player.workingLink;
        displayLinks('game-links-list');
        userInput.value = '';
        displayArticle();
    }
}



function cancelConnection() {
    document.getElementById('prompt-overlay').classList.remove('is-visible');
    document.getElementById('prompt-input').value = '';
}



function promptConnection(e){
    if(/#/.test(this.href)){
        return;
    }
    document.getElementById('prompt-input').classList.remove('is-visible');
    document.getElementById('prompt-confirm-button').classList.remove('is-visible');
    document.getElementById('prompt-cancel-button').classList.remove('is-visible');
    e.preventDefault();
    var query=/\/wiki\/(.*)/.exec(this.href)[1];
    player.workingLink = query;
    var previousLink = removeUrlEncoding(player.previousLink);
    var workingLink = removeUrlEncoding(player.workingLink);
    document.getElementById('prompt-text').innerText = '('+ previousLink + ') is connected to (' + workingLink + ') because...'
    document.getElementById('prompt-overlay').classList.add('is-visible');
    setTimeout(loadJSON, 100, query);
}



function previousArticle() {
    if (player.links.length === 0) {
        return;
    }
    player.workingLink = player.urlLinks[player.urlLinks.length - 1];
    if (player.urlLinks.length > 1){
        player.previousLink = player.urlLinks[player.urlLinks.length - 2];
    }
    player.urlLinks.pop();
    player.links.pop();
    displayLinks('game-links-list');
    loadJSON(player.workingLink);
    displayArticle();
}


function displayLinks(id) {
    var linkslist = document.getElementById(id);
    while (linkslist.firstChild) {
        linkslist.removeChild(linkslist.firstChild);
    }
    player.links.forEach(function(elem){
        var listItem = document.createElement('li')
        listItem.innerText = elem;
        linkslist.appendChild(listItem);
    })
}


function endGame(result) {
    var userInput = document.getElementById('prompt-input');
    var previousLink = removeUrlEncoding(player.previousLink);
    var workingLink = removeUrlEncoding(player.workingLink);
    player.score++;
    player.links.push('(' + previousLink + ') is connected to (' + workingLink + ') because ' + userInput.value)
    userInput.value = '';
    document.getElementById('target-link').innerHTML = '';
    document.getElementById('starting-link').innerHTML = '';    
    document.getElementById('prompt-overlay').classList.remove('is-visible');
    document.getElementById('page').innerHTML = ''
    switchScreen('game', 'results')
}

function tryAgain(bool) {
    player.score = 0;
    document.getElementById('score').innerText = '';
    player.urlLinks = [];
    player.links = [];
    displayLinks('game-links-list');
    player.workingLink = '';
    player.previousLink = player.startingLink;
    player.article = undefined;
    if (!bool) {
        startingLinks();
    }
    loadSummary(player.startingLink, player.targetLink);
    document.getElementById('start-digging-button').classList.remove('removed');
    switchScreen('results','game');
}

function removeInputRequired() {
    document.getElementById('prompt-input-required').classList.remove('is-visible');
}



function removeUrlEncoding(str) {
    return str.replace(/_/g,' ');
}