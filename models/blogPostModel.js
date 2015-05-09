var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogPostSchema = new Schema({
    title:  String,
    author: String,
    body: String,
    date: { type: Date, default: Date.now },
    image: {data: String , contentType : String}
});

var collectionName = 'blogEntry';
module.exports = mongoose.model('blogPosts', blogPostSchema, collectionName);