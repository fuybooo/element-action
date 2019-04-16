<template>
  <div>
    <div>
      <el-table
        :border="border"
        class="w"
        :data="tableData"
        ref="everTable"
      >
        <template>
          <slot name="checkbox"></slot>
          <template v-for="col of columns">
            <!--                    不使用slotCol进行渲染的列-->
            <el-table-column
              v-if="!col.slotName"
              :key="col.code || col.key"
              :fixed="col.fixed"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
            >
              <template slot-scope="scope" :col="col">
                <!--                    显示内容-->
                <template v-if="!col.isAbnormal">
                  <!--                                通过formatter显示内容-->
                  <template v-if="col.formatter">
                    {{getContentByFormatter(scope.row, scope.column, col, scope.$index)}}
                  </template>
                  <template v-else>{{scope.row[col.prop]}}</template>
                </template>
                <!--                    显示为按钮-->
                <template v-else-if="col.btns">
                  <el-button
                    v-for="(btn, index) of col.btns"
                    :key="index"
                    size="small"
                    :type="getBtnType(btn)"
                    @click="onClickHandle(col, btn, scope.row)"
                  >{{getBtnText(btn)}}
                  </el-button>
                </template>
              </template>
            </el-table-column>
            <!--                    使用slotCol进行渲染-->
            <slot v-else :name="col.slotName"></slot>
          </template>
        </template>
      </el-table>
      <template slot="checkbox" v-if="showCheckbox">
        <el-table-column
          type="selection"
        ></el-table-column>
      </template>
      <el-button @click="outerVisible = true">弹出dialog</el-button>
      <el-dialog title="外层 Dialog" :visible.sync="outerVisible">
        <ever-table :columns="c_columns"
                    :tableData="c_tableData"></ever-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="outerVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  // 内置默认按钮映射关系
  const btnTextMap = {
    edit: {name: '编辑', type: 'primary'},
    del: {name: '删除', type: 'danger'}
  }
  export default {
    name: 'EverTable',
    props: {
      columns: Array,
      tableData: Array,
      border: {
        type: Boolean,
        default: true
      },
      showCheckbox: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        outerVisible: false,
        c_columns: [
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
              'del',
            ]
          }
        ],
        c_tableData: [
          {
            code: '1',
            name: '周小童',
            gender: 1,
            price: '4,400.00',
          },
          {
            code: '2',
            name: '周大童',
            gender: 1,
            price: '4,400.00',
          },
          {
            code: '3',
            name: '周二童',
            gender: 2,
            price: '4,400.00',
          },
        ]
      }
    },
    mounted () {
      console.log(this)
    },
    methods: {
      getContentByFormatter (row, column, col, i) {
        return col.formatter(row, column, row[col.prop], i)
      },
      getBtnType (btn) {
        return btn.type || btnTextMap[btn.prop || btn].type
      },
      getBtnText (btn) {
        return btn.label || btnTextMap[btn.prop || btn].name
      },
      onClickHandle (col, btn, row) {
        this.$emit('eventChange', {col, btnProp: (btn.prop || btn), row})
      }
    }
  }
</script>

<style scoped>
  .w {
    width: 100%;
  }
</style>
