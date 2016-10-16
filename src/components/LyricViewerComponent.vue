<template>
  <div class="lyric-viewer">
    <div ref="lyric-viewerwapper">
      <div ref="lyric-viewer-container"
           :class="{'anu-hidden': errortype != error.type.NO_ERROR}"
      >
      </div>
    </div>
    <div tpl="item-template" ref="templateContent">
      <slot name="item-template"></slot>
    </div>
    <div class="error"
      :class="{'anu-active': errortype == error.type.MUSIC_LOAD_ERROR}"
    >
      <slot name="music-not-load-error"></slot>
    </div>
    <div class="error"
         :class="{'anu-active': errortype == error.type.EMPTY_ERROR}"
    >
      <slot name="music-empty-error"></slot>
    </div>
    <div class="error"
         :class="{'anu-active': errortype == error.type.NATIVE_ERROR}"
    >
      <div v-if="errororigin && errororigin.code == mediaerror.MEDIA_ERR_ABORTED">
        <slot name="music-native-aborted-error"></slot>
      </div>
      <div v-if="errororigin && errororigin.code == mediaerror.MEDIA_ERR_NETWORK">
        <slot name="music-native-network-error"></slot>
      </div>
      <div v-if="errororigin && errororigin.code == mediaerror.MEDIA_ERR_DECODE">
        <slot name="music-native-decode-error"></slot>
      </div>
      <div v-if="errororigin && errororigin.code == mediaerror.MEDIA_ERR_SRC_NOT_SUPPORTED">
        <slot name="music-native-src-error"></slot>
      </div>
    </div>
  </div>
