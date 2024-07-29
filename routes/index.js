const express = require('express');
const { body } = require('express-validator');
const USSDMenuController = require("../controller/ussdMenuController");


const router = express.Router()


router.get('/receiver',
    USSDMenuController.moovReceiver
);

router.post('/incoming',
    USSDMenuController.mtnReceiver
);

router.post('/cardless_callback', 
    USSDMenuController.callbackUrl
)




module.exports = router;

