$.fn.splitter = function (callback) {
  var $document = $(document),
      $blocker = $('<div class="block"></div>');
      // blockiframe = $blocker.find('iframe')[0];
      
  var splitterSettings = JSON.parse(localStorage.getItem('splitterSettings') || '[]');
  return this.each(function () {
    var $el = $(this), 
        guid = $.fn.splitter.guid++,
        $parent = $el.parent(),
        $prev = $el.prev(),
        $handle = $('<div class="resize"></div>'),
        dragging = false,
        width = $parent.width(),
        left = $parent.offset().left,
        settings = splitterSettings[guid] || {},
        $body = $('body'),
        props = {
          x: {
            currentPos: $parent.offset().left,
            cssProp: 'left',
            otherCssProp: 'right',
            size: $parent.width(),
            sizeProp: 'width',
            moveProp: 'pageX',
            init: {
              top: 0,
              bottom: 0,
              width: 4,
              height: '100%',
              left: 'auto',
              right: 'auto',
              opacity: 0,
              position: 'absolute',
              cursor: 'ew-resize',
              border: 0,
              'border-left': '1px solid rgba(218, 218, 218, 0.5)',
              'z-index': 99999
            }
          },
          y: {
            currentPos: $parent.offset().top,
            size: $parent.height(),
            cssProp: 'top',
            otherCssProp: 'bottom',
            size: $parent.height(),
            sizeProp: 'height',
            moveProp: 'pageY',
            init: {
              top: 'auto',
              cursor: 'ns-resize',
              bottom: 'auto',
              height: 4,
              width: '100%',
              left: 0,
              right: 0,
              opacity: 0,
              position: 'absolute',
              border: 0,
              'border-top': '1px solid rgba(218, 218, 218, 0.5)',
              'z-index': 99999
            }
          }
        },
        type = 'x';
      
    var tracker = {
      down: { x: null, y: null },
      delta: { x: null, y: null },
      track: false
    };
    $handle.bind('mousedown', function (event) {
      tracker.down.x = event.pageX;
      tracker.down.y = event.pageY;
      tracker.delta = { x: null, y: null };
      tracker.target = $handle[type == 'x' ? 'height' : 'width']() * 0.3;
    });
    
    $document.bind('mousemove', function (event) {
      if (dragging) {
        tracker.delta.x = tracker.down.x - event.pageX;
        tracker.delta.y = tracker.down.y - event.pageY;
        var targetType = type == 'x' ? 'y' : 'x';
        if (Math.abs(tracker.delta[targetType]) > tracker.target) {
          $handle.trigger('change', targetType, event[props[targetType].moveProp]);
        }
      }
    });
    
    function moveSplitter(pos) {
      var v = pos - props[type].currentPos,
          split = 100 / props[type].size * v;

      if (split > 10 && split < 90) {
        $el.css(props[type].cssProp, split + '%');
        $prev.css(props[type].otherCssProp, (100 - split) + '%');
        var css = {};
        css[props[type].cssProp] = split + '%';
        $handle.css(css);
        settings[type] = pos;
        splitterSettings[guid] = settings;
        localStorage.setItem('splitterSettings', JSON.stringify(splitterSettings));
        // editors.javascript.refresh();
        // editors.html.refresh();
        if (callback) {
          callback(type, $prev, $el);
        }
      }
    }

    $document.bind('mouseup touchend', function () {
      dragging = false;
      $blocker.remove();
      $handle.css('opacity', '0');
    }).bind('mousemove touchmove', function (event) {
      if (dragging) {
        moveSplitter(event[props[type].moveProp] || event.originalEvent.touches[0][props[type].moveProp]);
      }
    });
    
    $blocker.bind('mousemove touchmove', function (event) {
      if (dragging) {
        moveSplitter(event[props[type].moveProp] || event.originalEvent.touches[0][props[type].moveProp]);
      }
    });
    
    $handle.bind('mousedown touchstart', function (e) {
      dragging = true;
      $body.append($blocker);
      
      // TODO layer on div to block iframes from stealing focus
      props[type].size = $parent[props[type].sizeProp]();
      props[type].currentPos = $parent.offset()[props[type].cssProp];
      // width = $parent.width();
      // left = $parent.offset().left;
      $document.trigger('sizeeditors');
      e.preventDefault();
    }).hover(function () {
      $handle.css('opacity', '1');
    }, function () {
      if (!dragging) {
        $handle.css('opacity', '0');
      }
    });
    
    $handle.bind('init', function (event, x) {
      $handle.css(props[type].init);
      $blocker.css('cursor', type == 'x' ? 'ew-resize' : 'ns-resize');

      if (type == 'y') {
        $el.css('border-right', 0);
        $prev.css('border-right', 0);
      } else {
        // $el.css('border-right', '1px solid #ccc');
        $prev.css('border-right', '1px solid #ccc');
      }

      if ($el.is(':hidden')) {
        $handle.hide();
      } else {
        $el.css('border-' + props[type].cssProp, '1px solid #ccc');
        moveSplitter(x || $el.offset()[props[type].cssProp]);
      }
    }); //.trigger('init', settings.x || $el.offset().left);

    $handle.bind('change', function (event, toType, value) {
      $el.css(props[type].cssProp, '0');
      $prev.css(props[type].otherCssProp, '0');
      $el.css('border-' + props[type].cssProp, '0');

      type = toType;

      // if (type == 'y') {
        var $tmp = $el;
        $el = $prev;
        $prev = $tmp;
      // } else {

      // }

      $el.css(props[type].otherCssProp, '0');
      $prev.css(props[type].cssProp, '0');
      // TODO
      // reset top/bottom positions
      // reset left/right positions

      $handle.trigger('init', value || $el.offset()[props[type].cssProp] || props[type].size / 2);
    });

    $prev.css('width', 'auto');
    $prev.css('height', 'auto');
    $el.data('splitter', $handle);
    $el.before($handle);

  });
};

$.fn.splitter.guid = 0;
