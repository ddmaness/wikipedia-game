
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

function loadDoc(query) {
    var url = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + query + '&format=json&redirects=1&prop=text%7Ccategories%7Clinks%7Ctemplates%7Csections%7Crevid%7Cdisplaytitle%7Ciwlinks%7Cproperties%7Cparsewarnings&wrapoutputclass=wiki-output&origin=*'
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            document.getElementById('page').innerHTML = res.parse.text['*'];
            var links = document.getElementsByTagName('a');
            var linksArr = Array.prototype.slice.call(links);
            linksArr.forEach(function(elem){
                if (/^https?:|.ogv$|.webm$|.ogg$/.test(elem.href)) {
                    elem.classList.add('invalid-link');
                }
                else {
                    elem.addEventListener("click", checkForExternalLink)
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

function checkForExternalLink(e) {
    console.log('click');
    var link = this.href
    e.preventDefault();
    var query=/\/wiki\/(.*)/.exec(link)[1];
    loadDoc(query);   
}
