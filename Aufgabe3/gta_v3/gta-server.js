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

function GeoTag(laititude, longitude, name, hashtag) {
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
    var returnArray;

    return {
        radiusSearch: function (radius, latitude, longitude) {

            var listCoordinates = geoTagListElements.forEach(function () {
                if (longitude) {
                }
            });

            // show Results for longitude + radius or latitude + radius;

            return geoTagListReturnItems;
        },

        searchForGeotag: function (searchterm) {

            geoTagListElements.forEach(function () {
                    if (this.innerHTML.includes(searchterm)
                        && geoTagListReturnItems.forEach(this.indexOf(searchterm) === -1)) {
                        geoTagListReturnItems.push(this);
                    }
            });
            return geoTagListReturnItems;
        },

        addGeotag: function (name, latitude, longitude, hashtag) {

            var newGeotag = new GeoTag(latitude, longitude, name, hashtag);
            geoTagListElements.push(newGeotag);

            return geoTagListElements;
        },

        deleteGeotag: function (name, latitude, longitude, hashtag) {

            // var geoTagToDelete = new GeoTag(latitude, longitude, name, hashtag);
            // var positionGeoTagToDelete = geoTagListElements.indexOf(geoTagToDelete);
            // geoTagListElements.splice(positionGeoTagToDelete, positionGeoTagToDelete);
            for (geoTagElement in geoTagListElements) {
                if (geoTagElement.name == name && geoTagElement.latitude == latitude && geoTagElement.longitude == longitude && geoTagElement.hashtag == hashtag) {
                    var positionGeoTagToDelete = geoTagListElements.indexOf(geoTagElement);
                    geoTagListElements.splice(positionGeoTagToDelete, positionGeoTagToDelete);
                }
            }

            return geoTagListElements;
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
        taglist: []
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

    http.contentType = text/plain;

    console.log(req.body);
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var name = req.body.name;
    var hashtag = req.body.hashtag;

    inMemorySpeicherung.addGeotag(name, latitude, longitude, hashtag);

    res.send('POST request to homepage');

    res.render('gta', {
        taglist: inMemorySpeicherung.radiusSearch(radius, longitude, latitude, name)
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

    http.contentType = plain / text;

    console.log(req.body);

    var searchterm = req.body.searchTerm;

    res.send('POST request to homepage');

    if(searchterm === -1){
        res.render('gta', {
            taglist: inMemorySpeicherung.radiusSearch(radius, latitude, longitude)
        });
    }
    else{
        res.render('gta', {
            taglist: inMemorySpeicherung.searchForGeotag(searchterm)
        });
    }

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
