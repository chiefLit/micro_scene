/**
 * 阻止默认事件
 */
(function forbidOverMove() {
  window.ontouchmove = function (e) {
    e.preventDefault && e.preventDefault();
    e.returnValue = false;
    e.stopPropagation && e.stopPropagation();
    return false;
  }
})();

/**
 * jq对象函数扩展
 */
$.fn.extend({
  /**
   * 设置Css3兼容
   * @param {String || Object} key    样式名称，支持对象方式调用
   * @param {String} value  样式值
   */
  css3: function (key, value) {
    var jThis = $(this),
      compatibleArr = ["", "webkit", "moz", "ms", "o"],
      cssObj = {},
      paramObj = {};

    if (typeof key == "object") {
      paramObj = key;
    } else {
      paramObj[key] = value;
    }

    for (var k in paramObj) {
      complieCss(k, paramObj[k]);
    }

    function complieCss(key, value) {
      for (var i = 0; i < compatibleArr.length; i++) {
        var item = compatibleArr[i];
        if (item) {
          cssObj[item + upperFirst(key)] = value;
        } else {
          cssObj[key] = value;
        }
      }

      function upperFirst(str) {
        str = str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1);
        return str;
      }
    }

    jThis.css(cssObj);
    return jThis;
  }
});

/**
 * 获取移动坐标信息
 */
function _fnGetTouchPosition(e) {
  var touches = e.changedTouches,
    oMove = {
      x: e.pageX,
      y: e.pageY
    };
  if (e.type.indexOf("touch") > -1) {
    oMove.x = touches[touches.length - 1].pageX;
    oMove.y = touches[touches.length - 1].pageY;
  }

  return oMove;
}

/**
 * 微场景
 * @param {object} options =  参数对象
 * {
 *     container         容器样式名
 *     unitPage          页面样式名
 *     currIndex         当前页索引。 （默认0）
 *     callBack          翻页回调函数
 *     touchMoveEffect   页面touchMove拖动效果false：没有，true: 有。 （默认没有推动效果）
 * }
 */
function Fn(options) {
  /**
   * 容器样式名
   * @type {String}
   */
  this.containerClassName = options.container;
  /**
   * 容器
   * @type {Array}
   */
  this.container = document.getElementsByClassName(this.containerClassName)[0];
  /**
   * 每一页的统一样式名
   * @type {String}
   */
  this.pageClassName = options.unitPage;
  /**
   * 页面们
   * @type {Array}
   */
  this.pages = document.getElementsByClassName(this.pageClassName);
  /**
   * 单页高度
   * @type {Number}
   */
  this.pageHeight = $(window).height();
  /**
   * 当前页索引
   * @type {Number}
   */
  this.currIndex = options.currIndex || 0;
  /**
   * 将条页索引
   * @type {Number}
   */
  this.nextIndex = null;
  /**
   * 是否在翻页中
   * @type {Boolean}
   */
  this.moving = false;
  /**
   * 移动高度
   * @type {Number}
   */
  this.moveHeight = 0;
  /**
   * 回调函数
   */
  this.callBack = options.callBack || function () {};
  /**
   * 页面touchMove拖动效果
   */
  this.touchMoveEffect = options.touchMoveEffect || false;

  this.init();
}

