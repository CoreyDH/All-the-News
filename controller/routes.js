var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var db = require("../config/connection.js");

var Note = require("../models/Note.js");
var Article = require("../models/Article.js");

mongoose.Promise = Promise;

// Main Route
router.get('/', function (req, res) {
    res.redirect('/articles');
});

router.get('/articles', function (req, res) {

    Article.find(function (err, doc) {
        if (err) throw err;

        console.log('GET Articles', doc);
        res.render('index', { articles: doc });
    });

});

// Scapper
router.get("/scrape", function (req, res) {

    request('https://news.ycombinator.com/', function (err, res, html) {

        var $ = cheerio.load(html);

        Article.find({}, function (err, doc) {
            if (err) throw err;

            $('.athing').each(function (i, el) {
                var data = {};

                data.title = $(this).find('.title > a').text();
                data.link = $(this).find('.title > a').attr('href');
                data.linkPrev = $(this).find('.title > .sitebit > a > span').text();

                var entry = new Article(data);
                var inDB = false;

                if (doc.length > 0) {
                    doc.forEach(function (value) {
                        if (data.title === value.title) {
                            console.log('Already in DB!');
                            inDB = true;
                        }
                    });
                }

                if (!inDB) {
                    entry.save(function (err, doc) {
                        if (err) throw err;

                        console.log(doc);
                    });
                }

            });


        });
    });

    if (req.params.render) {
        res.redirect('/articles');
    } else {
        res.send('Bathroom is cleaned.');
    }

});

// Get Note
router.get("/articles/:id", function (req, res) {

    if (req.params.id) {
        Article
            .findOne({ '_id': req.params.id })
            .populate('note')
            .exec(function (err, doc) {
                if (err) throw err;

                console.log('GET Note', doc);
                res.json(doc);
            });
    }

});


// Create a new note or replace an existing note
router.post("/articles/:id", function (req, res) {

    if (req.params.id) {
        var note = new Note(req.body);

        note.save(function (err, doc) {
            if (err) throw err;

            Article
                .findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                .exec(function (err, doc) {
                    if (err) throw err;

                    console.log('POST Note', doc);
                    res.send(doc);
                })
        });
    }

});

module.exports = router;