<template>
  <div class="audio-player">
    <anu-ui-slider class="audio-player__volume"
                   ref="volume"
                   :value="100"
                   @immediatechange="immediatechangevolume"
                   @clickvaluechange="clickvaluechangevolume"
    ></anu-ui-slider>
    <flexbox class="audio-player__showbar"
             :gutter=0
    >
      <flexbox-item>
        <span>{{currentFormatTime}}</span>
      </flexbox-item>
      <flexbox-item>
        <div class="audio-player__progressbar-container">
          <div class="stack-view audio-player__progressbar">
            <anu-ui-slider class="stack-view__item audio-player__progress active" step="0.01"
                           ref="progress"
                           :readonly="true"
                           :value="currentProgress"
            ></anu-ui-slider>
            <anu-ui-slider class="stack-view__item audio-player__secondaryprogress" step="0.01"
                           ref="secondaryProgress"
                           @immediatechange="immediatechangeprogress"
                           @valuechange="valuechangeprogress"
                           @clickvaluechange="clickvaluechangeprogress"
            ></anu-ui-slider>
          </div>
        </div>
      </flexbox-item>
      <flexbox-item>
        <span>{{totalFormatTime}}</span>
      </flexbox-item>
    </flexbox>
    <flexbox class="audio-player__controlbar"
             :gutter=0
    >
      <flexbox-item>
        <button type="button" class="audio-player__btn"
          v-if="playmode == 'repeat'"
          @click="changePlayMode('repeat-one')"
        >
          <i class="ui-icon iconfont icon-repeat"></i>
        </button>
        <button type="button" class="audio-player__btn"
          v-if="playmode == 'repeat-one'"
          @click="changePlayMode('shuffle')"
        >
          <i class="ui-icon iconfont icon-repeatone"></i>
        </button>
        <button type="button" class="audio-player__btn"
          v-if="playmode == 'shuffle'"
          @click="changePlayMode('repeat')"
        >
          <i class="ui-icon iconfont icon-shuffle"></i>
        </button>
      </flexbox-item>
      <flexbox-item>
        <button type="button" class="audio-player__btn" :disabled="!canPrev"
                @click="selectprev"
        >
          <i class="ui-icon iconfont icon-skipprevious"></i>
        </button>
      </flexbox-item>
      <flexbox-item>
        <button type="button" class="stack-view audio-player__btn audio-player__toggle" @click="toggle"
          :disabled="!canplay"
        >
          <i class="ui-icon iconfont icon-play stack-view__item" :class="{active: !isPlaying}"></i>
          <i class="ui-icon iconfont icon-pause stack-view__item" :class="{active: isPlaying}"></i>
        </button>
      </flexbox-item>
      <flexbox-item>
        <button type="button" class="audio-player__btn" :disabled="!canNext"
                @click="selectnext"
        >
          <i class="ui-icon iconfont icon-skipnext"></i>
        </button>
      </flexbox-item>
      <flexbox-item>
        <button type="button" class="audio-player__btn audio-player__list"
          @click="toggleMusicList"
        >
          <i class="ui-icon iconfont icon-list"></i>
        </button>
      </flexbox-item>
    </flexbox>
    <audio ref="audio" :src="currentPlayAudioSrc"></audio>
  </div>
