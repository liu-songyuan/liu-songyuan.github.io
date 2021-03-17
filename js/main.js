$(function(){

  /* Drop-down menu */
  $('#menu-nav-icon').click(function(){
    $('#main-nav').slideToggle()
  })
  $(window).on('resize', function (){
    if ($(window).width() > 768){
        $('#main-nav').show();
    }else{
        $('#main-nav').hide();
    }
  });

  /* Share */
  var shares = $("#social-share").children();
  var url = shares.first().attr('data-url');
  var encodedUrl = encodeURIComponent(url)

  shares.each(function(){
     this.href += encodedUrl;
  })

  /* Gallery Display */
  // Get a list of gallery ids
  var slideIndices = {};
  var galleries = $('.gallery');
  //console.log(galleries);
  //console.log(galleries[0]);

  $('.gallery').each(function(index){
    //console.log( index + ": " + $( this ).attr("id") );
    slideIndices[$(this).attr("id")] = 1;
  });
  //console.log(slideIndices);

  galleries.each(function(){
    showSlides($(this).attr("id"), 1);
  })


  function showSlides(id, n) {
    galleries.each(function(){
      var that = $(this);
      if(that.attr("id") == id){
        var slides = that.find('.mySlides');
        var dots = that.find('.demo');
        var captionText = that.find('.caption');
        console.log("Slide length is " + slides.length);
        if (n > slides.length){
          slideIndices[id] = 1;
          n = 1;
        }
        if (n < 1){
          slideIndices[id] = slides.length;
          n = slides.length;
        }
        console.log("n is "+ n);
        slides.each(function(index){
          if(index == (n-1)){
            console.log("here");
            $(this).css({"display": "block"});
          }else{
            $(this).css({"display": "none"});
          }
        })
        dots.each(function(index){
          if(index == (n-1)){
            $(this).addClass("display");
          }else{
            $(this).removeClass("display");
          }
        })
        var capText = $(dots[slideIndices[id]]).attr("alt");
        try{
          capText = capText.split('/').pop().replace(/\.[^/.]+$/, "");
        }catch(e){
          capText = $(dots[slideIndices[id]]).attr("alt");
        }
        captionText.html(capText);
      }
    })
  }

   /* install event function */
   $(".gallery .columns .column img").each(function(){
     $(this).click(function(){
       var key = $(this).attr("data-id");
       var num = $(this).attr("data-num");
       showSlides(key, slideIndices[key] = num);
     })
   });

   galleries.each(function(){
     $(this).find(".prev").click(function(){
       var key = $(this).attr("data-id");
       slideIndices[key] -=1;
       console.log("Index is " +  slideIndices[key]);
       showSlides(key, slideIndices[key]);
     })
   })
   galleries.each(function(){
     $(this).find(".next").click(function(){
       var key = $(this).attr("data-id");
       slideIndices[key] +=1;
       console.log("Index is " +  slideIndices[key]);
       showSlides(key, slideIndices[key]);
     })
   })
})
