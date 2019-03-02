import Vue from 'vue'
import root from './root.vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.use(ElementUI, { locale })
/* eslint-disable no-new */
new Vue({
  el: '#root',
  render: h => h(root)
})
