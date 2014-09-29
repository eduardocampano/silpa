var params = {
  tableCount: 14,
  currentTable: 0,
  tables: []
};
var data = {
  questions: [
    { q: "¿Cuál es el color preferido de Silvina?", o: [ "Verde", "Amarillo", "Azul" ], a: 1 },
    { q: "¿A qué edad salió Pablo del closet?", o: [ "15", "18", "Hoy" ], a: 0 },
    { q: "¿Quién se tomó todo el vino?", o: [ "La mona Gimenez", "Silchu", "Pablo" ], a: 2 },
    { q: "¿Cual de estas prendas no usaria pablo?", o: [ "Pollera", "Zapatos con taco", "Medias de red" ], a: 0 }
  ]
};

var slider = null;

$().ready(function() {

  var showTable = function() {
    $('#table').text('Mesa ' + (params.currentTable + 1).toString());

    if (slider != null)
      slider.destroySlider();

    slider = $('#slider')
      .empty()
      .append(Mustache.render('\
        <li class="question">\
          <h1>Bienvenidos</h1>\
          <h4>Responda las siguientes preguntas con la ayuda de las personas en su mesa. Pulse comenzar para ver la primera pregunta</h4>\
        </li>', params))
      .append(Mustache.render('\
        {{#questions}}\
        <li class="question">\
          <h1>{{q}}</h1>\
          <div class="btn-group-vertical btn-group-lg answers">\
          {{#o}}\
            <button class="btn btn-danger">{{.}}</button>\
          {{/o}}\
          </div>\
        </div>\
        {{/questions}}', data))
      .append(Mustache.render('\
        <li class="question">\
          <h1>GRACIAS</h1>\
          <h4>Toque terminar y entregue la tablet a la mesa {{nextTable}}</h4>\
        </li>', { nextTable: params.currentTable + 2 }))
      .bxSlider({
        pager: false
      });

    prepareButtons();
  };

  var nextTable = function() {
    params.currentTable++;
    showTable();
  };

  var next = function() {
    if (slider.getCurrentSlide() == slider.getSlideCount() -1) {
      nextTable();
      return;
    }

    slider.goToNextSlide();
    prepareButtons();
  };

  var prev = function() {
    slider.goToPrevSlide();
    prepareButtons();
  };

  var prepareButtons = function() {
    var currentSlide = slider.getCurrentSlide();
    $('#prev').toggle(currentSlide > 0);
    var $next = $('#next');

    if (currentSlide > 0 && currentSlide < slider.getSlideCount() - 1)
      $next.attr('disabled', 'disabled');

    if (slider.getCurrentSlide() == 0)
      $next.text('comenzar');
    else if (slider.getCurrentSlide() == slider.getSlideCount() -1)
      $next.text('terminar');
    else
      $next.html('siguiente &gt;');
  };

  var saveCurrentStatus = function(button) {
    var currentSlide = slider.getCurrentSlide();
    if (currentSlide > 0 && currentSlide < slider.getSlideCount() -1) {
      var selected = $(button).index();
      if (params.tables[params.currentTable] == undefined)
        params.tables.push({ table: params.currentTable + 1, responses: [] });

      params.tables[params.currentTable].responses[currentSlide - 1] = selected;
      localStorage.setItem('params', JSON.stringify(params));
    }
  };

  $('#next').click(next);
  $('#prev').click(prev);
  $('#main').on('click', 'button', function() {
    $(this).parent().find('button').removeClass('selected');
    $(this).addClass('selected');
    $('#next').removeAttr('disabled');
    saveCurrentStatus(this);
  });

  var savedParams = localStorage.getItem('params');
  if (savedParams != null)
    params = JSON.parse(savedParams);

  showTable();
});
