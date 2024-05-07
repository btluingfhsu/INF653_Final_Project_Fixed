const statesJson = require('../model/statesData.json');

const isValidStateCode = (req) => {
    if (!req.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const stateCode = statesJson.map(state => state.code);
    const upcaseState = req.params.state.toUpperCase();
    return (stateCode.includes(upcaseState));
}


module.exports = isValidStateCode;