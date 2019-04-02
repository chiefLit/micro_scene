$(document).ready(function () {

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

  var jPage = $(".page"),
    jPages = $(".pages"),
    jAudio_btn = $(".audio_btn"),
    jMedia = $("#media"),
    music = document.querySelector("audio"),
    isPlaying = false,
    nSum = 0;

  jAudio_btn.on('click', function (event) {
    event.preventDefault();
    if (isPlaying) {
      isPlaying = false;
      jAudio_btn.css3({
        'animation-play-state': 'paused'
      });
      music.pause();
    } else {
      if (nSum == 0) {
        jAudio_btn.addClass('rotate');
      } else {
        jAudio_btn.css3({
          'animation-play-state': 'running'
        });
      }
      isPlaying = true;
      music.play();
      nSum++;
    }
  });

  /**
   * 全屏滚动
   * @type {Object}
   */
  var pageScroll = {
    showType: 1, //1:覆盖，2：滑动

    isScroll: false, //是否在滚动中
    pageHeight: 0, //单页面高度
    activeIndex: 0, //当前索引
    activeHeight: 0, //滚动高度
    /**
     * 展示指定页
     * @param  {[type]} index 展示页的索引值
     * @return {[type]}       [description]
     */
    showPage: function (index) {
      var _this = this,
        _index = index;
      _this.isScroll = true; //正在滚动
      var prevPageIndex = _this.activeIndex;
      var D_value = _this.activeIndex - _index;
      var jAcitivePage = jPage.eq(_index);
      if (_this.showType == 1) {
        jAcitivePage.css3({
          'transform': 'translate3d(0, ' + (D_value * _this.pageHeight) + 'px, 0)',
          'transition': 'transform .5s',
          'z-index': '1'
        });
        //添加动画
        operateAni(_index, 2);
        _this.activeIndex = _index;
        _this.activeHeight = _this.activeHeight + (D_value * _this.pageHeight);
        setTimeout(function () {
          //移除前一页动画
          operateAni(prevPageIndex, 1);
          operateAni(2 * prevPageIndex - _index, 1);
          //next item 还原
          jAcitivePage.css3({
            'transform': 'translate3d(0, 0, 0)',
            'transition': 'initial',
            'z-index': '0'
          });
          // 同时整个页面平移
          jPages.css3({
            'transform': 'translate3d(0, ' + _this.activeHeight + 'px, 0)',
          })
          _this.isScroll = false;

        }, 500)
      } else if (_this.showType == 2) {
        jPages.css3({
          'transform': 'translate3d(0, ' + (D_value * _this.pageHeight + _this.activeHeight) + 'px, 0)',
          'transition': 'transform .5s',
        });
        operateAni(_index, 2);
        _this.activeIndex = _index;
        _this.activeHeight = _this.activeHeight + (D_value * _this.pageHeight);
        setTimeout(function () {
          //移除前一页动画
          operateAni(prevPageIndex, 1);
          operateAni(2 * prevPageIndex - _index, 1);
          jPages.css3({
            'transition': 'initial',
          });
          _this.isScroll = false;
        }, 500)
      }

    },
    /**
     * 初始化
     * @return {[type]} [description]
     */
    init: function () {
      this.pageHeight = $(window).height();
      //添加动画
      var jAcitivePage = jPage.eq(0);
      var jAcitivePageAni = jAcitivePage.find('[animate]');
      for (var i = 0; i < jAcitivePageAni.length; i++) {
        var arr = jAcitivePageAni.eq(i).attr("animate").split(" ");
        arr.forEach(function (item) {
          jAcitivePageAni.eq(i).addClass(item)
        })
      }
    }
  };
  pageScroll.init();

  /**
   * 操作页面动画
   * @param  {[type]} index  页面索引
   * @param  {[type]} action 移除动画：1，添加动画：2
   * @return {[type]}
   */
  function operateAni(index, action) {
    var jAcitivePage = jPage.eq(index);
    var jAcitivePageAni = jAcitivePage.find('[animate]');
    for (var i = 0; i < jAcitivePageAni.length; i++) {
      var arr = jAcitivePageAni.eq(i).attr("animate").split(" ");
      arr.forEach(function (item) {
        if (action == 1) {
          jAcitivePageAni.eq(i).removeClass(item)
        } else if (action == 2) {
          jAcitivePageAni.eq(i).addClass(item)
        }
      })
    }
  }


  //重置样式
  function setListSize() {
    var nWinWidth = $(window).width(),
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
      jPages.css({
        width: nWinHeight * 0.8
      });
    } else {
      jPages.css({
        width: '100%'
      });
    }
    pageScroll.init();
    pageScroll.activeHeight = -pageScroll.activeIndex * pageScroll.pageHeight;
    setTimeout(function () {
      jPages.css({
        transform: 'translate3d(0px,' + pageScroll.activeHeight + 'px, 0px)'
      });
    })
  }
  setListSize()

  var _timer;
  $(window).resize(function () {
    clearTimeout(_timer);
    _timer = setTimeout(function () {
      setListSize();
    }, 300);
  });


  /**
   * 获取移动坐标信息
   * 
   * @method
   * @reurn {void}
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
   * 绑定touch事件
   * @return {[type]} [description]
   */
  var touch = {
    isStart: false, //是否开始
    page: {}, //动画页，非索引页
    historyIndex: 0,
    /**
     * 开始
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    start: function (event) {
      if (pageScroll.isScroll == true) {
        return;
      }
      var _this = this,
        oMove = _fnGetTouchPosition(event),
        nIndex;
      _this.isStart = true;
      touchPosition = oMove.y;
      // touchPosition = event.changedTouches[0].screenY;
    },

    /**
     * 移动
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    move: function (event) {
      event.preventDefault();
      var _this = this,
        oMove = _fnGetTouchPosition(event),
        nIndex;
      if (pageScroll.isScroll == true || _this.isStart == false) {
        return;
      }
      var touchMove = oMove.y - touchPosition;
      // var touchMove = event.changedTouches[0].screenY - touchPosition;
      if (touchMove >= 0 && pageScroll.activeIndex > 0) {
        nIndex = pageScroll.activeIndex - 1;
        _this.page = jPage.eq(nIndex);
        pageScroll.showType == 1 && _this.page.css3({
          'transition': 'initial',
          'z-index': '1'
        });
      }
      if (touchMove < 0 && pageScroll.activeIndex < jPage.length - 1) {
        nIndex = pageScroll.activeIndex + 1;
        _this.page = jPage.eq(nIndex);
        pageScroll.showType == 1 && _this.page.css3({
          'transition': 'initial',
          'z-index': '1'
        });
      }
      if (pageScroll.activeIndex > 0 || pageScroll.activeIndex < jPage.length - 1) {
        //添加动画

        if (_this.historyIndex != nIndex) {
          operateAni(nIndex, 2)
          _this.historyIndex = nIndex
        }
        if (_this.page.css) {
          pageScroll.showType == 1 && _this.page.css3({
            'transform': 'translate3d(0, ' + touchMove + 'px, 0)',
          });
          pageScroll.showType == 2 && jPages.css3({
            'transform': 'translate3d(0, ' + (touchMove + pageScroll.activeHeight) + 'px, 0)',
            'transition': 'initial',
          });
        }
      }
    },

    /**
     * 结束
     * @param  {[type]} event [description]
     * @return {[type]}       [description]
     */
    end: function (event) {
      event.preventDefault();
      var _this = this,
        oMove = _fnGetTouchPosition(event),
        touchMove = oMove.y - touchPosition;;
      if (pageScroll.isScroll == true || _this.isStart == false) {
        return;
      }
      if (touchMove > 50) {
        if (pageScroll.activeIndex > 0) {
          pageScroll.showPage(pageScroll.activeIndex - 1);
          pageScroll.showType == 1 && jPage.eq(pageScroll.activeIndex + 1).css3({
            'transform': 'translate3d(0, 0, 0)'
          })
        }
      } else if (touchMove < -50) {
        if (pageScroll.activeIndex < jPage.length - 1) {
          pageScroll.showPage(pageScroll.activeIndex + 1);
          pageScroll.showType == 1 && jPage.eq(pageScroll.activeIndex - 1).css3({
            'transform': 'translate3d(0, 0, 0)'
          })
        }
      } else {
        var symbol = touchMove > 0 ? -1 : +1;
        pageScroll.showType == 1 && jPage.eq(pageScroll.activeIndex + symbol).css3({
          'transform': 'translate3d(0, 0, 0)',
          'transition': 'transform .5s',
        })
        pageScroll.showType == 2 && jPages.css({
          'transform': 'translate3d(0, ' + (-pageScroll.pageHeight * pageScroll.activeIndex) + 'px, 0)',
          'transition': 'transform .5s',
        });
      }
      _this.isStart = false;
      _this.page = {};
    },
    /**
     * 绑定
     */
    Binding: function () {
      var _this = this;
      if (window.attachEvent) {
        //IE绑定事件方式
        // obj.attachEvent("on" + type, fn);
        jPages.get(0).attachEvent("ontouchstart", function (e) {
          _this.start(e);
        });
        jPages.get(0).attachEvent("ontouchmove", function (e) {
          _this.move(e);
        });
        jPages.get(0).attachEvent("ontouchend", function (e) {
          _this.end(e);
        });
        jPages.get(0).attachEvent("onmousedown", function (e) {
          _this.start(e);
        });
        jPages.get(0).attachEvent("onmousemove", function (e) {
          _this.move(e);
        });
        jPages.get(0).attachEvent("onmouseup", function (e) {
          _this.end(e);
        });
      } else if (window.addEventListener) {
        jPages.get(0).addEventListener("touchstart", function (e) {
          _this.start(e);
        }, false);
        jPages.get(0).addEventListener("touchmove", function (e) {
          _this.move(e);
        }, false);
        jPages.get(0).addEventListener("touchend", function (e) {
          _this.end(e);
        }, false);
        jPages.get(0).addEventListener("mousedown", function (e) {
          _this.start(e);
        }, false);
        jPages.get(0).addEventListener("mousemove", function (e) {
          _this.move(e);
        }, false);
        jPages.get(0).addEventListener("mouseup", function (e) {
          _this.end(e);
        }, false);
      }
      // jPages.on('touchstart', function(e) { _this.start(e); });
      // jPages.on('touchmove', function(e) { _this.move(e); });
      // jPages.on('touchend', function(e) { _this.end(e); });
    }
  }
  touch.Binding();

  /**
   * 鼠标滚轮绑定
   * @return {[type]} [description]
   */
  function wheelBinding(e) {
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
      if (pageScroll.isScroll) {
        return;
      }

      if (nDelta < 0) {
        if (pageScroll.activeIndex < jPage.length - 1) {
          pageScroll.showPage(pageScroll.activeIndex + 1);
        }
      } else {
        if (pageScroll.activeIndex > 0) {
          pageScroll.showPage(pageScroll.activeIndex - 1);
        }
      }
    }
    if (e.preventDefault)
      e.preventDefault(); //阻止默认行为
    e.returnValue = false; //IE5到IE8 returnValue = false，也能阻止默认行为
  }
  if (window.addEventListener) { //针对火狐浏览器
    window.addEventListener('DOMMouseScroll', wheelBinding, false);
  }
  window.onmousewheel = document.onmousewheel = wheelBinding;
});