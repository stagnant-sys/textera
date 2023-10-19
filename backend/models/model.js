var mongoose = require('mongoose');
var imageSchema = new mongoose.Schema({
    username: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
 
module.exports = mongoose.model('Image', imageSchema);