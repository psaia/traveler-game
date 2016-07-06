/*eslint-disable */
(function(w, d, b, gebi, qs) {
  var WAIT_TO_SEE_TIME = 1300;
  var streetViewService = new google.maps.StreetViewService();
  var views = {
    intro: gebi('intro').innerHTML,
    board: gebi('board').innerHTML,
    choose: gebi('choose').innerHTML
  };
  var confidence = [
    'Focus.',
    'Where you at, bro?',
    'Ready?',
    'Do, or do not, there is no try.',
    'Where did I park?',
    'Holy cow!',
    'Cleanup on aisle four.',
    'Yeah, piece of cake!',
    'So lost...',
    'Who wants some?',
    'Trust no one.',
    'Trust no one.',
    'Sh*t.',
    'Dead phone, great...',
    'Last night was nuts.',
    'F*ck.',
    'Where are you?'
  ];
  function Drunkifyer(streetView) {
    this.streetView = streetView;
    this.pitch = {};
    this.heading = {};
    this.update = this.update.bind(this);
  }
  Drunkifyer.prototype.ease = function(t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  };
  Drunkifyer.prototype.start = function() {
    this.reset('pitch').reset('heading');
    this.stopped = false;
    this.update();
    return this;
  };
  Drunkifyer.prototype.stop = function() {
    this.stopped = true;
    cancelAnimationFrame(this.rid);
    this.rid = null;
    this.pitch = {};
    this.heading = {};
    return this;
  };
  Drunkifyer.prototype.reset = function(_id) {
    var duration;
    var amount;
    if (_id === 'pitch') { // y
      amount = getRandomNum(-10, 10);
      duration = getRandomNum(800, 1800);
    } else {
      amount = getRandomNum(-50, 50);
      duration = getRandomNum(2000, 5000);
    }
    this[_id].duration = duration;
    this[_id].direction = Math.round(getRandomNum(0, 1));
    this[_id].startTime = +(new Date());
    this[_id].startPos = this.streetView.getPov()[_id];
    this[_id].endPos = this[_id].direction ? this[_id].startPos - amount : this[_id].startPos + amount;
    return this;
  };
  Drunkifyer.prototype.update = function() {
    var pov = {};
    var elapsed1 = +(new Date()) - this.heading.startTime;
    var startPos1 = Number(this.heading.startPos);
    var duration1 = Number(this.heading.duration);
    var change1 = (this.heading.endPos - this.heading.startPos);
    var headingVal = this.ease(elapsed1, startPos1, change1, duration1);
    var elapsed2 = +(new Date()) - this.pitch.startTime;
    var startPos2 = Number(this.pitch.startPos);
    var duration2 = Number(this.pitch.duration);
    var change2 = (this.pitch.endPos - this.pitch.startPos);
    var pitchVal = this.ease(elapsed2, startPos2, change2, duration2);
    if (elapsed1 >= this.heading.duration) {
      this.reset('heading');
      pov.heading = this.heading.startPos;
    } else {
      pov.heading = headingVal;
    }
    if (elapsed2 >= this.pitch.duration) {
      this.reset('pitch');
      pov.pitch = this.pitch.startPos;
    } else {
      pov.pitch = pitchVal;
    }
    this.streetView.setPov(pov);
    this.rid = requestAnimationFrame(this.update);
  };
  function View() {
    b.innerHTML = views[arguments[0]];
  }
  View.prototype.destroy = function() {
    b.innerHTML = '';
  };
  function howMuchDaddy(dist) {
    if (dist < 500) {
      return 'Nice! Sit back and chill.';
    }
    if (dist < 1500) {
      return 'Pretty good. You must drink 1 sip.';
    }
    if (dist < 2500) {
      return 'Not bad. Take 2 (sips) to the face.';
    }
    if (dist < 3000) {
      return 'You must drink 3 sips.';
    }
    if (dist < 4000) {
      return 'You must drink 4 sips.';
    }
    if (dist < 3999) {
      return 'You must drink 5 sips.';
    }
    return 'You must drink 6 sips and get out more...';
  }
  function rad(x) {
    return x * Math.PI / 180;
  };
  function getDistance(p1, p2) {
    var R = 6378137;
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return (d * 0.000621371192).toFixed(1);
  };
  function getRandomPlace() {
    var place = window.places[
      Math.floor(Math.random() * window.places.length)
    ];
    return new google.maps.LatLng(place[0], place[1]);
  }
  function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
  }
  function nearestStreetView(latLng, fn) {
    var radius = 50;
    function _find(data, status) {
      if (radius > 5000) {
        latLng = getRandomPlace();
      }
      if (status == google.maps.StreetViewStatus.OK) {
        return fn(data.location.latLng);
      }
      radius += 1000;
      streetViewService.getPanoramaByLocation(latLng, radius, _find);
    }
    streetViewService.getPanoramaByLocation(latLng, radius, _find);
  }
  function countdown(fn) {
    var cur = 10;
    var el = qs('.countdown');
    function _countdown() {
      if (cur === 1) {
        return fn();
      }
      el.innerHTML = --cur;
      setTimeout(_countdown, WAIT_TO_SEE_TIME);
    }
    setTimeout(_countdown, WAIT_TO_SEE_TIME);
  }
  function resetButton(el) {
    var reset = d.createElement('button');
    reset.className = 'reset';
    reset.innerHTML = 'Do it again!';
    el.appendChild(reset);
    return reset;
  }
  var bouncer = {
    _: null,
    add: function(streetView) {
      bouncer._ = new Drunkifyer(streetView).start();
    },
    destroy: function() {
      if (bouncer._) {
        bouncer._.stop();
        bouncer._ = null;
      }
    },
    start: function() {
      if (bouncer._ && bouncer._.stopped === true) {
        bouncer._.start();
      }
    },
    stop: function() {
      if (bouncer._) {
        bouncer._.stop();
      }
    },
  };
  var events = {
    _: [],
    register: function(el, type, listener) {
      var types = type.split(',');
      for (var i = 0, len = types.length; i < len; i++) {
        el.addEventListener(types[i], listener, false);
        events._.push([el, types[i], listener]);
      }
      return events.register;
    },
    destroy: function() {
      var a = events._;
      for (var i = 0, len = a.length; i < len; i++) {
        a[i][0].removeEventListener(a[i][1], a[i][2], false);
      }
      obj = null;
      events._ = [];
      return events.register;
    }
  };
  var controller = {
    _: null,
    _reset: function() {
      events.destroy();
      if (controller._) {
        controller._.destroy();
        controller._ = null;
      }
    },
    intro: function() {
      controller._reset();
      controller._ = new View('intro');
      events.register(qs('button'), 'click,touchstart', function(e) {
        controller.board();
        e.stopPropagation();
      });
    },
    board: function() {
      controller._reset();
      controller._ = new View('board');
      qs('.load-message').innerHTML = confidence[
        Math.floor(Math.random() * confidence.length)
      ];
      nearestStreetView(getRandomPlace(), function(latlng, name) {
        var loadedHack = false;
        var map = new google.maps.Map(qs('.map'), {
          center: latlng,
          zoom: 10,
          disableDefaultUI: true
        });
        var streetView = map.getStreetView();

        var onLoaded = function() {
          if (loadedHack) {
            return;
          }
          loadedHack = true;

          setTimeout(function() {
            qs('.load-message').innerHTML = '';
          }, 500);

          countdown(function() {
            controller.choose(latlng, name);
            pano = null;
            map = null;
          });
        };
        streetView.setOptions({
          disableDefaultUI: true,
          zoom: 0,
          enableCloseButton: false,
          position: latlng,
          visible: true
        });
        bouncer.add(streetView);
        events.register(document, 'mousedown,touchstart,touchmove', function() {
          bouncer.stop();
        });
        events.register(document, 'touchend,mouseup,touchcancel,touchleave', function() {
          bouncer.start();
        });
        google.maps.event.addListenerOnce(map, 'tilesloaded', onLoaded);
        google.maps.event.addListenerOnce(map, 'bounds_changed', onLoaded);
      });
    },
    choose: function(prevlatlng, name) {
      controller._reset();
      controller._ = new View('choose');
      bouncer.destroy();

      var loadedHack = false;
      var initialBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(67.90242, -155.88501),
        new google.maps.LatLng(-53.70646, 147.16187)
      );
      var map = new google.maps.Map(qs('.map'), {
        center: new google.maps.LatLng(16.02998, 21.30249),
        styles: window.mapstyle,
        minZoom: 1,
        backgroundColor: '#2a2a2a',
        disableDefaultUI: true,
        zoomControl: true,
        draggableCursor: 'crosshair',
        zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_CENTER,
          style: google.maps.ZoomControlStyle.LARGE
        }
      });
      var onLoaded = function() {
        if (loadedHack) {
          return;
        }
        loadedHack = true;
        google.maps.event.addListener(map, 'click', function(e) {
          var el = qs('.choose');
          var instructions = qs('.instructions');
          var distance = getDistance(e.latLng, prevlatlng);
          var answerWindow = new google.maps.InfoWindow({
            zIndex: 1,
            disableAutoPan: true,
            content: '<h1 class="here">You were here!</h1>'
          });
          var userWindow = new google.maps.InfoWindow({
            zIndex: 100,
            disableAutoPan: true,
            content: '<h1>Your Guess</h1><h4><b>Distance:</b>&nbsp;' +
              distance +
              ' Miles Away</h4>' +
              '<h5><b>' + howMuchDaddy(parseFloat(distance)) + '</b></h5>'
          });
          var userMarker = new google.maps.Marker({
            position: e.latLng,
            icon: {
              path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
              fillColor: 'yellow',
              strokeColor: 'yellow',
              strokeWeight: 10,
              scale: 10
            },
            map: map
          });
          var answerMarker = new google.maps.Marker({
            position: prevlatlng,
            map: map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: 'yellow',
              strokeColor: 'yellow',
              strokeWeight: 10,
              scale: 10
            }
          });
          var line = new google.maps.Polyline({
            path: [
              prevlatlng,
              e.latLng
            ],
            icons: [{
              icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 2
              },
              offset: '0',
              repeat: '15px'
            }],
            strokeColor: "yellow",
            geodesic: true,
            strokeOpacity: 0,
            map: map
          });

          el.removeChild(instructions);

          answerWindow.open(map, answerMarker);
          userWindow.open(map, userMarker);
          map.setOptions({
            zoom: 3,
            center: e.latLng,
            draggableCursor: 'url(http://maps.google.com/mapfiles/openhand.cur), move'
          });
          events.register(resetButton(el), 'click,touchstart', function(e) {
            map = null;
            line = null;
            answerMarker = null;
            answerWindow = null;
            userWindow = null;
            userMarker = null;
            reset = null;
            controller.board();
            e.preventDefault();
          });
          google.maps.event.clearInstanceListeners(map);
        });
      };

      map.fitBounds(initialBounds);
      google.maps.event.addListenerOnce(map, 'tilesloaded', onLoaded);
      google.maps.event.addListenerOnce(map, 'bounds_changed', onLoaded);
    }
  };
  google.maps.event.addDomListener(window, 'load', controller.intro);
})(
  window,
  document,
  document.getElementById('app'),
  function(a) {
    return document.getElementById(a);
  },
  function(a) {
    return document.querySelector(a);
  }
);

window.mapstyle = [{"featureType":"water","stylers":[{"color":"#0e171d"}]},{"featureType":"landscape","stylers":[{"color":"#1e303d"}]},{"featureType":"road","stylers":[{"color":"#1e303d"}]},{"featureType":"poi.park","stylers":[{"color":"#1e303d"}]},{"featureType":"transit","stylers":[{"color":"#182731"},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"color":"#f0c514"},{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#1e303d"},{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#e77e24"},{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#94a5a6"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"simplified"},{"color":"#e84c3c"}]},{"featureType":"poi","stylers":[{"color":"#e84c3c"},{"visibility":"off"}]}];
