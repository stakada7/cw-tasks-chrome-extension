<template lang="pug">
  el-row
    el-col(:span="24")
      el-tabs(v-model="activeTab" @tab-click="changeTab")
        el-tab-pane(label="create" name="create")
          section(v-if="errored")
            p Error!!
          section(v-else)
            el-row
              el-col(:span="20")
                el-input(placeholder="task" v-model="newTaskBody" clearable autofocus="true")
              el-col(:span="4")
                el-button(type="primary" :disabled="CreatingTask" @click="createTask()") Create
            el-row
              el-col(:span="24")
                el-radio-group(v-model="newTaskDate")
                  el-radio-button(label="Today")
                  el-radio-button(label="Tomorrow")
                  el-radio-button(label="Weekend")
                  el-radio-button(label="Next Week")
                  el-radio-button(label="Next Weekend")
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
              el-table-column(width="120")
                template(slot-scope="scope")
                  el-button(size="mini" type="danger" :disabled="ChangingTask" icon="el-icon-d-arrow-right" @click="toggleTask('done', scope.row.task_id, scope.row.room.room_id)") Done
        el-tab-pane(label="done" name="done")
          section(v-if="errored")
            p Error!!
          section(v-else)
            div(v-if="loading") Loading...
            el-table(:data="descLimitTimeOrder" stripe)
              el-table-column(width="120")
                template(slot-scope="scope")
                  el-button(size="mini" type="success" :disabled="ChangingTask" icon="el-icon-d-arrow-left" @click="toggleTask('open', scope.row.task_id, scope.row.room.room_id)") Open
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

  let cwToken = ''
  let myId = ''
  let myRoomId = ''

  export default {
    data: () => {
      return {
        tasks: null,
        loading: true,
        errored: false,
        activeTab: 'open',
        newTaskBody: '',
        newTaskDate: 'Today',
        creating: false,
        changing: false
      }
    },
    beforeCreate () {
      Axios.get('https://api.chatwork.com/v2/my/tasks', {
        headers: {'X-ChatWorkToken': cwToken},
        params: {
          assigned_by_account_id: myId,
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
      },
      CreatingTask: {
        get () {
          return this.creating
        }
      },
      ChangingTask: {
        get () {
          return this.changing
        }
      }
    },
    filters: {
      moment: function (date) {
        return moment.unix(date).format('YYYY/MM/DD')
      }
    },
    methods: {
      toggleTask (body, taskId, roomId) {
        this.changing = true
        Axios.put(`https://api.chatwork.com/v2/rooms/${roomId}/tasks/${taskId}/status`, qs.stringify({'body': body}), {
          headers: {'X-ChatWorkToken': cwToken}
        }).then(response => {
          this.tasks = this.tasks.filter(task => {
            return String(task.task_id) !== String(response.data.task_id)
          })
        }).catch(error => {
          console.log(error)
          this.errored = true
        }).finally(() => {
          this.changing = false
        })
      },
      changeTab (tab = {'name': 'open'}) {
        if (tab.name === 'create') { return }

        this.tasks = []
        this.loading = true
        Axios.get('https://api.chatwork.com/v2/my/tasks', {
          headers: {'X-ChatWorkToken': cwToken},
          params: {
            assigned_by_account_id: myId,
            status: tab.name
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
      createTask () {
        this.creating = true
        var limit = ''
        switch (this.newTaskDate) {
          case 'Today':
            limit = moment().unix()
            break
          case 'Tomorrow':
            limit = moment().add(1, 'd').unix()
            break
          case 'Weekend':
            limit = moment().day('Friday').unix()
            break
          case 'Next Week':
            limit = moment().day('Monday').unix()
            break
          case 'Next Weekend':
            limit = moment().day('Friday').add(7, 'd').unix()
            break
        }
        var params = {
          body: this.newTaskBody,
          limit: limit,
          to_ids: ''
        }
        Axios.post(`https://api.chatwork.com/v2/rooms/${myRoomId}/tasks`, qs.stringify(params), {
          headers: {'X-ChatWorkToken': cwToken}
        }).then(response => {
          this.newTaskBody = ''
          this.newTaskDate = 'Today'
        }).catch(error => {
          console.log(error)
          this.errored = true
        }).finally(() => {
          this.loading = false
          this.creating = false
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
    min-width: 600px;
  }
</style>