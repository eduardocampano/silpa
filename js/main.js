var params = {
  tables: 14,
  currentTable: 0,
  currentQuestion: -1
};
var questions = [
  { q: "¿Cuál es el color preferido de Silvina?", o: [ "Verde", "Amarillo", "Azul" ], a: 1 },
  { q: "¿A qué edad salió Pablo del closet?", o: [ "15", "18", "Hoy" ], a: 0 },
  { q: "¿Quién se tomó todo el vino?", o: [ "La mona Gimenez", "Silchu", "Pablo" ], a: 2 },
  { q: "¿Cual de estas prendas no usaria pablo?", o: [ "Pollera", "Zapatos con taco", "Medias de red" ], a: 0 }
];

$().ready(function() {

  var nextTable = function() {
    params.currentTable++;
    params.currentQuestion = -1;
    next();
  };

  var showQuestion = function() {
    var question = questions[params.currentQuestion];
    $('#question').text(question.q);
    $('#answers').empty();
    for (var i in question.o) {
      var value = question.o[i];
      $('#answers').append($('<button />').addClass('btn btn-danger').text(value));
    }

    $('#prev').toggle(params.currentQuestion > 0);
    $('#next').attr('disabled', 'disabled').toggle(params.currentQuestion <= questions.length);
  };

  var next = function() {
    if (params.currentQuestion == questions.length)
      nextTable();

    params.currentQuestion++;
    showQuestion();
  };

  var prev = function() {
    params.currentQuestion--;
    showQuestion();
  };

  $('#next').click(next);
  $('#prev').click(prev);
  $('#answers').on('click', 'button', function() {
    $('#next').removeAttr('disabled');
  });

  nextTable();

  document.documentElement.requestFullscreen();
});
