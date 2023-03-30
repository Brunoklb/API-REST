const responseModel = {
    success: false,
    data: [],
    error: []
}

module.exports = {
    async login(req, res){
         const reponse = {...responseModel}
         
         return res.json(reponse)
    }
}