const State = require('../model/State');
const data = {};
data.states = require('../model/statesData.json');
const verify_state = require('../middleware/verifyStates');

const getAllStates = async (req, res) => {
    const statesList = [];
    for(var state in data.states) {
        if (req?.query?.contig != null){
            if ((req?.query?.contig == 'false' && (data.states[state].code == "AK" || data.states[state].code == "HI")) ||
                (req?.query?.contig == 'true' && (data.states[state].code != "AK" && data.states[state].code != "HI"))){
                const singleState = await State.findOne({ stateCode: data.states[state].code }).exec();        
                data.states[state]['funfacts'] = singleState?.funfacts;
                statesList[statesList.length] = data.states[state];
            }
        } else {
                const singleState = await State.findOne({ stateCode: data.states[state].code }).exec();        
                data.states[state]['funfacts'] = singleState?.funfacts;
                statesList[statesList.length] = data.states[state];
        }
    }
    
    if(!statesList) return res.status(400).json({ 'message': 'No states found.'});
    res.status(200).json(statesList);
}

const createStateFunFact = async (req, res) => {
    if (!req?.body?.funfact) {
        return res.status(400).json({ 'message': 'Funfact text required.' });
    }
    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED;

    const singleState = await State.findOne({ stateCode: req?.params?.code.toUpperCase() }).exec();
    
    singleState.funfacts[singleState.funfacts.length] = req.body.funfact;
    const result = singleState.save();
    res.json(singleState);
}

const removeStateFunFact = async (req, res) => {
    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED;

    const singleState = await State.findOne({ stateCode: req?.params?.code.toUpperCase() }).exec();

    if (!singleState.funfacts[req?.body?.index - 1]) {
        return res.status(204).json({ "message": `Invalid index reference to a funfact - index: ${req?.body?.index}.` });
    }

    var facts = [];
    console.log(req?.body?.index);
    for(var fact in singleState.funfacts){
        if (!(fact == req?.body?.index - 1)){
            facts[facts.length] = singleState.funfacts[fact];
        }
    }
    singleState.funfacts = facts;
    result = singleState.save();
    res.json(singleState);
}

const updateStateFunFact = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;
    const singleState = getJsonStateData(req?.params?.code.toUpperCase());
    const stateFacts = await State.findOne({ stateCode: req.params.code.toUpperCase() }).exec();

    if (!stateFacts.funfacts) return res.status(400).json({"message": `No funfacts found for ${singleState.state}`});
    if (!singleState.funfacts[req.body.index - 1]) return res.status(400).json({ "message": `Invalid index reference to a funfact - index: ${req.body.index}.` });
    singleState.funfacts[req.body.index - 1] = req.body.funfact;
    const result = singleState.save();
    res.json(singleState);
}

const getState = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    const stateFacts = await State.findOne({ stateCode: req.params.code.toUpperCase() }).exec();
    if (stateFacts) singleState.funfacts = stateFacts.funfacts;
    res.json(singleState);
}

const getRandomFact = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = await State.findOne({ stateCode: req.params.code.toUpperCase() }).exec();
    if (!singleState.funfacts) return res.status(400).json({ "message": 'No funfacts for this state' });
    const randomFact = singleState.funfacts[Math.floor(Math.random() * singleState.funfacts.length)];
    res.json(randomFact);
}

const getStateCapital = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    res.json({"state": singleState.state, "capital": singleState.capital_city});
}

const getStateNickname = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    res.status(200).json({"state": singleState.state, "nickname": singleState.nickname});
}

const getStatePopulation = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    res.json({"state": singleState.state, "population": singleState.population});
}

const getStateAdmission = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    res.json({"state": singleState.state, "admitted": singleState.admission_date});
}

const getJsonStateData = (stateCode) => {
    for (var state in data.states){
        if (data.states[state].code == stateCode.toUpperCase()) return data.states[state];
    }
}


module.exports = {
    getAllStates,
    createStateFunFact,
    removeStateFunFact,
    updateStateFunFact,
    getState,
    getRandomFact,
    getStateCapital,
    getStateNickname,
    getStatePopulation,
    getStateAdmission
}