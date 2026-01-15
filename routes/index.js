const express = require('express');
const { body } = require('express-validator');
const USSDMenuController = require("../controller/ussdMenuController");
const auth = require("../middleware/auth")


const router = express.Router()


router.get('/receiver',
    USSDMenuController.moovReceiver
);

router.post('/incoming', 
    auth,
    USSDMenuController.mtnReceiver
);

router.get('/cussdincoming', 
    USSDMenuController.celtiisReceiver
);

router.post('/cardless_callback', 
    USSDMenuController.callbackUrl
)




module.exports = router;

