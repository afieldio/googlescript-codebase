function onOpen() {
  var ui = SpreadsheetApp.getUi();
  //Or DocumentApp or FormApp.
  ui.createMenu('Update')
      .addItem('Update Tickets', 'myFunction')
      .addToUi();
}

function myFunction() {
  getTickets();
}


function getJson(page){
   
   var baseUrl = "https://api3.codebasehq.com/";
   
   //update the project name - this has been done for ZOO
   var project = "{Enter Project Name}/tickets/?page=" 

  
   //Needs to be this way round so that it inserts new tickets at the bottom
   var sortAndOrder = '&query=sort:number order:asc';
   
   var codebase_api_url = baseUrl + project + page + sortAndOrder
   
   //Enter in your own info here - this can be found in Codebase > Settings > My Profile > API Credentials
   var api_username = "Enter Codebase Username"
   var api_key = "Enter Codebase Key"
   
   var headers = {
     "Accept":"application/json",
     "Authorization":"Basic " + Utilities.base64Encode(api_username + ":" + api_key),
   }
   
   var params = {
    headers: headers,
    muteHttpExceptions: true
   };
  
  var response = UrlFetchApp.fetch(codebase_api_url, params);
  
  var json = response.getContentText();

  return JSON.parse(json); 
}

    

function getTickets(){
  var i = 1;
  ticket = [];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("{Sheet Name}");
  
  do{
    var page = getJson(i++);
   
    for(var j = 0; j < page.length; j++){
      ticket.push(page[j])
    }
  
  } while (page.length > 0);
  
  var rowNo = 1
  
  //for(var k = ticket.length-1; k >= 0; k--){ //keeping for when they inevitably chang ethe ordering again
   for(var k = 0; k <= ticket.length-1; k++){
    rowNo++;
     
    //Creates the hyperlinked codebase ticket
    var cb_ticket_id = ticket[k]['ticket']['ticket_id'];
    var cb_url = "https://potato.codebasehq.com/projects/hardware-sites-support/tickets/"+cb_ticket_id;
    var semi = ";";
    var hyp = "=hyperlink(\"";
    var quot = "\"";
    var clos = ")";
    var cb_hyperlink = hyp  + cb_url + quot + semi + quot + cb_ticket_id + quot + clos;

    sheet.getRange(rowNo, 1).setValue(cb_hyperlink);
    
    if(ticket[k]['ticket']['priority'] == null){
     sheet.getRange(rowNo, 2).setValue('NA');
    }else{
     sheet.getRange(rowNo, 2).setValue(ticket[k]['ticket']['priority']['name']);
    }
    
    if(ticket[k]['ticket']['category'] == null){
     sheet.getRange(rowNo, 3).setValue('NA');
    }else{
     sheet.getRange(rowNo, 3).setValue(ticket[k]['ticket']['category']['name']);
    }

    var summary = ticket[k]['ticket']['summary'];    
    
    sheet.getRange(rowNo, 4).setValue(summary);
    
    //Ticket comes in the format [345] Ticket Summary
    //Numbers relate to client ticketing system

    var summaryRegEx = /^\[#(\d*)\]/;  
    var cgID = summaryRegEx.exec(summary);
    
    if(cgID == null){
      sheet.getRange(rowNo, 5).setValue('');
    }else{
      var cg_url = "https://code.google.com/a/google.com/p/android-webmaster/issues/detail?id="+cgID[1];
      var cg_hyperlink = hyp + cg_url + quot + semi + quot + cgID[1] + quot + clos;
      sheet.getRange(rowNo, 5).setValue(cg_hyperlink);
    }
    
    if(ticket[k]['ticket']['status'] == null){
       sheet.getRange(rowNo, 6).setValue('NA');
      }else{
       sheet.getRange(rowNo, 6).setValue(ticket[k]['ticket']['status']['name']);
      }
    
    var ms = ticket[k]['ticket']['milestone']['name'];
    var milestone = ms.toString();
    
    if( milestone == null){
     sheet.getRange(rowNo, 7).setValue('NA');
    }else{
     sheet.getRange(rowNo, 7).setValue(milestone);
    }
    
    if(ticket[k]['ticket']['deadline'] == null){
     sheet.getRange(rowNo, 8).setValue('');
    }else{
     var date = ticket[k]['ticket']['deadline']; //2015-12-21
     sheet.getRange(rowNo, 8).setValue(date);
    }
     
  } // End Ticket Loop

} //End Get Tickets