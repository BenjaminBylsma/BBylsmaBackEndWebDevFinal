const STATE_LIST = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const verifyState = (req, res) => {
    for(state in STATE_LIST){        
        if (STATE_LIST[state] == req?.params?.code.toUpperCase()) return true;
    }
    if (!req?.params?.code) return res.status(400).json({ 'message': 'State code required.' });
    return res.status(400).json({"message":"Invalid state abbreviation parameter"});
}

module.exports = verifyState
