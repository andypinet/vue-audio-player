<template>
  <div class="photo-cover photo-1">
    <anu-navbar>
      <div slot="anu-navbar-left">
        <button type="button" class="navbar__btn">
          <i class="ui-icon iconfont icon-morelist"></i>
        </button>
      </div>
      <anu-title slot="anu-navbar-center" ref="title">{{currentSource.title}}
        <div slot="anu-subtitle">jay</div>
      </anu-title>
      <div slot="anu-navbar-right">
        <button type="button" class="navbar__btn">
          <i class="ui-icon iconfont icon-star"></i>
        </button>
      </div>
    </anu-navbar>
    <div class="player">
      <flexbox class="player__inner"
               orient="vertical"
               :gutter=0
      >
        <flexbox-item class="player__showcase" >
          <div class="player__lyric-container">
            <lyric-viewer ref="lyric-viewer" :source="audiosources[0]">
              <div slot="item-template">
                <div class="item">[[text]]</div>
              </div>
              <div slot="music-not-load-error">
                <div class="player-error player__music-not-load-error">
                  <div class="player-error__title">
                    音乐加载失败
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
              <div slot="music-empty-error">
                <div class="player-error player__music-empty-error">
                  <div class="player-error__title">
                    音乐没有歌词
                  </div>
                  <img class="player-error__image" src="../assets/images/empty_error.png">
                </div>
              </div>
              <div slot="music-unkonwn-error">
                <div class="player-error player__music-unkonwn-error">
                  <div class="player-error__title">
                    音乐未知错误
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
              <div slot="music-native-src-error">
                <div class="player-error player__music-unkonwn-error">
                  <div class="player-error__title">
                    音乐src不支持
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
              <div slot="music-native-aborted-error">
                <div class="player-error player__music-unkonwn-error">
                  <div class="player-error__title">
                    音乐中断
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
              <div slot="music-native-network-error">
                <div class="player-error player__music-unkonwn-error">
                  <div class="player-error__title">
                    网络问题
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
              <div slot="music-native-decode-error">
                <div class="player-error player__music-unkonwn-error">
                  <div class="player-error__title">
                    编码问题
                  </div>
                  <img class="player-error__image" src="../assets/images/music_not_load_error.png">
                </div>
              </div>
            </lyric-viewer>
          </div>
        </flexbox-item>
        <flexbox-item class="player__control" >
          <audio-player
                        ref="audio-player"
                        :sources="audiosources"
                        @indexchange="handleIndexChange"
                        @loadsource="handleLoadsource"
                        @togglemusiclist="handleTogglemusiclist"
                        @loaderror="handleError"
          ></audio-player>
        </flexbox-item>
      </flexbox>
    </div>
  </div>
  <actionsheet ref="menu" :show.sync="showmenu" :menus="menus"
               @on-click-menu="handleMenuClick"
  ></actionsheet>
</template>

<script lang="babel">
import Divider from 'vux/src/components/divider'
import Actionsheet from 'vux/src/components/actionsheet'
import {Flexbox, FlexboxItem} from 'vux/src/components/flexbox'
import AudioPlayer from './AudioPlayerComponent.vue'
import LyricViewer from './LyricViewerComponent.vue'
import AnuNavbar from './NavbarComponent.vue'
import AnuTitle from './TitleComponent.vue'

