<template>
  <div class="anu-title">
    <div ref="wrapper" class="anu-title__wrapper"
      @transitionend="handleTransitionend"
    >
      <slot></slot>
    </div>
    <div class="anu-title__sub"><slot name="anu-subtitle"></slot></div>
  </div>
</template>
<script>
  var anu_title_distance = 0;
  var anu_title_index = 0;
  var anu_title_animation = null;
  var anu_title_ele = null;
  var anu_title_reset = true;

  function transform(ele, transform) {
    ele.style.webkitTransform = transform;
    ele.style.mozTransform = transform;
    ele.style.transform = transform;
    anu_title_index++;
  }

  function nextanimatestep() {
    anu_title_index++;
    if (anu_title_index < anu_title_distance + 1) {
      transform(anu_title_ele, `translateX(-${anu_title_index}px)`);
      anu_title_animation = window.requestAnimationFrame(nextanimatestep);
    } else {
      window.cancelAnimationFrame(anu_title_animation);
      anu_title_animation = window.requestAnimationFrame(backanimationstep);
    }
  }

  function animationtransform(distance) {
    anu_title_distance = distance;
    anu_title_index = 0;
    anu_title_animation = window.requestAnimationFrame(nextanimatestep);
  }

  function backanimationstep() {
    anu_title_index--;
    if (anu_title_index > -1) {
      transform(anu_title_ele, `translateX(-${anu_title_index}px)`);
      anu_title_animation = window.requestAnimationFrame(backanimationstep);
    } else {
      window.cancelAnimationFrame(anu_title_animation);
      anu_title_animation = window.requestAnimationFrame(nextanimatestep);
    }
  }

  export default {
    ready() {
      var self = this;
      self.refs = {};
      self.refs.wrapper = self.$el.querySelector('[ref="wrapper"]');
    },
    data() {
      return {

      }
    },
    methods: {
      handleTransitionend(e) {
        if (!anu_title_reset) {
          if (anu_title_index % 2 == 1) {
            transform(anu_title_ele, `translateX(0px)`);
          } else {
            transform(anu_title_ele, `translateX(-${anu_title_distance}px)`);
          }
        }
      },
      reset() {
        anu_title_reset = true;
        anu_title_ele.style.webkitTransitionDuration = `${0}s`;
        anu_title_ele.style.mozTransitionDuration = `${0}s`;
        anu_title_ele.style.transitionDuration = `${0}s`;
        transform(anu_title_ele, `translateX(0px)`);
        window.cancelAnimationFrame(anu_title_animation);
      },
      check() {
        var self = this;
        var containerwidth = parseFloat(self.$el.offsetWidth);
        var wrapperwidth = parseFloat(self.refs.wrapper.offsetWidth);
        anu_title_ele = self.refs.wrapper;
        self.reset();
        var distance = 0;
        if (wrapperwidth - 30 > containerwidth) {
          anu_title_reset = false;
          self.$el.classList.add("scroll");
          distance = wrapperwidth - containerwidth;
          anu_title_distance = distance;
          anu_title_index = 0;
          self.refs.wrapper.style.webkitTransitionDuration = `${anu_title_distance / 16}s`;
          self.refs.wrapper.style.mozTransitionDuration = `${anu_title_distance / 16}s`;
          self.refs.wrapper.style.transitionDuration = `${anu_title_distance / 16}s`;
          transform(self.refs.wrapper, `translateX(-${distance}px)`);
        } else {
          if (self.$el.classList.contains("scroll")) {
            self.$el.classList.remove("scroll");
          }
          if (wrapperwidth > containerwidth - 15) {
            self.$el.classList.add("small");
          } else {
            if (self.$el.classList.contains("small")) {
              self.$el.classList.remove("small");
            }
          }
        }
      }
    }
  }
</script>
<style src="../assets/css/title.css"></style>
