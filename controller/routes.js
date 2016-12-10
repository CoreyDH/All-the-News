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

    // Pull from Hacker News
    request('https://news.ycombinator.com/', function (err, res, html) {

        var $ = cheerio.load(html); // Cheerio!

        // Find all current records
        Article.find({}, function (err, doc) {
            if (err) throw err;

            // Iterate through articles
            $('.athing').each(function (i, el) {
                var data = {};

                // Scrapping data
                data.title = $(this).find('.title > a').text();
                data.link = $(this).find('.title > a').attr('href');
                data.linkPrev = $(this).find('.title > .sitebit > a > span').text();

                var entry = new Article(data); // New Entry
                var inDB = false; // Flag to check if article exists in database

                if (doc.length > 0) {
                    doc.forEach(function (value) { // Loop through database to find matching article titles
                        if (data.title === value.title) {
                            console.log('Already in DB!');
                            inDB = true;
                        }
                    });
                }

                if (!inDB) { // If there are no matches, save to database
                    entry.save(function (err, doc) {
                        if (err) throw err;

                        console.log(doc);
                    });
                }

            });


        });
    });

    res.redirect('/articles'); // return to home

});

// Get Note
router.get("/articles/:id", function (req, res) {

    if (req.params.id) {
        Article
            .findOne({ '_id': req.params.id }) // Match by id
            .populate('note') // Populate with corresponding note
            .exec(function (err, doc) {
                if (err) throw err;

                console.log('GET Note', doc);
                res.json(doc); // Return in JSON format
            });
    }

});


// Create a new note or replace an existing note
router.post("/articles/:id", function (req, res) {

    if (req.params.id) {
        var note = new Note(req.body);

        note.save(function (err, doc) { // Add Note
            if (err) throw err;

            Article
                .findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id }) // Update ID from Article to link to new note
                .exec(function (err, doc) {
                    if (err) throw err;

                    console.log('POST Note', doc);
                    res.json(doc); // Return article data
                })
        });
    }

});

module.exports = router;