</template>
<script>
  import {Flexbox, FlexboxItem} from 'vux/src/components/flexbox';
  import Range from 'vux/src/components/range';
  import AnuUiSlider from 'anu-ui-slider/anu-ui-slider.vue';

  const NO_ERROR = -1;
  const UNKONWN_ERROR = 0;
  const NET_NOT_CONNETED_ERROR = 1;
  const MUSIC_LOAD_ERROR = 2;
  const NATIVE_ERROR = 3;

  let mediaerror = {
    MEDIA_ERR_ABORTED: 1,
    MEDIA_ERR_NETWORK: 2,
    MEDIA_ERR_DECODE: 3,
    MEDIA_ERR_SRC_NOT_SUPPORTED: 4
  };

  var timeout = setTimeout(function () {
  }, 0);

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  class AudioTimeManager {
    static getCurrentTime (audio, format) {
      return window.Anu.pattern(new Date(audio.currentTime * 1000), format)
    }
    static getTotalTime (audio, format) {
      return window.Anu.pattern(new Date(audio.duration * 1000), format)
    }
    static getCurrentProgress (audio) {
      return audio.currentTime / audio.duration * 100
    }
    static getCurrentProgressByTime (currentTime, audio) {
      return currentTime / audio.duration * 100
    }
    static format (time, _format) {
      return window.Anu.pattern(new Date(time), _format)
    }
  }

  class PlayerList {
    constructor () {
      this.currentSource = {}
      this.currentSourceIndex = 0
      this.sources = []
    }
    addSources (sources) {
      this.sources = sources
    }
    setCurrent (index) {
      this.currentSource = this.sources[index]
      this.currentSourceIndex = index
      this.currentSource.index = 0
    }
    getCurrent () {
      return this.currentSource
    }
    getCurrentIndex () {
      return this.currentSourceIndex
    }
    getLength () {
      return this.sources.length
    }
    isCurrentLast() {
      return this.currentSourceIndex == this.sources.length - 1;
    }
  }

  class PlayerControll {
    constructor () {
      this.player = {}
    }
    init (player) {
      this.player = player
    }
  }

  class LyricsManager {
    constructor (lyrics, currentIndex) {
      this.lyrics = lyrics
      this.parseLyrics = window.Anu.Lyrics().parse(lyrics)
      this.timestamps = this.parseLyrics.map(function (v) {
        return v.timestamp
      })
      this.currentIndex = currentIndex
    }
    indexOf(currentTime) {
      var self = this;
      if (self.currentIndex > self.timestamps.length - 1) {
        return -1;
      }

      if (currentTime < self.timestamps[1]) {
        return 0;
      }

      // 循环时间 只要比一个小 就返回前一个
      for (var i = 0; i < self.timestamps.length; i++) {
        var timestamp = self.timestamps[i];
        if (currentTime <= timestamp) {
          return i - 1;
        }
      }
      return self.timestamps.length - 1;
    }
  }

  export default {
    props: {
      currentPlayAudioSrc: {
        type: String,
        default: ''
      },
      isPlaying: {
        type: Boolean,
        default: false
      },
      timeFormat: {
        type: String,
        default: 'mm:ss'
      },
      sources: {
        type: Array
      }
    },
    components: {
      Flexbox,
      FlexboxItem,
      Range,
      AnuUiSlider
    },
    ready () {
      this.playerList = new PlayerList()
      this.playerControl = new PlayerControll()
      // 初始化数据
      var self = this
      this.canplay = true;
      this.currentProgress = 0
      this.currentVolume = 0
      // refs
      this.refs = {}
      this.refs.audio = this.$el.querySelector('[ref="audio"]')
      this.refs.progress = this.$el.querySelector('[ref="progress"]')
      this.refs.secondaryProgress = this.$el.querySelector('[ref="secondaryProgress"]')
//      this.refs.audio.muted = true;
      console.dir(this.refs.audio);
      // 添加数据
      this.playerList.addSources(self.sources)

      // load
      this.loadSource(0)
      this.checkFlag()

      // playmode
      this.playmode = "shuffle";

      // error
      this.error = {
        type: {
          UNKONWN_ERROR: UNKONWN_ERROR,
          NET_NOT_CONNETED_ERROR: NET_NOT_CONNETED_ERROR,
          MUSIC_LOAD_ERROR: MUSIC_LOAD_ERROR,
          NO_ERROR: NO_ERROR
        }
      };

      // event
      this.bindEvent()
    },
    data () {
      var self = this
      return {
        currentFormatTime: AudioTimeManager.format(0, self.timeFormat),
        totalFormatTime: AudioTimeManager.format(0, self.timeFormat),
        immediatechange: false,
        currentProgress: 0,
        canplay: false,
        canPrev: false,
        canNext: false,
        currentTime: 0,
        playmode: "",
        errortype: NO_ERROR
      }
    },
    computed: {
    },
    methods: {
      loadSource (index) {
        var self = this
        clearTimeout(timeout);
        self.errortype = NO_ERROR;
        self.currentProgress = 0
        // 选中第一首歌
        self.playerList.setCurrent(index)
        self.currentTime = 0
        self.currentFormatTime = AudioTimeManager.format(0, self.timeFormat)
        self.totalFormatTime = AudioTimeManager.format(0, self.timeFormat)
        // 导出当前选中
        self.$emit("loadsource", {
          currentSource: self.playerList.getCurrent()
        });
        if (window.navigator.userAgent.indexOf("MiuiBrowser") > -1 && self.playerList.getCurrent().duration && self.playerList.getCurrent().duration.length > 0) {
          self.totalFormatTime = self.playerList.getCurrent().duration;    
        }
        // 加载第一首歌
        self.load();
      },
      load () {
        var currentSource = this.playerList.getCurrent()
        this.currentPlayAudioSrc = currentSource.src
        this.lyricsManager = new LyricsManager(currentSource.lyric, currentSource.index)
        this.refs.audio.load()
      },
      bindEvent () {
        var self = this
        this.refs.audio.addEventListener('durationchange', self.totalTime.bind(self))
        this.refs.audio.addEventListener('canplay', self.onloadstart.bind(self))
        this.refs.audio.addEventListener('timeupdate', self.ontimeupdate.bind(self))
        this.refs.audio.addEventListener('ended', self.onended.bind(self))
        this.refs.audio.addEventListener('error', self.onerror.bind(self))
      },
      onloadstart () {
        var self = this;
        self.currentTime = 0;
        self.currentFormatTime = AudioTimeManager.getCurrentTime(self.refs.audio, self.timeFormat);
      },
      totalTime (e) {
        var self = this;
        if (self.refs.audio.duration > 1) {
          self.totalFormatTime = AudioTimeManager.getTotalTime(self.refs.audio, self.timeFormat);
        }
        if (self.isPlaying && self.refs.audio.paused) {
          self.refs.audio.play()
        }
      },
      ontimeupdate () {
        var self = this
        self.currentTime = self.refs.audio.currentTime
        self.onSetCurrentTime()
        self.currentFormatTime = AudioTimeManager.getCurrentTime(self.refs.audio, self.timeFormat)
        if (!self.immediatechange) {
          self.currentProgress = AudioTimeManager.getCurrentProgress(self.refs.audio)
        }
        if (Number.isNaN(self.currentProgress)) {
          self.currentProgress = 0;
        }
      },
      onSetCurrentTime() {
        var self = this;
        var index = self.lyricsManager.indexOf(self.currentTime);
        if (index > -1) {
          self.$emit("indexchange", {
            index: index
          });
        }
      },
      onerror(e) {
        var self = this;
        console.dir(this.refs.audio.error);
        if (!navigator.onLine) {
          self.setError(NET_NOT_CONNETED_ERROR);
          return false;
        }
        if (this.refs.audio.error) {
          self.setError(NATIVE_ERROR);
        } else {
          self.setError(MUSIC_LOAD_ERROR);
        }
      },
      setError(code) {
        var self = this;
        if (code == NET_NOT_CONNETED_ERROR) {
          self.errortype = NET_NOT_CONNETED_ERROR;
        } else if (code == MUSIC_LOAD_ERROR) {
          self.errortype = MUSIC_LOAD_ERROR;
          self.setFlag(false);
          if (!self.playerList.isCurrentLast()) {
            if (self.isPlaying) {
              timeout = setTimeout(function () {
                self.select(self.playerList.getCurrentIndex() + 1);
              }, 3000);
            } else {
            }
          }
        } else {
          self.errortype = UNKONWN_ERROR;
        }
        self.$emit("loaderror", {
          type: code,
          target: self.refs.audio,
          origin: self.refs.audio.error
        });
      },
      immediatechangeprogress (value) {
        var self = this
        self.immediatechange = true
        // 消除进度条进度颜色
        if (self.refs.progress.classList.contains("active")) {
          self.refs.progress.classList.remove("active");
        }
        // 自己显示进度条
        if (!self.refs.secondaryProgress.classList.contains("active")) {
          self.refs.secondaryProgress.classList.add("active");
        }
        var currentTime = value / 100 * self.refs.audio.duration
        self.currentFormatTime = AudioTimeManager.format(currentTime * 1000, self.timeFormat)
        self.currentProgress = AudioTimeManager.getCurrentProgressByTime(currentTime, self.refs.audio)
      },
      valuechangeprogress (e) {
        e.stopPropagation()
        var self = this
        self.immediatechange = false
        var currentTime = e.target.value / 100 * self.refs.audio.duration
        self.currentTime = currentTime
        self.refs.audio.currentTime = currentTime
//        self.onSetCurrentTime();
        // audio 拖到最后会结束播放
        if (self.isPlaying && self.refs.audio.paused) {
          self.refs.audio.play()
        }
        // 恢复进度条颜色
        self.refs.progress.classList.add("active");
        // 删除自己颜色
        self.refs.secondaryProgress.classList.remove("active");
      },
      clickvaluechangeprogress (value) {
        var self = this
        self.immediatechange = false
        var currentTime = value / 100 * self.refs.audio.duration
        self.currentTime = currentTime
        self.refs.audio.currentTime = currentTime
//        self.onSetCurrentTime();
        // audio 拖到最后会结束播放
        if (self.isPlaying && self.refs.audio.paused) {
          self.refs.audio.play()
        }
        // 恢复进度条颜色
        self.refs.progress.classList.add("active");
        // 删除自己颜色
        self.refs.secondaryProgress.classList.remove("active");
      },
      onended () {
        var self = this
        this.next(function () {
          self.isPlaying = false
        })
      },
      checkFlag () {
        var self = this;
        var currentIndex = self.playerList.getCurrentIndex();
        if (currentIndex < 1) {
          this.canPrev = false;
        } else {
          this.canPrev = true;
        }
        if (currentIndex > self.playerList.getLength() - 2) {
          this.canNext = false;
        } else {
          this.canNext = true;
        }
      },
      setFlag(canplay) {
        var self = this;
        self.canplay = canplay;
      },
      randomSelect() {
        var self = this;
        var length = self.playerList.getLength();
        var currentIndex = self.playerList.getCurrentIndex();
        var randomnum = getRandomInt(0, length - 1);
        console.log("-----------------");
        console.log(randomnum);
        if (randomnum == currentIndex) {
          return getRandomInt(randomnum, length - 1);
        } else {
          return randomnum;
        }
      },
      prev (onPlayListEnd, mode = false) {
        var self = this;
        var currentIndex = self.playerList.getCurrentIndex();
        var length = self.playerList.getLength();
        var playmode = this.playmode;
        if (mode) {
          playmode = mode;
        }
        if (currentIndex > 0) {
          if (playmode == "shuffle") {
            // 乱序
            self.loadSource(self.randomSelect());
          } else if (playmode == "repeat-one") {
            // 单曲循环
            self.loadSource(currentIndex);
          } else {
            currentIndex--;
            self.loadSource(currentIndex);
          }
        } else {
          self.onPlayListEnd();
        }

        this.checkFlag();
      },
      selectprev() {
        this.canplay = true;
        this.prev(function () {
        }, "repeat");
      },
      next (onPlayListEnd, mode = false) {
        var self = this;
        var currentIndex = self.playerList.getCurrentIndex();
        var length = self.playerList.getLength();
        var playmode = this.playmode;
        if (mode) {
          playmode = mode;
        }
        if (currentIndex < length - 1) {
          if (playmode == "shuffle") {
            // 乱序
            self.randomSelect();
            self.loadSource(self.randomSelect());
          } else if (playmode == "repeat-one") {
            // 单曲循环
            self.loadSource(currentIndex);
          } else {
            currentIndex++;
            self.loadSource(currentIndex);
          }
        } else {
          self.onPlayListEnd();
        }

        this.checkFlag();
      },
      selectnext() {
        this.canplay = true;
        this.next(function () {
        }, "repeat");
      },
      select (index) {
        this.canplay = true;
        var length = this.playerList.getLength();
        if (index < 0) {
          return false;
        }

        if (index > length - 1) {
          return false;
        }

        this.loadSource(index);
        this.checkFlag();
      },
      toggle () {
        if (!this.isPlaying) {
          this.play()
        } else {
          this.pause()
        }
      },
      play () {
        this.isPlaying = true
        this.refs.audio.currentTime = this.currentTime;
        // 单曲循环 或者到最后一首歌时会这样
//      if (this.currentTime > this.refs.audio.duration - 0.01) {
//        this.fire("change", {
//          index: 0
//        })
//      }
        this.refs.audio.play()
      },
      pause () {
        this.isPlaying = false
        this.refs.audio.pause()
      },

      onPlayListEnd() {
        this.isPlaying = false
      },

      // 音乐列表
      toggleMusicList() {
         var self = this;
         self.$emit("togglemusiclist", {
           activeIndex: self.playerList.getCurrentIndex()
         });
      },

      // 切换播放模式
      changePlayMode(mode) {
        this.playmode = mode;
      },

      // volume
      immediatechangevolume(value) {
        var self = this;
        self.refs.audio.volume = value / 100;
      },

      clickvaluechangevolume(value) {
        var self = this;
        self.refs.audio.volume = value / 100;
      }
    }
  }
</script>
<style src="../assets/css/audio-player.css"></style>
