//var addNumbersLocal=function(){
   // var firstNumber=$('#firstNumber').val();
  //  var secondNumber=$('#secondNumber').val();
   // var sum=firstNumber+secondNumber;
  //  $( "#result" ).html(sum);
//}

// this function waits for the page to be loaded, this is because if we need
// to bind elements, they need to exist first.
//$(document).ready(function(){
 //   console.log('The paga has now loaded')
  //  $('#adderButton').bind('click',addNumbersLocal)
//});


var NumberplateRemote=function(){
    var plate1=$('#plate1').val();

    // these are your GET parameters
    var data={
        plate1:plate1
    }

    $("#result").html('Loading - Please Wait');
    $("body").css("cursor", "progress");

    //this is our ajax call
    $.get("/uploadrego", data,function(result) {
        $("#result").html(result);
        $("body").css("cursor", "default");

          if ('speechSynthesis' in window) { // Chrome only !
           
            if (result.includes("Rego does not exist")){
            var speech = new SpeechSynthesisUtterance('Sorry, could not find details regarding this registration number' );
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
            }

           else if (result.includes("Rego is")){
              var speech = new SpeechSynthesisUtterance('Vehicle details found' );
              speech.lang = 'en-US';
              window.speechSynthesis.speak(speech);
              }
          }
      });
}

$(document).ready(function(){
  console.log('The page has now loaded')
  $('#submitButton').bind('click touch',NumberplateRemote)
});



var ImageuploadRemote=function(){

  var file = $('#file').val();

  var data={
    file:file
}

    $("#result").html('Loading - Please Wait');
    $("body").css("cursor", "progress");

 //   this is our ajax call
    $.post("/upload", data,function(result) {
       $("#result").html(result);
        $("body").css("cursor", "default");
        
      });
}

$(document).ready(function(e){

  $("#uploadimage").on('submit',(function(e) {
    $("#result").html('Loading - Please Wait');
    $("body").css("cursor", "progress");
		e.preventDefault();
		$.ajax({
        	url: "/upload",
			type: "POST",
			data:  new FormData(this),
			beforeSend: function(){$("#body-overlay").show();},
			contentType: false,
    	    processData:false,
			success: function(data)
		    {
			$("#result").html(data);
      $("#result").css('opacity','1');
      $("body").css("cursor", "default");

      if ('speechSynthesis' in window) { // Chrome only !
           
        if (data.includes("Rego does not exist")){
        var speech = new SpeechSynthesisUtterance('Sorry, could not find details regarding this registration number' );
        speech.lang = 'en-US';
        window.speechSynthesis.speak(speech);
        }

       else if (data.includes("Rego is")){
          var speech = new SpeechSynthesisUtterance('Vehicle details found' );
          speech.lang = 'en-US';
          window.speechSynthesis.speak(speech);
          }
      }
      
			},
		  	error: function() 
	    	{
	    	} 	        
	   });
	}));

});

$(document).ready(function(e){

  $("#captureimage").on('submit',(function(e) {
    $("#result").html('Loading - Please Wait');
    $("body").css("cursor", "progress");
		e.preventDefault();
		$.ajax({
        	url: "/upload",
			type: "POST",
			data:  new FormData(this),
			beforeSend: function(){$("#body-overlay").show();},
			contentType: false,
    	    processData:false,
			success: function(data)
		    {
			$("#result").html(data);
      $("#result").css('opacity','1');
      $("body").css("cursor", "default");

      if ('speechSynthesis' in window) { // Chrome only !
           
        if (data.includes("Rego does not exist")){
        var speech = new SpeechSynthesisUtterance('Sorry, could not find details regarding this registration number' );
        speech.lang = 'en-US';
        window.speechSynthesis.speak(speech);
        }

       else if (data.includes("Rego is")){
          var speech = new SpeechSynthesisUtterance('Vehicle details found' );
          speech.lang = 'en-US';
          window.speechSynthesis.speak(speech);
          }
      }
      
			},
		  	error: function() 
	    	{
	    	} 	        
	   });
	}));

});



