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
    
    if(!statesList) return res.status(400).json({ 'message': 'No states found.'})
    const result = statesList.to
    res.status(200).json(stat);
}

const createStateFunFact = async (req, res) => {
    if (!req?.body?.funfact) {
        return res.status(400).json({ 'message': 'Funfact text required.' });
    }
    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED;

    const stateFacts = await State.findOne({ stateCode: req?.params?.code.toUpperCase() }).exec();
    
    stateFacts.funfacts[stateFacts.funfacts.length] = req.body.funfact;
    const result = stateFacts.save();
    res.json(stateFacts);
}

const removeStateFunFact = async (req, res) => {
    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED;
    const singleState = getJsonStateData(req?.params?.code);
    const stateFacts = await State.findOne({ stateCode: req?.params?.code.toUpperCase() }).exec();
    
    if (!stateFacts) return res.status(400).json({"message": `No Fun Facts found for ${singleState.state}`});
    if (!stateFacts.funfacts[req?.body?.index - 1]) return res.status(204).json({ "message": `No Fun Fact found at that index for ${singleState.state}` });

    var facts = [];
    console.log(req?.body?.index);
    for(var fact in stateFacts.funfacts){
        if (!(fact == req?.body?.index - 1)){
            facts[facts.length] = stateFacts.funfacts[fact];
        }
    }
    stateFacts.funfacts = facts;
    const result = stateFacts.save();    
    res.json(stateFacts);
}

const updateStateFunFact = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;
    const singleState = getJsonStateData(req?.params?.code.toUpperCase());
    const stateFacts = await State.findOne({ stateCode: req.params.code.toUpperCase() }).exec();

    if (!stateFacts) return res.status(400).json({"message": `No Fun Facts found for ${singleState.state}`});
    if (!stateFacts.funfacts[req.body.index - 1]) return res.status(400).json({ "message": `No Fun Fact found at that index for ${singleState.state}` });
    stateFacts.funfacts[req.body.index - 1] = req.body.funfact;
    const result = stateFacts.save();
    res.json({"state": stateFacts.stateCode,
    "funfact": req.body.funfact,
    "index": req.body.index-1,
    "-v": "stable"});
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
    const singleState = getJsonStateData(req?.params?.code);
    const stateFacts = await State.findOne({ stateCode: req.params.code.toUpperCase() }).exec();

    if (!stateFacts) return res.status(400).json({ "message": `No Fun Facts found for ${singleState.state}` });
    const randomFact = stateFacts.funfacts[Math.floor(Math.random() * stateFacts.funfacts.length)];
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