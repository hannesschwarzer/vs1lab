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

var counter = 0;

function GeoTag(latitude, longitude, name, hashtag) {
    counter++;
    this.geotagID = counter;
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


var inMemorySpeicherung = (function () {
    var geoTagArray = [];

    return {
        radiusSearch: function (latitude, longitude) {

            var radius = 10;

            return geoTagArray.filter(function (tag) {
                var distanceLongitude = longitude - tag.longitude;
                var distanceLatitude = latitude - tag.latitude;
                var distance = Math.sqrt(distanceLatitude * distanceLatitude + distanceLongitude * distanceLongitude)

                return distance <= radius;
            })
        },

        searchForGeotag: function (searchterm) {
            return geoTagArray.filter(function (tag) {
                return tag.geotagID.indexOf(searchterm) > -1 || tag.hashtag.indexOf(searchterm) > -1 || tag.name.indexOf(searchterm) > -1 || tag.latitude.indexOf(searchterm) > -1 || tag.longitude.indexOf(searchterm) > -1;
            });

        },

        changeGeotag: function (name, longitude, latitude, hashtag, geotagID) {
          geoTagArray.forEach(function (tag) {
              if(tag.geotagID === geotagID) {
                  var objectToChange = tag;
                  if(name !== undefined){ objectToChange.name = name;}
                  if(longitude !== undefined){objectToChange.longitude = longitude;}
                  if(latitude !== undefined){objectToChange.latitude = longitude;}
                  if(hashtag !== undefined){objectToChange.hashtag = longitude;}
              }
          })
        },

        addGeotag: function (name, latitude, longitude, hashtag) {
            var object = new GeoTag(latitude, longitude, name, hashtag);
            geoTagArray.push(object)
            return object
        },

        deleteGeotag: function (geoTagID) {

            geoTagArray.forEach(function (tag) {
                if (tag.geotagID === geoTagID) {
                    var positionGeoTagToDelete = geoTagArray.indexOf(tag);
                    geoTagArray.splice(positionGeoTagToDelete, positionGeoTagToDelete);
                }

            })

            return geoTagArray;
        },

        returnGeoTags: function () {
            return geoTagArray;
        }


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




var jsonParser = bodyParser.json();

app.post('/tagging', jsonParser, function (req, res) {
    console.log(req.body)

    var searchArray = inMemorySpeicherung.radiusSearch(req.body.latitude, req.body.longitude);
    var newObject = inMemorySpeicherung.addGeotag(req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag)

    searchArray.push(newObject)

    console.log("posting object " + newObject.geotagID + "...")

    res.set('Content-Type', 'application/json')
    res.status(200);
    res.send(
        {
            taglist: searchArray,
            latitudeUsr: req.body.latitude,
            longitudeUsr: req.body.longitude
        }
    )

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

app.get('/discovery', function (req, res) {
    var radius = 10;
    var searchResults = [];

    var searchtermURL = req.query.searchterm;// query.searchterm;
    var latitudeURL = req.query.latitude; // query.latitude;
    var longitudeURL = req.query.longitude; // query.longitude;


    if (searchtermURL) {
        searchResults = inMemorySpeicherung.searchForGeotag(searchtermURL);
    } else if (latitudeURL && longitudeURL) {
        searchResults = inMemorySpeicherung.radiusSearch(radius, latitudeURL, longitudeURL);
    } else {
        searchResults = inMemorySpeicherung.returnGeoTags();
    }

    res.set('Content-Type', 'application/json')
    res.status(200);
    res.send({
        taglist: searchResults,
        latitudeHidden: req.body.latitude_search,
        longitudeHidden: req.body.longitude_search
    });
});

app.post('geotags/', jsonParser, (req, res) => {
    var searchArray = inMemorySpeicherung.radiusSearch(req.body.latitude, req.body.longitude);
    var object = inMemorySpeicherung.addGeotag(
        req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
    searchArray.push(object)
    res.status(201)
    res.location("/geotags/" + object.geotagID)
    res.json(searchArray)
})

app.get('/geotags', (req, res) => {
    var searchResults = [];

    var searchtermURL = req.query.searchterm;
    var latitudeURL = req.query.latitude;
    var longitudeURL = req.query.longitude;
    var radius = req.query.radius;


    if (searchtermURL) {
        searchResults = inMemorySpeicherung.searchForGeotag(searchtermURL);
    } else if (latitudeURL && longitudeURL && radius) {
        searchResults = inMemorySpeicherung.radiusSearch(radius, latitudeURL, longitudeURL);
    } else {
        searchResults = inMemorySpeicherung.returnGeoTags()
    }

    res.json(searchResults)
})


app.delete('/geotags/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    var geoTags = inMemorySpeicherung.deleteGeotag(geotagID)
    res.status(200)
    console.log("Object" + geotagID + " deleted!")
    res.json({
        taglist: geoTags
    });

})

app.get('/geotags/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    res.json({
        taglist: inMemorySpeicherung.searchForGeotag(geotagID)
    })
})

app.put('/geotags/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    var latitudeURL = req.query.latitude;
    var longitudeURL = req.query.longitude;
    var nameURL = req.query.name;
    var hashTag = req.query.hashTag;

    inMemorySpeicherung.changeGeotag(nameURL, longitudeURL, latitudeURL, hashTag, geotagID);
    res.status(200);
    res.send();
})

// const geotagsRoute = require('./routes/geotags')
// app.use('/geotags', geotagsRoute);


/**
 * Setze Port und speichere in Express.
 */

/**
 *
 * Route fürs Anlegen von Geotags
 */

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.post('geotags/', jsonParser, (req, res) => {
    var searchArray = inMemorySpeicherung.radiusSearch(req.body.latitude, req.body.longitude);
    searchArray.push(inMemorySpeicherung.addGeotag(
        req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag))
    res.json(searchArray)
})

app.get('geotags/', jsonParser, (req, res) => {

})

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
