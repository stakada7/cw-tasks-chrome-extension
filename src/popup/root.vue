<template lang="pug">
  el-tabs(v-model="activeTab" @tab-click="changeTab")
    el-tab-pane(label="open" name="open")
      section(v-if="errored")
        p Error!!
      section(v-else)
        div(v-if="loading") Loading...
        el-table(:data="ascLimitTimeOrder" stripe)
          el-table-column(label="DATE" width="120")
            template(slot-scope="scope")
              i(class="el-icon-time")
              span(style="margin-left: 10px") {{ scope.row.limit_time | moment }}
          el-table-column(label="TASK" width="360")
            template(slot-scope="scope")
              span {{ scope.row.body }}
          el-table-column(width="80")
            template(slot-scope="scope")
              el-button(size="mini" type="danger" @click="toggleTask('done', scope.row.task_id, scope.row.room.room_id)") Done
    el-tab-pane(label="done" name="done")
      section(v-if="errored")
        p Error!!
      section(v-else)
        div(v-if="loading") Loading...
        el-table(:data="descLimitTimeOrder" stripe)
          el-table-column(width="80")
            template(slot-scope="scope")
              el-button(size="mini" type="success" @click="toggleTask('open', scope.row.task_id, scope.row.room.room_id)") Open
          el-table-column(label="DATE" width="120")
            template(slot-scope="scope")
              i(class="el-icon-time")
              span(style="margin-left: 10px") {{ scope.row.limit_time | moment }}
          el-table-column(label="TASK" width="360")
            template(slot-scope="scope")
              span {{ scope.row.body }}
</template>
<script>
  import Axios from 'Axios'
  import moment from 'moment'
  import qs from 'qs'
  import _ from 'lodash'

  export default {
    data: () => {
      return {
        tasks: null,
        loading: true,
        errored: false,
        activeTab: 'open'
      }
    },
    beforeCreate () {
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
    computed: {
      ascLimitTimeOrder () {
        return _.sortBy(this.tasks, 'limit_time')
      },
      descLimitTimeOrder () {
        return _.orderBy(this.tasks, 'limit_time', 'desc')
      }
    },
    filters: {
      moment: function (date) {
        return moment.unix(date).format('YYYY/MM/DD')
      }
    },
    methods: {
      toggleTask (body, taskId, roomId) {
        Axios.put(`https://api.chatwork.com/v2/rooms/${roomId}/tasks/${taskId}/status`, qs.stringify({'body': body}), {
          headers: {'X-ChatWorkToken': ''}
        }).then(response => {
          this.tasks = this.tasks.filter(task => {
            return String(task.task_id) !== String(response.data.task_id)
          })
        }).catch(error => {
          console.log(error)
          this.errored = true
        }).finally(() => {
        })
      },
      changeTab (tab = {'name': 'open'}) {
        this.tasks = []
        this.loading = true
        Axios.get('https://api.chatwork.com/v2/my/tasks', {
          headers: {'X-ChatWorkToken': ''},
          params: {
            assigned_by_account_id: '',
            status: tab.name
          }
        }).then(response => {
          this.tasks = response.data
          console.log(this.tasks)
        }).catch(error => {
          console.log(error)
          this.errored = true
        }).finally(() => {
          this.loading = false
        })
      }
    }
  }
</script>
<style lang="scss">
  .el-col {
    border-radius: 4px;
  }
  .el-row {
    margin-bottom: 2px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-header, .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 30px;
  }
  body > .el-container {
    margin-bottom: 4px;
  }
</style>