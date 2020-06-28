// JS to have a better overview over the routes with /geotags
const express = require('express');

var bodyParser = require('body-parser');
const router = express.Router();
var jsonParser = bodyParser.json();

const modul = require('inMemorySpeicherung');


router.post('/', jsonParser, (req, res) => {
    var searchArray = modul.radiusSearch(req.body.latitude, req.body.longitude);
    var object = modul.addGeotag(
        req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag);
    searchArray.push(object)
    res.status(201)
    res.location("/geotags/" + object.geotagID)
    res.json(searchArray)
})

router.get('/', (req, res) => {
    var searchResults = [];

    var searchtermURL = req.query.searchterm;
    var latitudeURL = req.query.latitude;
    var longitudeURL = req.query.longitude;
    var radius = req.query.radius;


    if (searchtermURL) {
        searchResults = modul.searchForGeotag(searchtermURL);
    } else if (latitudeURL && longitudeURL && radius) {
        searchResults = modul.radiusSearch(radius, latitudeURL, longitudeURL);
    } else {
        searchResults = modul.returnGeoTags()
    }

    res.JSON(searchResults)
})


/**
 * TODO: This is all required:
 use the functions established in gta-server.js
 router.post (/)
 router.get (/)
 router.xy (geotags/geotagsID): get, change, delete
 geotagsID has to be programmed (see example down below)
 use the functions established in gta-sever.js */

router.delete('/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    var geoTags = modul.deleteGeotag(geotagID)
    res.status(200)
    console.log("Object" + geotagID + " deleted!")
    res.json({
        taglist: geoTags
    });

})

router.get('/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    res.json({
        taglist: modul.searchForGeotagID(geotagID)

    })
})

router.put('/:geotagID', (req, res) => {
    var geotagID = req.params.geotagID;
    var latitudeURL = req.query.latitude;
    var longitudeURL = req.query.longitude;
    var nameURL = req.query.name;
    var hashTag = req.query.hashTag;

    modul.changeGeotag(nameURL, longitudeURL, latitudeURL, hashTag, geotagID);
    res.status(200);
    res.send();
})

module.exports = router;

