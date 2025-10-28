module.exports = function validateParamType(req, res, next){
    const {name} = req.params;

    if(!name){
        res.status(400).json({error :"parse a country name", details : "no name parsed"})
    }

    const reg = /^[A-Za-z\s]+$/;

    if(!reg.test(name)){
        return res.status(400).json({error :"invalid value type", details : "please enter a valid country"})
    }
    next()
}