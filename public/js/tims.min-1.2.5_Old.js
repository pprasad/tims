var TIMS={};
var tims=TIMS||{};
var dataTable=null;
var request={};
var requestData=null;
var treeroot_nodes=[];
var golbalData=null;
var formatData=null;
var STATUS_TYPE={
   passed:2,
   failed:3,
   blocked:4,
   pending:5,
   dropped:6,
   passedexp:8,
   defects:-1,
   executed:-2,
   total:-3
};
var Travenling=[];
var ERROR_MESSAGE={
	NO_SUCH_DATA:"No Data Found"
}
var id=0,index=0;
tims.Floders=function(fldTitle){
    var Response={};var subFldr=new Array();
    Response.FldrTitle=fldTitle;
    var url='/timsdatasearch/'+fldTitle;
	var response=tims.getResonse(url);
	response.done(function(msg){
	  if(msg!=''){ 
		   request.acno=msg[0].AccountName;
		   request.gid=msg[0].Workspace.GID
		   request.path=msg[0].EntityPath;
		   url='/timsgroupby';
		   response=tims.getGroup(url,request);
		   response.done(function(msg){
			  msg=$(msg).sort(tims.Sort);
			  console.info(msg);
			  tims.preparedStructure(msg);
			  golbalData=msg;
		   });
	    }else{
		 while(treeroot_nodes.length>0){
				var id=treeroot_nodes.pop();
				$("#dataGrid").treetable("removeNode",id);
		 }
		 var node = $("#dataGrid").treetable("node","Error");treeroot_nodes.push("Error"); 
		 var row="<tr data-tt-id='Error'><td colspan='4' style='text-align:center'>"+ERROR_MESSAGE.NO_SUCH_DATA+"<td></tr>";
		 $("#dataGrid").treetable("loadBranch",node,row);
	   }	
   });
 };
