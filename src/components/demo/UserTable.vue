<template>
  <ever-table
    :columns="columns"
    :tableData="tableData"
    @eventChange="eventChange"
  >
  </ever-table>
</template>

<script>
  import EverTable from '../EverTable'
  import axios from '../../util/http'

  export default {
    name: 'UserTable',
    components: {
      EverTable
    },
    data: function () {
      return {
        columns: [
          {
            prop: 'code',
            label: '编号'
          },
          {
            prop: 'name',
            label: '姓名'
          },
          {
            prop: 'gender',
            label: '性别',
            formatter: (r, c, v) => {
              if (v === 1) {
                return '男'
              } else if (v === 2) {
                return '女'
              } else {
                return ''
              }
            }
          },
          {
            prop: 'price',
            label: '出价'
          },
          {
            key: 'ever-op', // 该列的唯一标示
            isAbnormal: true, // 非正常显示
            label: '操作',
            btns: [
              {
                prop: 'edit',
                label: '编辑2'
              },
              'del'
            ]
          }
        ],
        tableData: [
          {
            code: '1',
            name: '周小童',
            gender: 1,
            price: '4,400.00'
          },
          {
            code: '2',
            name: '周大童',
            gender: 1,
            price: '4,400.00'
          },
          {
            code: '3',
            name: '周二童',
            gender: 2,
            price: '4,400.00'
          }
        ]
      }
    },
    methods: {
      eventChange ({btnProp, col, row}) {
        console.log(btnProp, col, row)
      }
    },
    mounted () {
      // axios.get('./static/assets/mock/demo/user.json').then(res => {
      //   console.log(res)
      // })
      // ajax('url', 'data', 'get')
      console.log(axios.ajax('url', 'data', 'get'))
    }
  }
</script>

<style scoped>

</style>
