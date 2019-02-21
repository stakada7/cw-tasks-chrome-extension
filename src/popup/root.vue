<template lang="pug">
    div
      h1 MyTasks
      section(v-if="errored")
        p エラーです
      section(v-else)
        div(v-if="loading") Loading...
        ul
          li(v-for="task in tasks") {{ task.limit_time | moment }} : {{ task.body }}
</template>
<script>
  import Axios from 'Axios'
  import moment from 'moment'

  export default {
    data: () => {
      return {
        tasks: null,
        loading: true,
        errored: false
      }
    },
    mounted () {
      Axios.get('https://api.chatwork.com/v2/my/tasks', {
        headers: {'X-ChatWorkToken': ''},
        params: {
          assigned_by_account_id: '',
          status: 'open'
        }
      }).then(response => {
        this.tasks = response.data
      }).catch(error => {
        console.log(error)
        this.errored = true
      }).finally(() => {
        this.loading = false
      })
    },
    filters: {
      moment: function (date) {
        return moment.unix(date).format('YYYY/MM/DD')
      }
    }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>