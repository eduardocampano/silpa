var params = {
  currentTable: 0,
  currentSlide: 0,
  finish: false,
  tables: []
};

var data = {
  tableCount: 3,
  questions: [
    { q: "¿Dónde nos conocimos?", o: [ "En casa de amigos", "En un boliche", "En el trabajo" ], a: 1 },
    { q: "¿Cómo le propuso matrimonio Pablo?", o: [ "Personalmente arrodillado", "Por un whatsapp a 10 mil KM de distancia", "Por teléfono" ], a: 1 },
    { q: "¿Quién cocina y lava?", o: [ "Pablo", "Silchu", "Entre los dos" ], a: 0 },
    { q: "¿Qué fecha figura en el anillo de compromiso?", o: [ "10-01", "14-01", "14-07" ], a: 1 },
    { q: "¿Cuántas veces viajaron a Mar del Plata?", o: [ "5", "1", "3" ], a: 2 },
    { q: "¿De que manera rápida lo despierta a Pablo?", o: [ "Con alarma fuerte al oído", "Le miente con la hora", "Le dice que esta el churrero" ], a: 2 },
    { q: "¿Son fanáticos de?", o: [ "Samsung", "LG", "Motorola" ], a: 1 },
    { q: "¿Quién elegió el lugar de luna de miel?", o: [ "Silchu", "Pablo" ], a: 1 }
  ]
};

var slider = null;

var showTable = function() {
  $('#table').text('Mesa ' + (params.currentTable + 1).toString());

  if (slider != null)
    slider.destroySlider();

  slider = $('#slider')
    .empty()
    .append(Mustache.render('\
        <li class="question">\
          <h1>Bienvenidos</h1>\
          <h3>Responda las siguientes preguntas con la ayuda de las personas en su mesa. Pulse comenzar para ver la primera pregunta</h3>\
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
          <h3>{{message}}</h3>\
        </li>', {
          message: params.currentTable === data.tableCount - 1 ?
            'Toque terminar para revelar al ganador' :
            'Toque terminar y pase la tablet a la mesa ' + (params.currentTable + 2)
        }))
    .bxSlider({
      pager: false,
      onSlideAfter: function($slideElement, oldIndex, newIndex) {
        params.currentSlide = newIndex;
        var table = params.tables[params.currentTable];
        if (isQuestionSlide() && table != undefined) {
          var selected = table.responses[newIndex];
          $slideElement.find('.question button:eq(' + selected + ')').addClass('selected');
        }
      }
    });

  prepareButtons();
};

var showResult = function() {
  var tablePoints = [];
  var maxPoints = -1;
  var tableMaxPoints;
  for (var i = 0; i < data.tableCount; i++) {
    var points = calculatePoints(i);
    tablePoints[i] = points;
    if (points > maxPoints) {
      maxPoints = points;
      tableMaxPoints = i;
    }
  }

  $('#table').text('');
  if (slider != null)
    slider.destroySlider();

  slider = $('#slider')
    .empty()
    .append(Mustache.render('\
        <li class="question">\
          <h1>Y el ganador es...</h1>\
        </li>'))
    .append(Mustache.render('\
        <li class="question">\
          <h1>GANADOR</h1>\
          <br/>\
          <h1>MESA {{winnerTable}}!!!</h1>\
        </li>', { winnerTable: tableMaxPoints + 1 }))
    .bxSlider({
      pager: false
    });

  prepareButtons();
};

var calculatePoints = function(table) {
  var points = 0;
  for (var i = 0; i < data.questions.length; i++) {
    points += params.tables[table].responses[i] === data.questions[i].a ? 1: 0;
  }
  return points;
};

var nextTable = function() {
  if (params.currentTable === data.tableCount - 1) {
    params.finish = true;
    saveCurrentStatus();
    showResult();
    return;
  }
  params.currentTable++;
  showTable();
};

var next = function() {
  if (isLastSlide()) {
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

var isFirstSlide = function() {
  return slider.getCurrentSlide() == 0;
};

var isLastSlide = function() {
  return slider.getCurrentSlide() == slider.getSlideCount() -1;
};

var isQuestionSlide = function() {
  return !isFirstSlide() && !isLastSlide();
};

var prepareButtons = function() {
  if (params.finish) {
    $('#prev').hide();
    if (!isLastSlide())
      $('#next').removeAttr('disabled').show().text('continuar');
    else
      $('#next').hide();
    return;
  }

  $('#prev').toggle(!isFirstSlide());
  var $next = $('#next');

  if (isQuestionSlide() && slider.getCurrentSlideElement().find('button.selected').length == 0)
    $next.attr('disabled', 'disabled');

  if (isFirstSlide())
    $next.text('comenzar');
  else if (isLastSlide())
    $next.text('terminar');
  else
    $next.html('siguiente &gt;');
};

var saveCurrentStatus = function(button) {
  if (button) {
    var currentSlide = slider.getCurrentSlide();
    if (isQuestionSlide()) {
      var selected = $(button).index();
      if (params.tables[params.currentTable] == undefined)
        params.tables.push({ table: params.currentTable + 1, responses: [] });
      params.tables[params.currentTable].responses[currentSlide - 1] = selected;
    }
  }
  localStorage.setItem('params', JSON.stringify(params));
};

$().ready(function() {

  FastClick.attach(document.body);

  $('#next').click(next);
  $('#prev').click(prev);
  $('#main').on('click', 'button', function() {
    $(this).parent().find('button').removeClass('selected');
    $(this).addClass('selected');
    $('#next').removeAttr('disabled');
    saveCurrentStatus(this);
  });

  var savedParams = localStorage.getItem('params');
  if (savedParams != null) {
    var parsedSavedParams = JSON.parse(savedParams);
    if (confirm('Desea continuar con la mesa ' + (parsedSavedParams.currentTable + 1).toString() + '?')) {
      params = parsedSavedParams;
      if (params.finish) {
        showResult();
      } else {
        showTable();
        slider.goToSlide(params.currentSlide);
      }
    } else {
      showTable();
    }
  } else {
    showTable();
  }
});
