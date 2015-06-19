var mongo = require('mongodb');
var assert = require('assert');
/*Golbal Declarations*/
var projection='{"FldrTitle": 1, "Title": 1, "Type": 1, "Status": 1, "SubType": 1, "_id": 1, "me_id": 1,"EntityPath": 1}'; 
var criteria={};
var response={}; 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('sjc-wwpl-tft3', 27018, {auto_reconnect: true});
db = new Db('tms', server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'timsdata' database");
        db.collection('timsdata', {strict:true}, function(err, collection) {
            if (err) {
                console.log("Error was found during connection. Please try again!!!");
            }
        });
    }
});
 
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};


exports.findByFldrName = function(req, res) {

    var fldrname = req.params.folderName;
	console.log("fldrname"+fldrname);
	 db.collection('timsdata', function(err, collection) {
        collection.find({'FldrTitle':fldrname}).toArray(function(err, items) {
		     console.log("records fetched successfully !!!! Printing them ...");
			
            res.send(items);
        });
    });
   
};



exports.findEntityPaths = function(req, res) {
console.log("in find by entitypaths...");
  db.collection('timsdata', function(err, collection){
  collection.group([ "FldrTitle", "EntityPath"],
    {  "AccountName":"TIMSQIS", "Workspace.GID":"Txx16p", "EntityPath":{$regex:/834/}},
	
    {
      count: 0
	  }, 
    function(curr, result){
     result.count++;
    },
	function(err, results){

    res.send(results);
    }


  );
});

   
};

exports.findAll = function(req, res) {
console.log("in find all....");
    db.collection('timsdata', function(err, collection) {
        collection.find({"AccountName":"TIMSQIS","Workspace.GID":"Txx16p"}).toArray(function(err, items) {
		     console.log("records fetched successfully !!!! Printing them ...");
            res.send(items);
        });
    });
};
 
exports.add = function(req, res) {
    var row = req.body;
    console.log('Adding row: ' + JSON.stringify(row));
    db.collection('timsdata', function(err, collection) {
        collection.insert(row, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}
 
exports.update = function(req, res) {
    var id = req.params.id;
    var row = req.body;
    console.log('Updating row: ' + id);
    console.log(JSON.stringify(row));
    db.collection('timsdata', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, row, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating wine: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(row);
            }
        });
    });
}
 
exports.deleteIt = function(req, res) {
    var id = req.params.id;
    console.log('Deleting row: ' + id);
    db.collection('timsdata', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}
/*Folders information*/
exports.findByFldrTitle=function(req,res){
    var fldrTitle=req.params.fldrtitle;
	var type=1;
	criteria.FldrTitle=fldrTitle;
	//criteria.Type=1;
	console.info("Criteria{}"+JSON.stringify(criteria)+" Projetion"+projection);
	response.FldrTitle=fldrTitle;
	var itemsData=new Array();
	var connection=db.collection('timsdata')
	connection.find(criteria,{"FldrTitle":1,"Title":1,"AccountName":1,"Workspace.GID":1,"EntityPath":1,"Status":1}).sort({"me_id":1}).toArray(function(err, items){
	    res.send(items);
	});
} 
exports.findByGroup=function(req,res){
    console.info("AccountName{}"+req.query.acno+"  Workspace.GID"+req.query.gid+"  FolderTitle"+req.query.title);
    var connection=db.collection('timsdata');
	connection.group([ "FldrTitle","Status","Type","me_id"],{"AccountName":req.query.acno,"FldrTitle":req.query.title},
	 {count:0},function(curr,result){result.count++;},
	    function(err,results){res.send(results);}
    )

}
exports.findAllGroup=function(req,res){
    console.info("AccountName{}"+req.query.acno+"  Workspace.GID"+req.query.gid+"  FolderTitle"+req.query.path);
	var connection=db.collection('timsdata');
    connection.group([ "FldrTitle","Status","Title","Type","me_id","GID","Defects"],{"AccountName":req.query.acno,"Workspace.GID":req.query.gid,"EntityPath":{$regex:req.query.path}},
	 {count:0},function(curr,result){result.count++;},
	    function(err,results){res.send(results);}
    )
}