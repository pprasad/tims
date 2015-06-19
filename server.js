var express = require('express');
var tims = require('./ws/timsDb');

 var app = express();
 var fs=require('fs');
 
 //app.use(bodyParser.urlencoded({ extended: false }));
 app.configure(function () {
    app.use(express.logger('dev'));     
    app.use(express.bodyParser());
	app.use(express.static("public")); 
});

 app.get('/table', function(req, res){
     res.send(fs.readFileSync('timsTable.html', 'UTF-8'));
});
 app.get('/json', function(req, res){
     res.send(fs.readFileSync('json.json', 'UTF-8'));
});
app.get('/tsttable', function(req, res){
     res.send(fs.readFileSync('test.html', 'UTF-8'));
});
//app.get('/timsdata', tims.findAll);
/*app.get('/timsdata/:id', tims.findById);*/
//app.get('/timsdata/:folderName', tims.findByFldrName);
//app.get('/timsdata/groupByStatus/:folderName', tims.findByStatus);
app.get('/getEntityPaths', tims.findEntityPaths);
app.post('/timsdata', tims.add);
app.put('/timsdata/:id', tims.update);
app.delete('/timsdata/:id', tims.deleteIt);
app.get('/timsdatasearch/:fldrtitle',tims.findByFldrTitle); 
//app.get('/timsgroupby',tims.findByGroup);exports.findAllGroup
app.get('/timsgroupby',tims.findAllGroup);
app.listen(3000);
console.log('Listening on port 3000...');