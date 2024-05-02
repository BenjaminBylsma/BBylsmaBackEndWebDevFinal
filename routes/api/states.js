const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');
//const STATES_LIST = require('../../config/states_list');
//const verifyStates = require('../../middleware/verifyStates');

router.route('/')
    .get(statesController.getAllStates)  

router.route('/:code/funfact')
    .get(statesController.getRandomFact);

router.route('/:code/capital')
    .get(statesController.getStateCapital);

router.route('/:code/nickname')
    .get(statesController.getStateNickname);

router.route('/:code/population')
    .get(statesController.getStatePopulation);

router.route('/:code/admission')
    .get(statesController.getStateAdmission);

router.route('/:code')
    .get(statesController.getState)
    .post(statesController.createStateFunFact)
    .delete(statesController.removeStateFunFact)
    .patch(statesController.updateStateFunFact)


module.exports = router;