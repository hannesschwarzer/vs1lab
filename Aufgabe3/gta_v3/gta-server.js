/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN

    //need to be initialized
var inMemorySpeicherung = (function () {
    var geoTagListReturnItems = [];

    return {
        radiusSearch: function (latitude, longitude, taglist) {

            var radius = 10;

            taglist.forEach(function(){
                var distanceLongitude = longitude - this.longitude;
                var distanceLatitude = latitude - this.latitude;
                var distance = Math.sqrt(distanceLatitude * distanceLatitude + distanceLongitude * distanceLongitude)

                if (distance <= radius){
                    geoTagListReturnItems.push(this);
                }
            })
            return geoTagListReturnItems;
        },

        searchForGeotag: function (searchterm, taglist) {

            return taglist.filter(function (tag) {
                return tag.hashtag.indexOf(searchterm) > -1 || tag.name.indexOf(searchterm) > -1 || tag.latitude.indexOf(searchterm) > -1 || tag.longitude.indexOf(searchterm) > -1;
            });

        },

        taglist: geoTagListReturnItems,

        addGeotag: function (name, latitude, longitude, hashtag, taglist) {

            var newGeotag = new GeoTag(latitude, longitude, name, hashtag);
            geoTagListReturnItems.push(newGeotag);

            return geoTagListReturnItems;
        },

        deleteGeotag: function (name, latitude, longitude, hashtag, taglist) {

            taglist.forEach(function () {
                if(this.name === name && this.latitude === latitude && this.longitude === longitude
                    && this.hashtag === hashtag){
                    var positionGeoTagToDelete = taglist.indexOf(this);
                    taglist.splice(positionGeoTagToDelete, positionGeoTagToDelete);
                }

            })

            return taglist;
        },


    };

})();


/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    res.render('gta', {
        taglist: inMemorySpeicherung.taglist,
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START
app.post('/tagging', function (req, res) {

    res.set('Content-Type', 'text/html')

    console.log(req.body);
    inMemorySpeicherung.addGeotag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag, req.body.taglist);


    var serachArray = inMemorySpeicherung.radiusSearch(req.body.latitude, req.body.longitude, inMemorySpeicherung.taglist);


    //res.send('POST request to homepage');

    res.render('gta', {
        taglist: serachArray,
        latitudeUsr: req.body.latitude,
        longitudeUsr: req.body.longitude
    });
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN
app.post('/discovery', function (req, res) {

    res.set('Content-Type', 'text/html')

    console.log(req.body);

    var searchterm = req.body.searchTerm;
    var radius = 10;
    var returnTags = [];

    // res.send('POST request to homepage');
    console.log(inMemorySpeicherung.taglist);

    if(searchterm == ""){
         var searchArray = inMemorySpeicherung.radiusSearch(radius, req.body.latitude, req.body.longitude, inMemorySpeicherung.taglist);
    }
    else{
        var searchArray = inMemorySpeicherung.searchForGeotag(searchterm, inMemorySpeicherung.taglist);
    }

    res.render('gta', {
        taglist: searchArray,
        latitudeHidden: req.body.latitude_search,
        longitudeHidden: req.body.longitude_search
    });

    /**if(searchterm == ""){
        res.render('gta', {
            taglist: inMemorySpeicherung.radiusSearch(radius, req.body.latitude, req.body.longitude, inMemorySpeicherung.taglist),

        });
    }
    else{
        var searchArray = inMemorySpeicherung.searchForGeotag(searchterm, inMemorySpeicherung.taglist);
        res.render('gta', {
            taglist: searchArray,
        });
    }
     */

});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