export default {
  components: {
    Divider,
    Actionsheet,
    Flexbox,
    FlexboxItem,
    AudioPlayer,
    LyricViewer,
    AnuNavbar,
    AnuTitle
  },
  data () {
    var res = {
      audiosources: [
        {
          lyric: `
[by:十八岁卜卜脆]\n[00:15.11]想去稻花香的童年\n[00:18.46]捡起被遗忘的相片\n[00:21.81]曾经弹过的木吉他\n[00:25.36]早就断了弦\n[00:28.76]还记得年少时\n[00:31.91]我最爱荡秋千\n[00:35.71]一个人骑车去海边\n[00:39.32]等待流星许下心愿\n[00:42.82]蝴蝶风筝飞得很远\n[00:46.11]随着天空消失不见\n[00:49.62]曾经听过的寓言\n[00:52.67]都被岁月搁浅\n[00:57.12]和你遥望过的月光\n[01:01.07]都没有变\n[01:03.57]让四季都变成夏天\n[01:07.02]放晴每一天\n[01:09.32]我们疯狂的那年\n[01:13.62]已经越走越远\n[01:17.03]纯真的容颜都随季节而蜕变\n[01:24.37]你牵我的画面\n[01:27.57]又浮现在我眼前\n[01:31.37]在放弃之前\n[01:33.03]就回头看一眼\n[01:34.68]就像你陪在我身边\n[01:37.28]我们难忘的那年\n[01:41.33]会不会再出现\n[01:44.83]也许又会在未来\n[01:47.98]哪天再重演\n[01:51.98]相对的一瞬间\n[01:55.33]用彼此微笑的脸\n[01:59.23]会突然发现\n[02:00.68]仿佛已经回到从前\n[02:34.33]蝴蝶风筝飞得很远\n[02:37.48]随着天空消失不见\n[02:41.03]曾经听过的寓言\n[02:43.98]都被岁月搁浅\n[02:47.88]和你遥望过的月光\n[02:52.29]都没有变\n[02:54.84]让四季都变成夏天\n[02:58.24]放晴每一天\n[03:00.64]我们疯狂的那年\n[03:04.84]已经越走越远\n[03:08.39]纯真的容颜都\n[03:10.89]随季节而蜕变\n[03:15.44]你牵我的画面\n[03:18.79]又浮现在我眼前\n[03:22.64]在放弃之前\n[03:24.09]就回头看一眼\n[03:25.89]就像你陪在我身边\n[03:28.49]我们难忘的那年\n[03:32.75]会不会再出现\n[03:36.19]也许又会在未来\n[03:39.25]哪天再重演\n[03:43.30]相对的一瞬间\n[03:46.60]用彼此微笑的脸\n[03:50.55]会突然发现\n[03:51.90]仿佛已经回到从前\n[03:58.35]我们疯狂的那年\n[04:02.30]已经越走越远\n[04:05.75]纯真的容颜都\n[04:08.21]随季节而蜕变\n[04:12.86]你牵我的画面\n[04:16.16]又浮现在我眼前\n[04:20.06]在放弃之前\n[04:21.56]就回头看一眼\n[04:23.36]就像你陪在我身边\n[04:25.91]我们难忘的那年\n[04:30.16]会不会再出现\n[04:33.57]也许又会在未来\n[04:36.62]哪天再重演\n[04:40.57]相对的一瞬间\n[04:43.97]用彼此微笑的脸\n[04:47.82]会突然发现\n[04:49.32]仿佛已经回到从前\n[04:54.87]会突然发现\n[04:56.52]仿佛已回不到从前\n
`,
          title: '任然 - 那年(初版)',
          src: 'http://192.168.31.129:8081/任然 - 那年(初版).mp3',
          duration: "05:20"
        },
        {
          lyric: `
[00:00.00]周杰伦 - 告白气球
[00:03.11]词：方文山　曲：周杰伦
[00:23.21]塞纳河畔 左岸的咖啡
[00:25.94]我手一杯 品尝你的美 留下唇印的嘴
[00:33.92]花店玫瑰 名字写错谁
[00:36.54]告白气球 风吹到对街 微笑在天上飞
[00:43.78]你说你有点难追 想让我知难而退
[00:48.92]礼物不需挑最贵 只要香榭的落叶
[00:54.35]营造浪漫的约会 不害怕搞砸一切
[00:59.75]拥有你就拥有 全世界
[01:04.59]亲爱的 爱上你
[01:07.96]从那天起 甜蜜的很轻易
[01:15.23]亲爱的 别任性
[01:18.69]你的眼睛 在说我愿意
[01:25.07]...
[01:48.58]塞纳河畔 左岸的咖啡
[01:51.21]我手一杯 品尝你的美 留下唇印的嘴
[01:59.24]花店玫瑰 名字写错谁
[02:01.85]告白气球 风吹到对街 微笑在天上飞
[02:09.08]你说你有点难追 想让我知难而退
[02:14.17]礼物不需挑最贵 只要香榭的落叶
[02:19.70]营造浪漫的约会 不害怕搞砸一切
[02:24.88]拥有你就拥有 全世界
[02:29.84]亲爱的 爱上你
[02:33.25]从那天起 甜蜜的很轻易
[02:40.56]亲爱的 别任性
[02:43.91]你的眼睛 在说我愿意
[02:51.27]亲爱的 爱上你
[02:54.53]恋爱日记 飘香水的回忆
[03:01.83]一整瓶 的梦境
[03:05.24]全都有你 搅拌在一起
[03:12.62]亲爱的 别任性
[03:15.96]你的眼睛 在说我愿意
`,
          title: '周杰伦 - 告白气球',
          src: 'http://192.168.31.129:8081/周杰伦 - 告白气球.mp3',
          duration: ""
        },
        {
          lyric:`
                `,
          title: 'Ailee-给你看-보여줄게',
          src: "http://www.hankin.cn/wp-content/uploads/2016/02/Ailee-给你看-보여줄게.mp3",
          duration: ""
        },
        {
          lyric:`
                `,
          title: '阿肆 - 预谋邂逅',
          src: 'http://192.168.31.129:8081/阿肆 - 预谋邂逅.mp3',
          duration: ""
        },
        {
          lyric:`
                `,
          title: 'Alesso - Heroes (we could be) [feat. Tove Lo]',
          src: 'http://192.168.31.129:8081/Alesso - Heroes (we could be) [feat. Tove Lo].mp3',
          duration: ""
        },
        {
          lyric:`
                `,
          title: '好妹妹乐队 - 往事只能回味',
          src: 'http://192.168.31.129:8081/好妹妹乐队 - 往事只能回味.mp3',
          duration: ""
        },
        {
          lyric: `
                `,
          title: 'Aimer,澤野弘之 - Next 2 U',
          src: 'http:/192.168.31.129:8081/Aimer,澤野弘之 - Next 2 U.mp3',
          duration: ""
        },
        {
          lyric: "[00:00.00] 作曲 : 澤野弘之\n[00:01.00] 作词 : 澤野弘之\n[00:22.590]君を繋ぐ空の星が1つ音を立てても\n[00:33.680]どれも同じ雨に濡れた夢ばかり 乾くだけの光(こう)\n[00:44.890]相手をなぞる 答えに疲れた\n[00:55.400]繰り返す日の無い夜明けに 崩れた朝\n[01:05.460]捕まえたdaydream 出遅れたストーリーと栄光が\n[01:13.090]どこへ叫び唱えても\n[01:17.340]荒れたトンネル 声もくぐれない\n[01:22.850]だからサイレンス 灯すためと\n[01:32.260]...\n[01:54.590]外とパズルのようにハマるピースが必要としても\n[02:05.750]影(えい)もない偽(いつわ)りと同じだ 捨て去られ並ぶだけの賞(しょう)\n[02:16.890]箱の中に揃えた苛立(いらだ)ち\n[02:27.370]順番待ちさらし 誤魔化しのゴール\n[02:37.490]Don't be above your daydream 角(かど)が取れたvision\n[02:43.760]君の夢が横で外れても\n[02:49.340]僕は歌い 橋をかけよう\n[02:54.980]だからサイレンス 鳴らすためと\n[03:04.350]どこまでも片側に沿ったリズム 過ぎた街並は終の愛と遠くへ\n[03:15.560]伝えれない歪(ひず)みかけのイメージに 目が覚めた抵抗 型落ちの衝動\n[03:26.700]...\n[03:27.710]砕けたcry&dream 扉だけの理想\n[03:34.030]街が雑音に溺れはしゃいでも\n[03:39.600]僕は歌い 舵を捨てよう\n[03:45.160]だからサイレンス 響くためと\n[03:55.270]Don't be afraid\n[04:00.890]daybreak has come",
          title: 'ninelie',
          src: 'http://m2.music.126.net/IPp5OVDljqZx2kBO7gYIsQ==/1413971962652446.mp3',
          duration: ""
        }
      ],
      showmenu: false,
      hideNavIcon: true
    };
    res.menus = {};
    res.audiosources.forEach(function (audiosource, index) {
      res.menus["menu" + index] = audiosource.title;
    });
    res.currentSource = res.audiosources[0];
    return res;
  },
  ready () {
    var self = this;
    self.refs = {};
    self.refs.lyricViewer = self.$children[1].$el.querySelector('[ref="lyric-viewer"]');
    self.refs.menu = self.$children[2].$el;
    self.refs.audioPlayer = self.$children[1].$el.querySelector('[ref="audio-player"]');
    self.refs.title = self.$children[0].$el.querySelector('[ref="title"]');
    this.currentSourcelastIndex = -1;
    self.currentCell = {};
    self.currentIndex = 0;
    self.refs.menu.children[0].addEventListener("click", function (e) {
        self.handleMenuCancel(e);
    });
    setTimeout(function () {
      self.refs.title.__vue__.check();
    }, 0);
  },
  methods: {
    handleIndexChange(e) {
      if (this.currentSourcelastIndex != e.index) {
        this.refs.lyricViewer.__vue__.onChangeIndex(e.index);
        this.currentSourcelastIndex = e.index;
      }
    },
    handleLoadsource(e) {
      var self = this;
      if (this.refs && this.refs.lyricViewer) {
        this.refs.lyricViewer.__vue__.onChangeSource(e.currentSource);
        this.currentSource = e.currentSource;
        setTimeout(function () {
          self.refs.title.__vue__.check();
        }, 0);
      }
    },
    handleTogglemusiclist(e) {
      var self = this;
      self.currentCell = self.refs.menu.children[1].children[0].children.item(e.activeIndex);
      if (self.showmenu) {
        self.showmenu = false;
        self.currentCell.classList.remove("active");
      } else {
        self.currentCell.classList.add("active");
        self.showmenu = true;
      }
    },
    handleMenuClick(menuKey) {
      var self = this;
      self.currentIndex = parseFloat(menuKey.replace("menu",""));
      self.refs.audioPlayer.__vue__.select(self.currentIndex);
      self.currentCell.classList.remove("active");
    },
    handleMenuCancel(e) {
      var self = this;
      self.currentCell.classList.remove("active");
    },
    handleError(e) {
      var self = this;
      console.dir(e);
      self.refs.lyricViewer.__vue__.onChangeError(e);
    }
  }
}
</script>

<style src="../assets/css/home.css"></style>
