
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
    document.getElementById('starting-link-formated').innerText = removeUrlEncoding(player.startingLink);
    document.getElementById('target-link-formated').innerText = removeUrlEncoding(player.targetLink);
}



// Hide and element and reveal another to emulate a 'screen switching' effect
function switchScreen(idToHide, idToReveal) {
    document.getElementById(idToHide).classList.remove('is-visible');
    document.getElementById(idToReveal).classList.add('is-visible');
}



// retrieve the summary section of two random elements from the queries array
function loadSummary(query, queryTwo) {
    openLoadAnimation();
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + query + '&format=json&section=0&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-summary-output&origin=*'
    var urlTwo = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + queryTwo + '&format=json&section=0&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-summary-output&origin=*'
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            document.getElementById('starting-link').lastChild.innerHTML = res.parse.text['*'];
            var links = document.getElementsByTagName('a');
            var linksArr = Array.prototype.slice.call(links);
            linksArr.forEach(function(elem){
                elem.classList.add('invalid-link');
            })
            var xhrTwo = new XMLHttpRequest();
            xhrTwo.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    closeLoadAnimation();
                    var res = JSON.parse(this.responseText);
                    document.getElementById('target-link').lastChild.innerHTML = res.parse.text['*'];
                    var links = document.getElementsByTagName('a');
                    var linksArr = Array.prototype.slice.call(links);
                    linksArr.forEach(function(elem){
                        elem.classList.add('invalid-link');
                    })
                }
            }
            xhrTwo.open("GET", urlTwo, true);
            xhrTwo.send();
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}



function loadJSON(query, fromPromptBool) {
    // Remove 'start digging button if hasn't been removed already
    openLoadAnimation(fromPromptBool);
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
            displayArticle();
            closeLoadAnimation();
            document.getElementById('prompt-input').classList.add('is-visible');
            document.getElementById('prompt-confirm-button').classList.add('is-visible');
            document.getElementById('prompt-cancel-button').classList.add('is-visible');
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}



function displayArticle() {
    document.getElementById('page').innerHTML = player.article.parse.text['*'];
    if(!document.getElementsByClassName('game-links')[0].classList.contains('is-visible')){
        document.getElementsByClassName('game-links')[0].classList.add('is-visible');
    }
    if(!document.getElementsByClassName('game-fixed-nav')[0].classList.contains('is-visible')){
        document.getElementsByClassName('game-fixed-nav')[0].classList.add('is-visible');
    }
    var links = document.getElementsByTagName('a');
    var linksArr = Array.prototype.slice.call(links);
    linksArr.forEach(function(elem){
        if (/^https?:|.ogv$|.webm$|.ogg$|.svg$|Portal:|Special:|\.php/.test(elem.href)) {
            elem.classList.add('invalid-link');
        }
        else {
            elem.addEventListener("click", promptConnection)
        }
    })
}



function confirmConnection(event, bool) {
    if (event.keyCode === 13 || bool === true){
        event.preventDefault();
        var query = player.workingLink;
        if(document.getElementById('prompt-input').value.length === 0) {
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
            player.score++;
            document.getElementById('score').innerText = 10 - player.score;
            player.urlLinks.push(player.previousLink);
            player.links.push(inlineElem([removeUrlEncoding(player.previousLink), 'span', 'highlight-secondary'], ['is connected to', 'span'], [removeUrlEncoding(player.workingLink), 'span', 'highlight-secondary'], ['because','span'], [document.getElementById('prompt-input').value, 'span']));
            player.previousLink = player.workingLink;
            displayLinks('game-links-list');
            loadJSON(query, true);
        }
    } 
}



function cancelConnection() {
    document.getElementById('prompt-overlay').classList.remove('is-visible');
    document.getElementById('prompt-input').value = '';
}



function promptConnection(e){
    debugger;
    if(/#/.test(this.href)){
        if(!/index\.html#/.test(this.href)){
            document.getElementById('prompt-input').classList.remove('is-visible');
            document.getElementById('prompt-confirm-button').classList.remove('is-visible');
            document.getElementById('prompt-cancel-button').classList.remove('is-visible');
            e.preventDefault();
            var query=/\/wiki\/(.*)#/.exec(this.href)[1];
            player.workingLink = query;
            document.getElementById('prompt-text').innerHTML = '';
            document.getElementById('prompt-text').appendChild(inlineElem([removeUrlEncoding(player.previousLink), 'span', 'highlight-secondary'], ['is connected to', 'span'], [removeUrlEncoding(player.workingLink), 'span', 'highlight-secondary'], ['because...', 'span']))
            document.getElementById('prompt-overlay').classList.add('is-visible');
        }
        return;
    }
    document.getElementById('prompt-input').classList.remove('is-visible');
    document.getElementById('prompt-confirm-button').classList.remove('is-visible');
    document.getElementById('prompt-cancel-button').classList.remove('is-visible');
    e.preventDefault();
    var query=/\/wiki\/(.*)/.exec(this.href)[1];
    player.workingLink = query;
    document.getElementById('prompt-text').innerHTML = '';
    document.getElementById('prompt-text').appendChild(inlineElem([removeUrlEncoding(player.previousLink), 'span', 'highlight-secondary'], ['is connected to', 'span'], [removeUrlEncoding(player.workingLink), 'span', 'highlight-secondary'], ['because...', 'span']))
    document.getElementById('prompt-overlay').classList.add('is-visible');
}



