var express = require('express'),
    app     = express.createServer(),
    md      = require('node-markdown').Markdown,
    fs      = require('fs'),
	exec    = require('child_process').exec;

app.set('view engine', 'ejs');
app.use(express.staticProvider(__dirname + '/static'));
app.use(express.bodyDecoder());

var head = fs.readFileSync('template/head.html');
var foot = fs.readFileSync('template/foot.html');

app.get('/', function(req, res){
    res.render('home');
});

app.post('/', function(req, res){
	// render the track
	var track = head;
	var slides = req.body.md.split('!SLIDE');
	track  += '<div class="">'
		+ '<div id="slide-0" class="content" style="text-align: center;">';
	if (req.body.ff) {
		track += '<img src="lib/nerdery.png" />';
	}
	track += '</div></div>';
	for (var i in slides) {
		track  += '<div class="">'
			+ '<div id="slide-' + (+i + 1) + '" class="content">'
			+ md(slides[i])
			+ '</div></div>';
	}
	track += foot;

	// create a new project
	var now = +new Date();
	var path = 'projects/' + now;
	var comm = 'mkdir ' + path
		//+ ' && touch ' + path + '/index.html'
		+ ' && mkdir ' + path + '/lib'
		+ ' && cp template/lib/* ' + path + '/lib';

	// do work
	exec(comm, function(){
		// save the track
		fs.writeFile(path + "/index.html", track, function (err) {
			exec('tar -cf render/' + now + '.tar ' + path, function(){
				// give it to the user
				console.log(err ? err : now + ' ok');
				res.download('render/' + now + '.tar');
			});
		});
	});


});

app.listen(80);