tims.Sort=function(a,b){
  return a.me_id>b.me_id ? 1 : -1;
} 
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
tims.preparedStructure=function(response){
    data=response;
	var lastChild=null;
	var HashStack={};
    var Request={};
	var node={val:null,parent:null,child:[],passed:0,failed:0,pending:0,passedexp:0,blocked:0,dropped:0,defects:0,total:0,executed:0,quality:0};
	var rootNode=node;
	var b=b||{};
	var parent={};
	b.add=function(node,obj,obj1){
	    var childnode={};
		 if(node.val==null && obj.Type==1){
		      node.val=obj.FldrTitle;
			  b.findStatus(node,obj1);
			  childnode.val=obj.Title;
			  childnode.parent=obj.FldrTitle;
			  childnode.child=[];
			  b.findStatus(childnode,obj1);
			  node.child.push(childnode);
		}
		else{
		    console.info("FldrTitle{}"+node.val);
		    if(node.val==obj.FldrTitle && obj.Type==1){
			   childnode.val=obj.Title;
			   childnode.parent=obj.FldrTitle;
			   childnode.child=[];
			   b.findStatus(childnode,obj1);
			   node.child.push(childnode);
			}
			else{
			   rootNode=node;
			   b.addChild(node,obj,obj1);
			}
		}
	}
	b.addChild=function(node,obj,obj1){
	    var childnode={};
		   $(node.child).each(function(key,val){
				if(val.val==obj.FldrTitle && obj.Type==1){
					 childnode.val=obj.Title;
					 childnode.parent=obj.FldrTitle;
					 childnode.child=[];
					 b.findStatus(childnode,obj1);
					 val.child.push(childnode);
			    }else{
				   if(val.child.length!=0){
						$(val.child).each(function(k,v){
							 $(v).each(function(k1,v1){
							     console.info("Key"+k1+"  value"+v1);
							 });
						});
						b.addChild(val,obj,obj1);
				   }				   
				}
				
		   }); 
	
	}
	b.findStatus=function(childnode,obj){
	   childnode.passed=0;childnode.failed=0;
	   childnode.blocked=0;childnode.pending=0;
	   childnode.dropped=0;childnode.passedexp=0;
	   childnode.defects=0;childnode.executed=0;
	   childnode.quality=0;childnode.total=0;
	   $(obj).each(function(key,value){
	       if(value.FldrTitle==childnode.val){
		        if(STATUS_TYPE.passed==value.Status){
                     childnode.passed=childnode.passed+1;
					 tims.findDefects(childnode,value);
                }else if(STATUS_TYPE.failed==value.Status){
                     childnode.failed=childnode.failed+1;
					 tims.findDefects(childnode,value);
				}else if(STATUS_TYPE.blocked==value.Status){
                     childnode.blocked=childnode.blocked+1;
					 tims.findDefects(childnode,value);
				}else if(STATUS_TYPE.pending==value.Status){
                     childnode.pending=childnode.pending+1;
					 tims.findDefects(childnode,value);
				}else if(STATUS_TYPE.dropped==value.Status){
                     childnode.dropped=childnode.dropped+1;
					 tims.findDefects(childnode,value);
				}else if(STATUS_TYPE.passedexp==value.Status){
                     childnode.passedexp=childnode.passedexp+1;
					 tims.findDefects(childnode,value);
				}else{
				    tims.findDefects(childnode,value);
				}
               				
		   }
	   })
	
	}
	//Find Lasmost Node
	b.findLastNode=function(node){
	   $(node).each(function(key,valObj){
	         if(valObj.child==0){
			      b.findParent(valObj,rootNode);
			 }
			 else{
			   b.findLastNode(valObj.child);
			 }
	    });
	}
	//Calculating Parent
	b.findParent=function(childnode,node){
		if(!HashStack.hasOwnProperty(childnode.val)){
		     console.info("Enter into Inner Loop....");
		     console.info("BottomToTop{}"+JSON.stringify(childnode));
		     HashStack[childnode.val]=true;
		     b.childCalc(childnode,node);
	    }
				
	}
	//Calculating Childern
	b.childCalc=function(childnode,valObj){
	  $(valObj).each(function(key,valObj1){
               if(valObj1.val==childnode.parent){
				   b.setValues(childnode,valObj1);
				   b.childCalc(valObj1,rootNode);
			    }else{
				   b.childCalc(childnode,valObj1.child);
			   }
       });   
	}
	b.setValues=function(childnode,valObj){
	     valObj.passed=valObj.passed+childnode.passed;
		 valObj.blocked=valObj.blocked+childnode.blocked;
		 valObj.failed=valObj.failed+childnode.failed;
		 valObj.pending=valObj.pending+childnode.pending;
		 valObj.dropped=valObj.dropped+childnode.dropped;
		 valObj.passedexp=valObj.passedexp+childnode.passedexp;
		 valObj.defects=valObj.defects+childnode.defects;
		 //Total
		 b.calTotal(childnode);
		 b.calTotal(valObj);
		 //Executed
		 b.calExecuted(childnode);
		 b.calExecuted(valObj);
		 //quality
		 b.quality(childnode);
		 b.quality(valObj);
	}
	b.calTotal=function(eleNode){
	    eleNode.total=eleNode.blocked+eleNode.dropped+eleNode.failed+eleNode.passed+eleNode.passedexp+eleNode.pending;
	}
	b.calExecuted=function(eleNode){
	     eleNode.executed=eleNode.failed+eleNode.passed+eleNode.passedexp;
	}
	b.quality=function(eleNode){
	   var grandTotal=eleNode.failed+eleNode.passed+eleNode.passedexp;
	   var total=eleNode.passed+eleNode.passedexp;
	   if(grandTotal>0){
	       eleNode.quality=((total/grandTotal)*100).toFixed(2);
	   }else{
	     eleNode.quality=0;
	   }
	}
	for(i=0;i<data.length;i++){
	   b.add(node,data[i],data);
	}
	/*
	 *If Type is 102
	 */
	if(node.val==null && data[0].Type==102){
	      node.val=data[0].FldrTitle;
		  b.findStatus(node,data);
		  node.child=[];
		  b.quality(node);
		  b.calTotal(node);
		  b.calExecuted(node);
	}
	b.findLastNode(node);
	formatData=node;
 	tims.createRows(node);
}
tims.findDefects=function(childnode,obj){
     var defects=(obj.Defects!=null?obj.Defects:-1);
	 if(STATUS_TYPE.defects!=defects){
		 childnode.defects+=defects.length;
	 }
	 else{
		  childnode.defects+=0;
	}
}
tims.loadTreeView=function(id){
     $("#"+id).treetable({ expandable:true});
	 /*$("#"+id+" tbody").on("mousedown", "tr", function() {
		$(".selected").not(this).removeClass("selected");
		$(this).toggleClass("selected");
	});*/
}
tims.createRows=function(dataGrid){
 var parent=dataGrid.val;
 // Remove the node and it's children.
 while(treeroot_nodes.length>0){
     var id=treeroot_nodes.pop();
	 $("#dataGrid").treetable("removeNode",id);
 }
 var node = $("#dataGrid").treetable("node",dataGrid.val)
 treeroot_nodes.push(dataGrid.val);
 $("#dataGrid").show();
  $("#refreshAndExport").show();
 var row=$("<tr data-tt-id='"+dataGrid.val+"'>");
 row.append("<td class='link-normal'><img src='images/objects/folder.gif' alt='' style='vertical-align:middle;margin-right:3px;'><span class='folder'>"+dataGrid.val+"<span></td>");
 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.passed+")>"+dataGrid.passed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.pending+")>"+dataGrid.pending+"</a></td>");
 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.failed+")>"+dataGrid.failed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.blocked+")>"+dataGrid.blocked+"</a></td>");
 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.dropped+")>"+dataGrid.dropped+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.passedexp+")>"+dataGrid.passedexp+"</a></td>");
 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.executed+")>"+dataGrid.executed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.total+")>"+dataGrid.total+"</a></td>");
