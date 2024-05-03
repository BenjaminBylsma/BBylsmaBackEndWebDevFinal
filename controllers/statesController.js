const State = require('../model/State');
const data = {};
data.states = require('../model/statesData.json');
const verify_state = require('../middleware/verifyStates');

const getAllStates = async (req, res) => {
    if (req?.query?.contig == 'false'){
        const alaska = getJsonStateData("AK");
        const hawaii = getJsonStateData("HI");
        alaska['funfacts'] = findStateFunfacts("AK", false);
        hawaii['funfacts'] = findStateFunfacts("HI", false);
        return res.json([alaska, hawaii]);
    }
    var statesList = [];
    for(var state in data.states) {
        const stateData = getJsonStateData(data.states[state].code);
            stateData['funfacts'] = await findStateFunfacts(stateData.code, false);
        if (req?.query?.contig == null){            
            statesList[statesList.length] = stateData;            
        } else if (req?.query?.contig == 'true' && (stateData.code != "AK" && stateData.code != "HI")){                    
            statesList[statesList.length] = stateData;                
        }        
    }
    
    if(!statesList) return res.status(400).json({ 'message': 'No states found.'})
    res.json(statesList);
}

const createStateFunFact = async (req, res) => {
    if(!req?.body?.funfacts) return res.status(400).json({"message": "State fun facts value required"});
    if(!Array.isArray(req?.body?.funfacts)) return res.status(400).json({"message": "State fun facts value must be an array"});

    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED;

    const stateFacts = await getStateFunfacts(req?.params?.code, true);
    if (!stateFacts){
        const newStateFacts = await State.create({ stateCode: req?.params?.code.toUpperCase(), funfacts: req?.body?.funfacts });        
        return res.json(newStateFacts);
    }
    
    for(var fact in req.body.funfacts){
        stateFacts.funfacts[stateFacts.funfacts.length] = req.body.funfacts[fact];
    }    
    var result = await stateFacts.save();
    res.json(result);
}

const removeStateFunFact = async (req, res) => {
    if(!req?.body?.index) return res.status(400).json({"message": "State fun fact index value required"})

    const VERIFIED_CODE = verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code.toUpperCase());
    const stateFacts = await getStateFunfacts(req?.params?.code, true);

    if (!stateFacts) return res.status(404).json({"message": `No Fun Facts found for ${singleState.state}`});
    if (!stateFacts.funfacts[req?.body?.index - 1]) return res.status(404).json({ "message": `No Fun Fact found at that index for ${singleState.state}` });

    var facts = [];
    for(var fact in stateFacts.funfacts){
        if (!(fact == req?.body?.index - 1)){
            facts[facts.length] = stateFacts.funfacts[fact];
        }
    }
    var result;
    if (facts.length === 0){
         result = await stateFacts.deleteOne();
        res.json(stateFacts);
    }else {
        stateFacts.funfacts = facts;
        result = await stateFacts.save();    
        res.json(result);
    }
}

const updateStateFunFact = async (req, res) => {
    if(!req?.body?.index) return res.status(400).json({"message": "State fun fact index value required"})
    if(!req?.body?.funfact) return res.status(400).json({"message": "State fun fact value required"});

    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code.toUpperCase());
    const stateFacts = await getStateFunfacts(req?.params?.code, true);

    if (!stateFacts) return res.status(404).json({"message": `No Fun Facts found for ${singleState.state}`});
    if (!stateFacts.funfacts[req.body.index - 1]) return res.status(404).json({ "message": `No Fun Fact found at that index for ${singleState.state}` });
    stateFacts.funfacts[req.body.index - 1] = req.body.funfact;
    var result = await stateFacts.save();
    res.json(result);
}

const getState = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    const stateFacts = await getStateFunfacts(req?.params?.code, false);

    if (stateFacts) singleState.funfacts = stateFacts;
    res.json(singleState);
}

const getRandomFact = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    const stateFacts = await getStateFunfacts(req?.params?.code, false);

    if (!stateFacts) return res.status(404).json({ "message": `No Fun Facts found for ${singleState.state}` });
    const randomFact = stateFacts[Math.floor(Math.random() * stateFacts.length)];
    res.json({"funfact": randomFact});
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
    res.json({"state": singleState.state, "population": singleState.population.toLocaleString()});
}

const getStateAdmission = async (req, res) => {
    const VERIFIED_CODE = await verify_state(req, res);

    if (VERIFIED_CODE != true) return VERIFIED_CODE;

    const singleState = getJsonStateData(req?.params?.code);
    res.json({"state": singleState.state, "admitted": singleState.admission_date});
}

const getJsonStateData = (state_code) => {
    for (var state in data.states){
        if (data.states[state].code == state_code.toUpperCase()) return data.states[state];
    }
}
const getStateFunfacts = async (state_code, db_operation) => {
    const stateFacts = await State.findOne({ stateCode: state_code.toUpperCase() }).exec(); 
    
    return (db_operation) ? stateFacts : stateFacts?.funfacts;
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