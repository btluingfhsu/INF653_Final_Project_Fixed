const State = require('../model/State');
const statesJson = require('../model/statesData.json');
const jsonMessage = require('../middleware/jsonMessage');
const res = require('express/lib/response');
const getStateName = require('../middleware/getStateName');


const getAllStates = async (req, res) => {
    let mongoStates = await State.find();
    if (!mongoStates) return res.status(204).json({ 'message': 'No states found.' });
    let jsonStates = statesJson;
    jsonStates.map(state => {
        for (let i = 0; i < mongoStates.length; i++) {
            if (mongoStates[i].stateCode === state.code && mongoStates[i].hasOwnProperty('funfacts')) {
                state.funfacts = mongoStates[i].funfacts
            }            
        };
    });

    jsonStates = (req.query.contig === 'true') ? jsonStates.filter(state => state.code !== 'AK' && state.code !== 'HI')
        : (req.query.contig === 'false') ? jsonStates = jsonStates.filter(state => state.code === 'AK' || state.code === 'HI')
        : jsonStates;
    res.json(jsonStates);
}


const getState = async (req, res, next) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` });
    }
    const jsonState = statesJson.find(s => s.code == req.params.state.toUpperCase());
    if (state.funfacts && state.funfacts.length > 0) { 
        const funfacts = state.funfacts;
        jsonState['funfacts'] = funfacts;
    }    
    res.json(jsonState);
}


const getFunfact = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `Invalid state abbreviation parameter` }); 
    }
    const stateName = getStateName(state.stateCode);
    if (!state.funfacts || state.funfacts.length < 1) {
        return res.json({'message': `No Fun Facts found for ${stateName}`});
    }

    const randomIndex = Math.floor(Math.random() * state.funfacts.length)
    res.json({
        'funfact': state.funfacts[randomIndex]
    })

}

const getCapital = async (req, res) => {
    jsonMessage(req, res, 'capital');
}

const getNickname = async (req, res) => {
    jsonMessage(req, res, 'nickname');
}

const getPopulation = async (req, res) => {
    jsonMessage(req, res, 'population');
}

const getAdmission = async (req, res) => {
    jsonMessage(req, res, 'admission');
}

const createNewFunfacts = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `No state matches code ${req.params.state}.` });
    }

    if (req.body.funfacts) {
        if (Array.isArray(req.body.funfacts)) {
            state.funfacts.push(...req.body.funfacts);
        } else {
            return res.status(400).json({ 'message': 'State fun facts value must be an array' });
        }
        
    } else {
        return res.status(400).json({ 'message': `State fun facts value required`});
    }

    const result = await state.save();

    res.json(result);
}

const updateFunfact = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `No state matches code ${req.params.state}.` });
    }

    if (!req.body.index) {
        return res.status(400).json({ "message": `State fun fact index value required` });
    }
    if (!req.body.funfact) {
        return res.status(400).json({ "message": `State fun fact value required` });        
    }
    const stateName = getStateName(state.stateCode);
    if (!state.funfacts || state.funfacts.length < 1) {
        return res.status(400).json({ 'message': `No Fun Facts found for ${stateName}` });
    }

    if (req.body.index < 1 || req.body.index > state.funfacts.length) {
        return res.status(400).json({ 'message': `No Fun Fact found at that index for ${stateName}`});
    }
    
    const correctedIndex = req.body.index - 1;
    state.funfacts[correctedIndex] = req.body.funfact;
    const result = await state.save();
    res.json(result);
}

const deleteFunfact = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'State code required.' });
    const state = await State.findOne({ stateCode: req.params.state.toUpperCase() }).exec();
    if (!state) {
        return res.status(400).json({ "message": `No state matches code ${req.params.state}.` });
    }

    if(!req.body.index) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }

    const stateName = getStateName(state.stateCode);
    if (!state.funfacts || state.funfacts.length < 1) {
        return res.status(400).json({ 'message': `No Fun Facts found for ${stateName}` });
    }
    if (req.body.index < 1 || req.body.index > state.funfacts.length) {
        return res.status(400).json({ 'message': `No Fun Fact found at that index for ${stateName}`});
    }

    const correctedIndex = req.body.index - 1;
    state.funfacts.splice(correctedIndex, 1);
    const result = await state.save();
    res.json(result);
}


module.exports = { 
    getAllStates,
    getState,
    getCapital,
    getNickname,
    getPopulation,
    getAdmission,
    getFunfact,

    createNewFunfacts,
    updateFunfact,
    deleteFunfact
};