row.append("<td>"+dataGrid.quality+"%</td><td><a class='link-normal' href=javascript:tims.href_event('"+dataGrid.val+"',"+STATUS_TYPE.defects+")>"+dataGrid.defects+"</a></td>");
 $("#dataGrid").treetable("loadBranch",node,row);
  for(i=0;i<dataGrid.child.length;i++){
     tims.loadChildRows(parent,dataGrid.child[i],node);
  }
}
tims.loadChildRows=function(parent,object,node){
  console.info("Parent {}"+parent+"  Object"+object);
  $(object).each(function(key,obj){
         row=$("<tr data-tt-id='"+obj.val+"' data-tt-parent-id='"+parent+"'>");
		 row.append("<td class='link-normal'><img src='images/objects/folder.gif' alt='' style='vertical-align:middle;margin-right:3px;'><span class='folder'>"+obj.val+"<span></td>");
		 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.passed+")>"+obj.passed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.pending+")>"+obj.pending+"</a></td>");
         row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.failed+")>"+obj.failed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.blocked+")>"+obj.blocked+"</a></td>");
         row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.dropped+")>"+obj.dropped+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.passedexp+")>"+obj.passedexp+"</a></td>");
		 row.append("<td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.executed+")>"+obj.executed+"</a></td><td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.total+")>"+obj.total+"</a></td>");
		 row.append("<td>"+obj.quality+"%</td><td><a class='link-normal' href=javascript:tims.href_event('"+obj.val+"',"+STATUS_TYPE.defects+")>"+obj.defects+"</a></td>");
		 $("#dataGrid").treetable("loadBranch",node,row);
		 console.info("object.child.length{}"+obj.child+" Parent"+obj.val);
		 if(obj.child!=undefined){
		     if(obj.child.length!=0){
					parent=obj.val;
					tims.loadChildRows(parent,obj.child,node);
			 }
		 }
 });
}
//Result Information
/*
 *@param fldrTitle
 *@param Status value
 */
