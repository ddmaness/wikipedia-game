
var player = {
    score : 0,
    links : [],
    startingLink: '',
    targetLink: '',
}

var querys = [
    'Carnatic_music',
    'Stoicism',
    'Mica',
    'Battle_of_Marathon',
    'Dodecahedron'
]

function startingLinks() {
    player.startingLink = randomQuery();
    player.targetLink = randomQuery();
    document.getElementById('query-one').innerText = player.startingLink;
    document.getElementById('query-two').innerText = player.targetLink;
}

function switchScreen(idToHide, idToReveal) {
    document.getElementById(idToHide).classList.remove('is-visible');
    document.getElementById(idToReveal).classList.add('is-visible');
}

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

function loadDoc(query) {
    var startDiggingButton =document.getElementById('start-digging-button')
    if (!startDiggingButton.classList.contains('removed')){
        startDiggingButton.classList.add('removed');
    }
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + query + '&format=json&redirects=1&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-output&origin=*'
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            document.getElementById('page').innerHTML = res.parse.text['*'];
            var links = document.getElementsByTagName('a');
            var linksArr = Array.prototype.slice.call(links);
            linksArr.forEach(function(elem){
                if (/^https?:|.ogv$|.webm$|.ogg$|.svg|Portal:/.test(elem.href)) {
                    elem.classList.add('invalid-link');
                }
                else {
                    elem.addEventListener("click", handleLink)
                }
            })

        }
    }
    xhr.open("GET", url, false);
    xhr.send();
}

function randomQuery() {
    var index = Math.floor(Math.random() * Math.floor(querys.length));
    var query = querys[index];
    querys.splice(index, 1);
    console.log(querys);
    return query;
}

function handleLink(e) {
    console.log('click');
    var query=/\/wiki\/(.*)/.exec(this.href)[1];
    var link = this.href
    player.score++;
    if (query == player.targetLink) {
        alert('you Win! it took you ' + player.score + ' links');
        return;
    }
    player.links.push(link);
    e.preventDefault();
    loadDoc(query);   
}
