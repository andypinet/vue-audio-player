import Vue from 'vue'
import App from './App'
import Home from './components/HomeComponent'
import VueRouter from 'vue-router'
import 'assets/lib/anu.lyrics'
import 'assets/lib/anu.pattern'

const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.use(VueRouter)

const router = new VueRouter()

router.map({
  '/': {
    component: Home
  }
})

router.start(App, '#app')

