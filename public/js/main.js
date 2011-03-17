$(function(){
  $('a.join').click(function(){
    var self = this;
    var id = $(self).parents('div.entry').attr('id');
    //$(self).html('<img src="/images/loading.gif" />');
    $(self).text('登録中');
    $.get('/join?id='+id, 'json').then(function(res){
      console.log(res);
      if(!res.error){
        $(self).text('参加済');
      }
    }, function(){
    })
  });
  $('li.togglejoinlist').click(function(){
     $(this).parents('div.entry').children('ul.helpers').toggle()
  });

});

