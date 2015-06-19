var TIMS={};
var tims=TIMS||{};
var dataTable=null;
var request={};
var requestData=null;
var STATUS_TYPE={
   passed:2,
   failed:3,
   blocked:4,
   pending:5,
   dropped:6,
   passedexp:8
};
var id=0,index=0;
tims.getResonse=function(url){
    
   var response=$.ajax({
         url:url,
		 type:'GET',
		 async:false
	});
   return response;
}
tims.getGroup=function(url,request){
  var response=$.ajax({
                 url:url,
				 type:'GET',
                 data:request,
                 async:false  				 
            });  
   return response;			
}
tims.formatData=function(subTable){
   console.info("SubTable{}"+JSON.stringify(subTable));
   index=index+1;
   var table='<table  id="table_'+index+'"  border="0" >';
   for(row  in subTable.child){
      id=id+1; 
      console.info("Row Data{}"+subTable.child[row].val);
      table+='<tr><td id="row_'+id+'" class="downArrow" role="row" style="text-align:right;width:17%" onclick="tims.tableEvent(this);">'+subTable.child[row].val+'</td>';
	  table +='<td>'+subTable.child[row].passed+'</td>';
	  table +='<td>'+subTable.child[row].pending+'</td>';
	  table +='<td>'+subTable.child[row].failed+'</td>';
	  table +='<td>'+subTable.child[row].passedexp+'</td>';
	  table+='</tr>';
	  
	}
	
  return table;
}  
tims.search=function(val,object){
  var table=null;
  $(object).each(function(key,obj){
         alert(obj.val);
        if(obj.val==val){
		     table=tims.formatData(obj);
		}
		else{
		   table=tims.search(val,obj.child);
		}
   });
   return table;
}
var data='[{"FldrTitle":"MongoFolder1","Status":null,"Title":"MongoFolder2","Type":1,"count":1},{"FldrTitle":"MongoFolder1","Status":null,"Title":"MongoFolder3","Type":1,"count":1},{"FldrTitle":"MongoFolder3","Status":null,"Title":"MongoFolder4","Type":1,"count":1},{"FldrTitle":"MongoFolder4","Status":null,"Title":"MongoFolder5","Type":1,"count":1},{"FldrTitle":"MongoFolder2","Status":5,"Title":"Result1","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":3,"Title":"Result10","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":6,"Title":"Result11","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":6,"Title":"Result12","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":4,"Title":"Result13","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":4,"Title":"Result14","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":2,"Title":"Result15","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":2,"Title":"Result16","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":8,"Title":"Result17","Type":102,"count":1},{"FldrTitle":"MongoFolder5","Status":8,"Title":"Result18","Type":102,"count":1},{"FldrTitle":"MongoFolder2","Status":2,"Title":"Result2","Type":102,"count":1},{"FldrTitle":"MongoFolder2","Status":3,"Title":"Result3","Type":102,"count":1},{"FldrTitle":"MongoFolder2","Status":2,"Title":"Result4","Type":102,"count":1},{"FldrTitle":"MongoFolder2","Status":8,"Title":"Result5","Type":102,"count":1},{"FldrTitle":"MongoFolder2","Status":2,"Title":"Result6","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":2,"Title":"Result7","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":2,"Title":"Result8","Type":102,"count":1},{"FldrTitle":"MongoFolder4","Status":3,"Title":"Result9","Type":102,"count":1}]';
tims.preparedStructure=function(){
    data=eval(data);
    var Request={};
	var node={val:null,child:[],passed:0,failed:0,pending:0,passedexp:0,dropped:0,blocked:0};
	var b=b||{};
	var parent={};
	b.add=function(node,obj,obj1){
	    var childnode={};
		//debugger;
	    if(node.val==null){
		      node.val=obj.FldrTitle;
			  childnode.val=obj.Title;
			  childnode.child=[];
			  //debugger;
			  b.findStatus(childnode,obj1,node,node.val);
			  node.child.push(childnode);
		}
		else{
		    console.info("FldrTitle{}"+node.val);
		    if(node.val==obj.FldrTitle  && obj.Type==1){
			   //console.info("FldrTitle{}"+node.val);
			   childnode.val=obj.Title;
			   childnode.child=[];
			   b.findStatus(childnode,obj1);
			   node.child.push(childnode);
			}
			else{
			   b.addChild(node,obj,obj1);
			}
		}
	}
	b.addChild=function(node,obj,obj1){
	    var childnode={};
		//console.info("ChildernInformation{}"+obj.FldrTitle+" ParentNode{}"+node.val);
		   $(node.child).each(function(key,val){
		        //console.info("FolderInformation{}"+obj.FldrTitle+" Value infomation{}"+val.val);
				if(val.val==obj.FldrTitle && obj.Type==1){
					 childnode.val=obj.Title;
					 childnode.child=[];
					 b.findStatus(childnode,obj1,val,val.val);
					 val.child.push(childnode);
				}
				else{
				   //console.info("Childern Data{}"+val.child.length);
				   if(val.child.length!=0){
						//console.info("Length{}"+val.child.length+"  Childern Parent{}"+val.val+"  Childern Parent childern{}"+val.child[0]);
						$(val.child).each(function(k,v){
						    //console.info("Key"+k+"  value"+v);
							 $(v).each(function(k1,v1){
							     console.info("Key"+k1+"  value"+v1);
							 });
						});
						//parent=node.child;
						b.addChild(val,obj,obj1);
				   }
				}
		   }); 
	
	}
	b.findStatus=function(childnode,obj,parents,rootName){
	   var parentNode=null;
	   childnode.passed=0;childnode.failed=0;
	   childnode.blocked=0;childnode.pending=0;
	   childnode.dropped=0;childnode.passedexp=0;
	   console.info("Before Childer"+childnode.val);
	   parentNode=b.findParent(parents,rootName);
	   console.info("Parent"+(parentNode!=null?parentNode.val:-1)+" ChildernNode"+childnode.val);
	   //debugger;
	   $(obj).each(function(key,value){
	       if(value.FldrTitle==childnode.val){
		        if(STATUS_TYPE.passed==value.Status){
                     childnode.passed=childnode.passed+1;
			    }else if(STATUS_TYPE.failed==value.Status){
                     childnode.failed=childnode.failed+1;
				}else if(STATUS_TYPE.blocked==value.Status){
                     childnode.blocked=childnode.blocked+1;
		    	}else if(STATUS_TYPE.pending==value.Status){
                     childnode.pending=childnode.pending+1;
			    }else if(STATUS_TYPE.dropped==value.Status){
                     childnode.dropped=childnode.dropped+1;
			    }else if(STATUS_TYPE.passedexp==value.Status){
                     childnode.passedexp=childnode.passedexp+1;
				}				
		   }
	   })
	   if(parentNode!=null){console.info("Passed"+parentNode.passed);
	       parentNode.passed=parentNode.passed+childnode.passed;
		   parentNode.blocked=parentNode.blocked+childnode.blocked;
		   parentNode.pending=parentNode.pending+childnode.pending;
		   parentNode.dropped=parentNode.dropped+childnode.dropped;
		   parentNode.passedexp=parentNode.passedexp+childnode.passedexp;
		}
	   
	}
	b.findParent=function(parents,rootName){
	   //debugger;
	    var parentNode=null; 
	    $(parents).each(function(key,value){
		    
		     if(value.val==rootName){
			     parentNode=value;
			 }
		});
	
      	return parentNode;
	}
	for(i=0;i<data.length;i++){
	   b.add(node,data[i],data);
	}
	console.info("FinalData{}"+node.child);
	$(node.child).each(function(key,val){
	    //console.info(val);
		
	});
	console.info("Structurre{}"+JSON.stringify(node));
	//alert(JSON.stringify(node));
	alert(JSON.stringify(node));
	requestData=node;
	
}