var Status=-1; 
tims.href_event=function(fldrId,val){
   resultDataset.clear().draw();
  /* if(STATUS_TYPE.defects==val){
		   tims.find_Result_Defects(fldrId,val);
   }else{*/
	   if(formatData.val==fldrId){
	       tims.findRootResult(formatData,golbalData,val);
		   tims.findResult(formatData.child,golbalData,val);
	   }
	   else{
			var valObj=tims.find_Result(formatData,fldrId);
			if(valObj!=null && valObj!=undefined){
				   tims.findResult(valObj,golbalData,val);
			}
		  
	   }
   //}   
   $('#resultDialog').dialog({
				autoOpen: true,
				resizable: false,
				width:'500px',my: "center",
					at: "center",
					of: window
	});
}
tims.find_Result_Defects=function(fldrId,val){
	$(golbalData).each(function(key,glbObj){
		 if(glbObj.FldrTitle==fldrId && glbObj.Defects!=null){
			  tims.showResult(glbObj,glbObj.Status);
		  } 
    });
}
var  resObj;
tims.find_Result=function(fObj,rootId){
   $(fObj.child).each(function(key,valObj){
	     if(valObj.val==rootId){
			  resObj=valObj;
		  }
		 else{
			 if(valObj.child.length!=0){
			     tims.find_Result(valObj,rootId);
			 }				 
	     }		  
   });	
   return resObj;
}
tims.findStatus=function(value){
    if(STATUS_TYPE.passed==value){
       return "<img src='images/status/passed.gif'>Passed";
    }else if(STATUS_TYPE.failed==value){
          return "<img src='images/status/failed.gif'>Failed";
    }else if(STATUS_TYPE.blocked==value){
          return "<img src='images/status/blocked.gif'>Blocked";
	}else if(STATUS_TYPE.pending==value){
          return "<img src='images/status/pending.gif'>Pending";
	}else if(STATUS_TYPE.dropped==value){
          return "<img src='images/status/dropped.gif'>Dropped";
	}else if(STATUS_TYPE.passedexp==value){
          return "<img src='images/status/passex.gif'>Passed Exception";
	}else if(STATUS_TYPE.executed==value){
		return "Executed";
	}else if(STATUS_TYPE.defects==value){
		return "<img src='images/objects/defect.gif'>Defects";
	}else if(STATUS_TYPE.total==value){
		 return "Total";
	}
}
tims.findRootResult=function(fObj,glbObj,stval){
   $(glbObj).each(function(key,gObj){
		     if(fObj.val==gObj.FldrTitle && gObj.Status==stval){
			    tims.showResult(gObj,stval); 
			 } 
             else{
			   if(STATUS_TYPE.executed==stval){	 
					if(fObj.val==gObj.FldrTitle && (gObj.Status==STATUS_TYPE.passed||gObj.Status==STATUS_TYPE.failed||gObj.Status==STATUS_TYPE.passedexp)){  
					   tims.showResult(gObj,gObj.Status);
					}
			   }else if(STATUS_TYPE.total==stval && fObj.val==gObj.FldrTitle && gObj.Status!=null){
				   tims.showResult(gObj,gObj.Status);
			   }else if(STATUS_TYPE.defects==stval && fObj.val==gObj.FldrTitle && gObj.Defects!=null){
				   tims.showResult(gObj,gObj.Status);
			   }
            }			 
	});
}
tims.findResult=function(fObj,glbObj,stval){
 $(fObj).each(function(key,object){
	    $(glbObj).each(function(key,gObj){
		     if(object.val==gObj.FldrTitle && gObj.Status==stval){
			    tims.showResult(gObj,stval); 
			 } 
             else{
			   if(STATUS_TYPE.executed==stval){	 
					if(object.val==gObj.FldrTitle && (gObj.Status==STATUS_TYPE.passed||gObj.Status==STATUS_TYPE.failed||gObj.Status==STATUS_TYPE.passedexp)){  
					   tims.showResult(gObj,gObj.Status);
					}
			   }else if(STATUS_TYPE.total==stval && object.val==gObj.FldrTitle && gObj.Status!=null){
				   tims.showResult(gObj,gObj.Status);
			   }else if(STATUS_TYPE.defects==stval && object.val==gObj.FldrTitle && gObj.Defects!=null){
   tims.showResult(gObj,gObj.Status);
   }
            }			 
		});
       if(object.child.length!=0){
		   tims.findResult(object.child,glbObj,stval); 
	   }	
  });
}
tims.showResult=function(valObj,stval){
	var result={};
	 result.Title=valObj.Title;
	 result.Type="Result";
	 result.Gid=valObj.GID;
	 result.Status=tims.findStatus(stval);
	 if(valObj.Defects!=null){
	    var defect='';
		for(i=0;i<valObj.Defects.length;i++){
		 if(i>0){
	      defect+=",";
	     }
	     defect+=valObj.Defects[0];
	 }
	 result.defects=defect;
  }else{result.defects='';}
  resultDataset.rows.add([result]).draw();
}
tims.Close=function(){
   $('#resultDialog').dialog("close");
}
tims.resultTable=function(){
   resultDataset=$('#resultDataset').DataTable({
	     
         "columns":[
	     { "title":"Entity Title",
		   "data":null,
		   "render":function(data){
		      return data.Title;
		    }
		 },
		 {"title":"Type",
		  "data":null,
		  "render":function(data){
              return data.Type;
           }
		  },
		  {
		    "title":"ID",
			"data":null,
			"render":function(data){
			   return data.Gid;
			}
		  },
		 {"title":"Status",
		  "data":null,
		  "render":function(data){
              return data.Status;
           }
		  },
		  {"title":"Defects",
		   "data":null,
		   "render":function(data){
			 return data.defects;
		   }
		  }		  
		 ],
		 
		 "createdRow": function ( row, data, index ) {
			$('td', row).eq(0).addClass('link-normal');
			$('td', row).eq(0).html("<img src='images/objects/result.gif'>"+data.Title);
			if(data.Gid != ""){
			$('td', row).eq(2).addClass('link-normal');
			
			}
			if(data.defects==""){
			$('td', row).eq(4).html('.');
			}else{
			$('td', row).eq(4).addClass('link-normal');
			}
		    if(data.Status == "Passed"){
			//$('td', row).eq(3).html("<img src='images/status/passed.gif'><span> </span>"+data.Status);
			$('td', row).eq(3).addClass('greenColor');
			}
			if(data.Status == "Failed"){
			//$('td', row).eq(3).html("<img src='images/status/failed.gif'><span> </span>"+data.Status);
			$('td', row).eq(3).addClass('redColor');
			}
			if(data.Status == "Pending"){
			$('td', row).eq(3).addClass('blueColor');
			//$('td', row).eq(3).html("<img src='images/status/pending.gif'><span> </span>"+data.Status);
			}
			if(data.Status == "Passed Exception"){
			$('td', row).eq(3).addClass('yellowColor');
			//$('td', row).eq(3).html("<img src='images/status/passex.gif'><span> </span>"+data.Status);
			}
			if(data.Status == "Bloked"){
			$('td', row).eq(3).addClass('orangeColor');
			//$('td', row).eq(3).html("<img src='images/status/blocked.gif'><span> </span>"+"Blocked");
			}
			if(data.Status == "Dropped"){
			$('td', row).eq(3).addClass('purpleColor');
			//$('td', row).eq(3).html("<img src='images/status/dropped.gif'><span> </span>"+data.Status);
			}
           }
   });
}

tims.exportExcel=function(_targetObjId,_targetObjId1){
 $("#"+_targetObjId1).attr("href",'data:Application/vnd.ms-excel,'+ encodeURIComponent($('#'+_targetObjId).html()))[0].click()
}
		