function previousArticle() {
    if (player.links.length === 0) {
        return;
    }
    if (player.links.length === 1) {
        document.getElementById('game-fixed-nav-previous-btn').classList.add('is-disabled');
    }
    player.workingLink = player.urlLinks[player.urlLinks.length - 1];
    if (player.urlLinks.length > 1){
        player.previousLink = player.urlLinks[player.urlLinks.length - 2];
    }
    player.urlLinks.pop();
    player.links.pop();
    displayLinks('game-links-list');
    loadJSON(player.workingLink, false);
    displayArticle();
    scrollToId('page');
}


function displayLinks(id) {
    var linkslist = document.getElementById(id);
    while (linkslist.firstChild) {
        linkslist.removeChild(linkslist.firstChild);
    }
    player.links.forEach(function(elem, index){
        var listItem = document.createElement('li');
        var listArrow = document.createElement('li');
        var img = document.createElement('img');
        listArrow.className = 'game-links-list-arrow';
        img.src='icons/arrow.svg';
        listArrow.appendChild(img);
        listItem.appendChild(elem);
        if (index > 0){
            linkslist.appendChild(listArrow);
        }
        linkslist.appendChild(listItem);
    })
}

function revealInfo(id) {
    document.getElementById(id).classList.add('is-visible');
}


function hideInfo() {
    var startingLink = document.getElementById('starting-link');
    var targetLink = document.getElementById('target-link');
    if(startingLink.classList.contains('is-visible')) {
        startingLink.classList.remove('is-visible');
    }
    if(targetLink.classList.contains('is-visible')) {
        targetLink.classList.remove('is-visible');
    }
}


function endGame(result) {
    var userInput = document.getElementById('prompt-input');
    player.score++;
    player.links.push(highlightStr(player.previousLink) + ' is connected to ' + highlightStr(player.workingLink) + ' because ' + userInput.value)
    userInput.value = '';
    document.getElementById('target-link').innerHTML = '';
    document.getElementById('starting-link').innerHTML = '';    
    document.getElementById('prompt-overlay').classList.remove('is-visible');
    document.getElementById('page').innerHTML = ''
    switchScreen('game', 'results');
}

// Takes any number of arguments in this format, an array of strings consisting [string, tag, class, href] where class and href are optional
function inlineElem() {
    var args = Array.prototype.slice.call(arguments)
    var p = document.createElement('p');
    args.forEach(function(elem){
        var str = elem[0] + ' ';
        var tag = document.createElement(elem[1]);
        tag.innerText = str;
        if (elem[2]) {
            tag.className = elem[2];
        }
        if (elem[3]) {
            tag.href = elem[3];
        }
        p.appendChild(tag);
    })
    return p;
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

function scrollToId(id) {
    document.getElementById(id).scrollIntoView(true);
    window.scrollBy(0, -60);
}

function removeInputRequired() {
    document.getElementById('prompt-input-required').classList.remove('is-visible');
}



function removeUrlEncoding(str) {
    decodedStr = decodeURI(str);
    return decodedStr.replace(/_/g,' ');
}

function openLoadAnimation(inPromptBool){
    document.getElementsByTagName('body')[0].classList.add('is-loading');
    if (!inPromptBool){
        document.getElementById('loading').classList.add('is-visible');
    }
    else {
        document.getElementById('prompt-loading').classList.add('is-visible')
    }
}

function closeLoadAnimation() {
    document.getElementsByTagName('body')[0].classList.remove('is-loading')
    if (document.getElementById('loading').classList.contains('is-visible')) {
        document.getElementById('loading').classList.remove('is-visible');
    }
    if (document.getElementById('prompt-loading').classList.contains('is-visible')) {
        document.getElementById('prompt-loading').classList.remove('is-visible');
        if (document.getElementById('game-fixed-nav-previous-btn').classList.contains('is-disabled')){
            document.getElementById('game-fixed-nav-previous-btn').classList.remove('is-disabled');
        }
        document.getElementById('prompt-overlay').classList.remove('is-visible');
        document.getElementById('prompt-input').value = '';
        scrollToId('game-links-list');
    }

}