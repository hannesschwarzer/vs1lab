const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.send('We are on geotags');
});

router.get('/geotagID', (req, res) => {
    res.send('We are on geotags');
});

module.exports = router;