</template>
<script>

  const NO_ERROR = -1;
  const UNKONWN_ERROR = 0;
  const NET_NOT_CONNETED_ERROR = 1;
  const MUSIC_LOAD_ERROR = 2;
  const NATIVE_ERROR = 3;
  const EMPTY_ERROR = 4;

  let mediaerror = {
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4
  };

  let TemplateEnginee = (function () {
    var lastParseArgs = [];
    var currentParseArgs = [];
    var isLikeFunctionRegexp = /(?:\w)+\([\w,\s]+\)/g;

    function removeByValue(arr) {
      var what, a = arguments, L = a.length, ax;
      while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
          arr.splice(ax, 1);
        }
      }
      return arr;
    }

    function parse(html, data) {
      var parsedHtml = "" + html;
      lastParseArgs = html.match(/\[\[[\w()]+\]\]/g);
      currentParseArgs = lastParseArgs;
      if (lastParseArgs) {
        if( data instanceof Object && Object.keys(data).length > 0) {
          for (var key in data) {
            var domkey = "[[" + key + "]]";
            var domvalue = data[key];
            while (currentParseArgs.indexOf(domkey) > -1) {
              var domregexp = new RegExp("\\[\\[" + key + "\\]\\]");
              parsedHtml = parsedHtml.replace(domregexp, ("" + domvalue));
              removeByValue(currentParseArgs, domkey);
            }
          }
        }
      }
      return parsedHtml;
    }

    return {
      parse: parse
    }
  })();

  function getCSSPropValue(dom, prop) {
    if (!window.getComputedStyle(dom, null).getPropertyValue(prop)) {
      return 0;
    }
    return parseFloat(window.getComputedStyle(dom, null).getPropertyValue(prop).replace("px", "")) || 0;
  }

  function getTranslateY(dom) {
    var height = getCSSPropValue(dom, "height");
    var paddingTop = getCSSPropValue(dom, "padding-top");
    var paddingBottom = getCSSPropValue(dom, "padding-bottom");
    var borderTop = getCSSPropValue(dom, "border-top-height");
    var borderBottom = getCSSPropValue(dom, "border-bottom-height");
    var translateY = height + paddingTop + paddingBottom + borderTop + borderBottom;
    return translateY;
  }


  function genentorHeight(children, wrapper, range, self) {
    var arr = [];
    var res = [];
    var ret = [];
    var wrapperHeight = getCSSPropValue(wrapper, "height");
    var firstHeight = 0;
    var checkIndex = 0;
    children.forEach(function (dom) {
      arr.push(getTranslateY(dom));
    });
    var height = 0;
    for (var i = 0; i < arr.length - 1; i++) {
      var v = arr[i];
      height = height + v;
      if (height > wrapperHeight / 2) {
        checkIndex = i;
        break;
      }
    }
    firstHeight = arr.filter(function(s, index) {
      if (index < checkIndex + 1) {
        return true
      }
      return false;
    }).reduce(function(previousValue, currentValue, currentIndex, array) {
      return previousValue + currentValue;
    });
    for (var m = 0; m < arr.length; m++) {
      if (m < (checkIndex + 1)) {
        res[m] = 0;
      } else if (m > children.length - (checkIndex + 2)) {
        res[m] = arr.reduce(function(previousValue, currentValue, currentIndex, array) {
            return previousValue + currentValue;
          }) - wrapperHeight;
      }  else {
        res[m] = arr.filter(function(s, index) {
            if (index < m + 1) {
              return true
            }
            return false;
          }).reduce(function(previousValue, currentValue, currentIndex, array) {
            return previousValue + currentValue;
          }) - firstHeight;
      }
    }
    return res;
  }

  var smooth_scroll_to = function(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
      return Promise.reject("bad duration");
    }
    if (duration === 0) {
      element.scrollTop = target;
      return Promise.resolve();
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var start_top = element.scrollTop;
    var distance = target - start_top;

    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function(start, end, point) {
      if(point <= start) { return 0; }
      if(point >= end) { return 1; }
      var x = (point - start) / (end - start); // interpolation
      return x*x*(3 - 2*x);
    }

    return new Promise(function(resolve, reject) {
      // This is to keep track of where the element's scrollTop is
      // supposed to be, based on what we're doing
      var previous_top = element.scrollTop;

      // This is like a think function from a game loop
      var scroll_frame = function() {
        if(element.scrollTop != previous_top) {
          // reject("interrupted");
          return;
        }

        // set the scrollTop for this frame
        var now = Date.now();
        var point = smooth_step(start_time, end_time, now);
        var frameTop = Math.round(start_top + (distance * point));
        element.scrollTop = frameTop;

        // check if we're done!
        if(now >= end_time) {
          resolve();
          return;
        }

        // If we were supposed to scroll but didn't, then we
        // probably hit the limit, so consider it done; not
        // interrupted.
        if(element.scrollTop === previous_top
          && element.scrollTop !== frameTop) {
          resolve();
          return;
        }
        previous_top = element.scrollTop;

        // schedule next frame for execution
        setTimeout(scroll_frame, 0);
      }

      // boostrap the animation process
      setTimeout(scroll_frame, 0);
    });
  }

  export default {
    props: {
      source: {
        type: Object
      }
    },
    ready() {
      this.LyricsParser = window.Anu.Lyrics();
      this.refs = {};
      this.refs.templateContent = this.$el.querySelector('[ref="templateContent"]')
      this.refs.lyricViewerContainer = this.$el.querySelector('[ref="lyric-viewer-container"]')
      this.refs.lyricViewerwapper = this.$el.querySelector('[ref="lyric-viewerwapper"]')
      this.lyrictemplate = this.refs.templateContent.children[0].innerHTML.trim();
      this.init();
    },
    data() {
      return {
        lyrics: [],
        errortype: -1,
        errororigin: {},
        errortarget: {},
        mediaerror: mediaerror,
        error: {
          type: {
            UNKONWN_ERROR: UNKONWN_ERROR,
            NET_NOT_CONNETED_ERROR: NET_NOT_CONNETED_ERROR,
            MUSIC_LOAD_ERROR: MUSIC_LOAD_ERROR,
            NATIVE_ERROR: NATIVE_ERROR,
            NO_ERROR: NO_ERROR,
            EMPTY_ERROR: EMPTY_ERROR
          }
        }
      }
    },
    methods: {
      init () {
        var self = this;
        self.load(self.source);
      },
      load(source) {
        if (source) {
          var self = this;
          self.errortype = NO_ERROR;
          this.lyrics = self.LyricsParser.parse(source.lyric);
          self.contentchildren = this.buildHtml();
          if (self.contentchildren.length > 0) {
            self.heightArr = genentorHeight(self.contentchildren, self.$el, {}, self);
          } else {
            // 歌词为空
            self.setError({
              type: self.error.type.EMPTY_ERROR
            });
          }
          self.lastIndex = 0;
          self.lastSource = {};
          this.onChangeIndex(0);
        }
      },
      setError(error) {
        var self = this;
        if (error.type == self.error.type.EMPTY_ERROR) {
        }
        self.errortype = error.type;
        self.errororigin = error.origin;
        self.errortarget = error.target;
      },
      buildHtml() {
        var self = this;
        var html = "";
        var lyrics = this.lyrics;
        lyrics.forEach(function (lyric) {
          html = html + TemplateEnginee.parse(self.lyrictemplate, lyric)
        });
        this.refs.lyricViewerContainer.innerHTML = html;
        return Array.prototype.slice.call(self.refs.lyricViewerContainer.children);
      },
      select(index, lastIndex) {
        var self = this;
        var children = self.contentchildren;
        if (index < 0 || index > children.length - 1) {
          return false;
        }
        children.forEach(function(dom) {
          if (dom.classList.contains("active")) {
            dom.classList.remove("active");
          }
        });
        setTimeout(function() {
          children[index].classList.add("active");
          self.translateY = self.heightArr[index];
          smooth_scroll_to(self.$el, self.translateY, 1000);
        }, 0);
      },
      onChangeIndex(index) {
        var self = this;
        self.select(index, self.lastIndex);
        self.lastIndex = index;
      },
      onChangeSource(source) {
        var self = this;
        this.load(source);
      },
      onChangeError(e) {
        this.setError(e);
      }
    }
  }
</script>
<style src="../assets/css/lyric-viewer.css"></style>