Fn.prototype = {
  /**
   * 初始化
   */
  init: function () {
    var _this = this;
    var currPage = $(_this.pages[_this.currIndex]);
    //给每一页设置高度
    for (var i = 0; i < _this.pages.length; i++) {
      $(_this.pages[i]).css({
        height: _this.pageHeight + 'px'
      })
    }
    //展示当前页
    $(currPage).show();
    //绑定touch
    _this.bindTouch();
    //绑定wheel
    _this.bindWheel();
    // 重置页面
    _this.resize();

    var timer = null;
    $(window).on("resize", function () {
      clearTimeout(timer);
      // 重置页面
      _this.resize();
    });

    // 添加动画
    _this.pageAction(_this.currIndex, 2);
  },
  /**
   * 展示nextPage
   */
  showPage: function () {
    var _this = this;
    _this.moving = true; //正在滚动

    // 页面差
    var delta = _this.nextIndex - _this.currIndex;
    var nextPage = $(_this.pages[_this.nextIndex]);
    var currPage = $(_this.pages[_this.currIndex]);

    // if (_this.touchMoveEffect) {
    _this.pageAction(_this.nextIndex, 2);
    // }

    _this.moveHeight -= delta * _this.pageHeight;

    nextPage.css3({
      'transform': 'translate3d(0, ' + (-delta * _this.pageHeight) + 'px, 0)',
      'transition': '-webkit-transform .5s',
      'z-index': '1'
    })
    setTimeout(function () {
      _this.pageAction(_this.currIndex, 1);
      _this.pageAction(2 * _this.nextIndex - _this.currIndex, 1);
      //next item 还原
      nextPage.css3({
        'transform': 'translate3d(0, 0, 0)',
        'transition': 'initial',
        'z-index': '0'
      });
      for (var i = 0; i < _this.pages.length; i++) {
        if (nextPage[0] != $(_this.pages[i])[0]) {
          $(_this.pages[i]).css3({
            'transform': 'translate3d(0, 0, 0)',
            'transition': 'initial',
          })
        }
      }
      // 同时整个页面平移
      $(_this.container).css3({
        'transform': 'translate3d(0, ' + _this.moveHeight + 'px, 0)',
      })
      _this.currIndex = _this.nextIndex
      _this.moving = false;
      _this.callBack(_this.currIndex)
    }, 500)
  },
  /**
   * 绑定touch事件
   */
  bindTouch: function () {
    var _this = this;
    var touchPosition,
      isTouchStart = false,
      historyIndex = 0;

    function start(event) {
      if (_this.moving) {
        return;
      }
      var oMove = _fnGetTouchPosition(event);
      touchPosition = oMove.y;
      isTouchStart = true;
    };

    function move(event) {
      event.preventDefault();
      if (_this.moving || !isTouchStart) {
        return;
      }
      var oMove = _fnGetTouchPosition(event);
      // 移动距离
      var touchMove = oMove.y - touchPosition;
      // 下滑
      if (touchMove >= 0 && _this.currIndex > 0) {
        _this.nextIndex = _this.currIndex - 1;
        var naxtPage = $(_this.pages[_this.nextIndex]);
        if (_this.touchMoveEffect) {
          _this.pageAction(_this.nextIndex, 2);
        }
        naxtPage.css({
          'transition': 'initial',
          'z-index': '1'
        })
      }
      // 上滑
      if (touchMove < 0 && _this.currIndex < _this.pages.length - 1) {
        _this.nextIndex = _this.currIndex + 1;
        var naxtPage = $(_this.pages[_this.nextIndex]);
        if (_this.touchMoveEffect) {
          _this.pageAction(_this.nextIndex, 2);
        }
        naxtPage.css({
          'transition': 'initial',
          'z-index': '1'
        })
      }
      if (_this.currIndex > 0 || _this.currIndex < _this.pages.length - 1) {
        _this.touchMoveEffect && naxtPage && naxtPage.css3({
          'transform': 'translate3d(0, ' + touchMove + 'px, 0)',
        });
      }
    }

    function end(event) {
      event.preventDefault();
      if (_this.moving || !isTouchStart) {
        return;
      }
      var oMove = _fnGetTouchPosition(event);
      // 移动距离
      var touchMove = oMove.y - touchPosition;
      if ((touchMove < 0 && _this.currIndex >= _this.pages.length - 1) || (touchMove >= 0 && _this.currIndex <= 0)) {
        return;
      }
      if (Math.abs(touchMove) > 50) {
        _this.showPage();
      } else {
        // 返回
        for (var i = 0; i < _this.pages.length; i++) {
          $(_this.pages[i]).css3({
            'transform': 'translate3d(0, 0, 0)',
            'transition': 'transform .5s',
          })
        }
      }
      isTouchStart = false;
    }
    //绑定
    function bind() {
      if (window.attachEvent) {
        //IE绑定事件方式
        // obj.attachEvent("on" + type, fn);
        _this.container.attachEvent("ontouchstart", function (e) {
          start(e);
        });
        _this.container.attachEvent("ontouchmove", function (e) {
          move(e);
        });
        _this.container.attachEvent("ontouchend", function (e) {
          end(e);
        });
        _this.container.attachEvent("onmousedown", function (e) {
          start(e);
        });
        _this.container.attachEvent("onmousemove", function (e) {
          move(e);
        });
        _this.container.attachEvent("onmouseup", function (e) {
          end(e);
        });
      } else if (window.addEventListener) {
        _this.container.addEventListener("touchstart", function (e) {
          start(e);
        }, false);
        _this.container.addEventListener("touchmove", function (e) {
          move(e);
        }, false);
        _this.container.addEventListener("touchend", function (e) {
          end(e);
        }, false);
        _this.container.addEventListener("mousedown", function (e) {
          start(e);
        }, false);
        _this.container.addEventListener("mousemove", function (e) {
          move(e);
        }, false);
        _this.container.addEventListener("mouseup", function (e) {
          end(e);
        }, false);
      }
    }
    bind();
  },
  /**
   * 鼠标滚轮绑定
   */
  bindWheel: function () {
    var _this = this;

    function wheelBinding(e) {
      if (e.preventDefault)
        e.preventDefault(); //阻止默认行为
      e.returnValue = false; //IE5到IE8 returnValue = false，也能阻止默认行为
      if (_this.moving) {
        return;
      }
      var nDelta = 0;
      e = e || window.event;
      if (e.wheelDelta) {
        /**
         * 其他浏览器，通过event.wheelDelta获取滚动值
         * 正数：向上滚动，负数：向下滚动  滚动一次值120
         */
        nDelta = e.wheelDelta / 120;
      } else if (e.detail) {
        /**
         * 针对火狐浏览器，通过event.detail获取滚动值
         * 正数：向下滚动，负数：向上滚动  滚动一次值3
         */
        nDelta = -e.detail / 3;
      }
      if (nDelta) {
        if (nDelta < 0) {
          if (_this.currIndex < _this.pages.length - 1) {
            _this.nextIndex = _this.currIndex + 1;
            _this.showPage();
          }
        } else {
          if (_this.currIndex > 0) {
            _this.nextIndex = _this.currIndex - 1;
            _this.showPage();
          }
        }
      }
    }
    if (window.addEventListener) { //针对火狐浏览器
      window.addEventListener('DOMMouseScroll', wheelBinding, false);
    }
    window.onmousewheel = document.onmousewheel = wheelBinding;
  },
  /**
   * 操作页面动画
   * @param  pageIndex 操作页面
   * @param  type      类型1：删除，2：添加
   */
  pageAction: function (pageIndex, type) {
    var _this = this;
    var actPage = $(_this.pages[pageIndex]);
    var actAction = actPage.find('[animate]');
    for (var i = 0; i < actAction.length; i++) {
      var animates = actAction.eq(i).attr('animate').split(' ');
      for (var j = 0; j < animates.length; j++) {
        if (type == 1) {
          actAction.eq(i).removeClass(animates[j])
        } else {
          actAction.eq(i).addClass(animates[j])
        }
      }
    }
  },
  /**
   * 重置页面
   */
  resize: function () {
    var _this = this,
      nWinWidth = $(window).width(),
      nWinHeight = $(window).height(),
      STATIC_WIDTH = 320,
      STATIC_HEIGHT = 568,
      ratioWidth = nWinWidth / STATIC_WIDTH,
      ratioHeight = nWinHeight / STATIC_HEIGHT;
    if (ratioWidth > ratioHeight) {
      $("html")[0].style["fontSize"] = (ratioHeight * 16) + "px";
    } else {
      $("html")[0].style["fontSize"] = (ratioWidth * 16) + "px";
    }
    if (nWinWidth / nWinHeight > 0.8) {
      $(_this.container).css({
        width: nWinHeight * 0.8
      });
    } else {
      $(_this.container).css({
        width: '100%'
      });
    }

    _this.pageHeight = $(window).height();
    for (var i = 0; i < _this.pages.length; i++) {
      $(_this.pages[i]).css({
        height: _this.pageHeight + 'px'
      })
    }
    _this.moveHeight = -_this.pageHeight * _this.currIndex;
    // 同时整个页面平移
    $(_this.container).css3({
      'transform': 'translate3d(0, ' + _this.moveHeight + 'px, 0)',
    })
  }
}
window.MicroScene = Fn;
// return Fn;