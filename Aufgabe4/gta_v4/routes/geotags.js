// JS to have a better overview over the routes with /geotags
const express = require('express');

var bodyParser = require('body-parser');
const router = express.Router();
var jsonParser = bodyParser.json();

const modul = require('inMemorySpeicherung');



router.post('/', jsonParser, (req, res) => {
    var searchArray = modul.radiusSearch(req.body.latitude, req.body.longitude);
    searchArray.push(modul.addGeotag(
        req.body.name, req.body.latitude, req.body.longitude, req.body.hashtag))
    res.json(searchArray)
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

module.exports = router;

