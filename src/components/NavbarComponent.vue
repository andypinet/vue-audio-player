<template>
  <div class="anu-navbar">
    <div class="anu-navbar__item anu-navbar__left">
      <slot name="anu-navbar-left"></slot>
    </div>
    <div class="anu-navbar__item anu-navbar__center">
      <slot name="anu-navbar-center"></slot>
    </div>
    <div class="anu-navbar__item anu-navbar__right">
      <slot name="anu-navbar-right"></slot>
    </div>
  </div>
</template>

<script>
  export default {
  }
</script>

<style src="../assets/css/navbar.css"></style>
