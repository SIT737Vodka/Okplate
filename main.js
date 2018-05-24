$(document).ready(function() {

  function reload() {
 //   $('.hidden').fadeOut();
    $('displayOutput').empty();
    $.post( '/usersr', function(data) {
      
 //---- the following is used for testing to show use login ----
 //     var rendered = "<ul>";
 //     data.forEach(function(item) {
 //           rendered = rendered + "<li> Id-User-Pwd <b>"+ item.id +"<b> and <b>"+ item.username +"</b> and <b>"+ item.password +"</b></li>"; 
 //     });
 //     rendered = rendered + "</ul>";
 //--------------------------------------------------------------	  
		if (data == '')  
		{var rendered = "<span>Incorrect Login! Please retry</span>"}
		else{
			sess = '1';
//----- detect mob browser and specify correct page --------------
			var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
				if (isMobile) {
					window.location.href = "OKPlateCaptureValidateMob.html";}
					else{
						window.location.href = "OKPlateUploadValidate.html";}
// --------------------------------------
//		window.location.href = "OKPlateCaptureValidate.html";
		}	
	  
      $('#displayOutput').html(rendered);
    });
 //   $('.hidden').fadeIn();
  }

  $('#add-user').submit(function(e) {
    e.preventDefault();

    $.ajax({
      url: '/users',
      type: 'POST',
      data: $(this).serialize(),
      success: function(data) {
        reload();
      }
    });
  });

  // load data on start
  //reload();

});
