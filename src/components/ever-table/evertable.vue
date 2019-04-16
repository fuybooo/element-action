<template>
  <div>
    <div>
      <el-table
        ref="everTable"
        v-loading.body="loading"
        class="w ever-table"
        :border="border"
        :class="tableClz"
        :data="data"
        @selection-change="handleSelectionChange"
        :row-class-name="classNameFormatter"
        :highlight-current-row="isSingleTable"
        @current-change="handleCurrentChange"
        @header-dragend="headerDragend"
        :cell-class-name="cellClassNameFn"
        :header-cell-class-name="headerCellClassNameFn"
      >
        <template>
          <!--判断是否显示多选框-->
          <template v-if="showCheckbox">
            <el-table-column
              type="selection"
            ></el-table-column>
          </template>
          <template v-for="(col, index) of localColumns">
            <!--不使用slot进行渲染-->
            <el-table-column
              v-if="!col.slotName && !col.hidden"
              :key="index"
              :fixed="col.fixed"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
              :align="col.align"
              :column-key="index.toString()"
            >
              <!--渲染表头-->
              <template slot="header" slot-scope="scope">
                <!--是否可配置，一般放在最后一列的表头上-->
                <span v-if="configOption && index === localColumns.length - 1">
                  <span>{{scope.column.label}}</span>
                  <span @click="dialogVisible = true" class="icon iconfont icon-biaoge-shezhi ever-table-config"></span>
                </span>
                <span v-else-if="isDragTable && !col.undraggable" class="thead-cell"
                      @mousedown="handleMouseDown($event, scope.column)"
                      @mousemove="handleMouseMove($event, scope.column)"
                >
                  <span>{{scope.column.label}}</span>
                </span>
                <template v-else>{{scope.column.label}}</template>
              </template>
              <!--渲染内容-->
              <template slot-scope="scope" :col="col">
<!--                {{col}}-->
                <ever-table-cell :scope="scope" :col="col" @eventChange="eventChange($event)"></ever-table-cell>
              </template>
            </el-table-column>
            <!--使用slot进行渲染-->
            <slot v-else :name="col.slotName"></slot>
          </template>
        </template>
      </el-table>
      <el-dialog :visible.sync="dialogVisible" v-if="configOption" class="bt">
        <span slot="title">自定义列 <a class="restore" @click="restore">恢复默认</a></span>
        <ever-table-config v-if="dialogVisible" ref="configTable" :configData="configData"></ever-table-config>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">
            取消
          </el-button>
          <el-button @click="submit" type="primary">
            确认
          </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import everTableCell from './evertablecell.vue'
  import everTableConfig from './evertableconfig.vue'
  import api from './evertableconfigapi.js'

  /**
   * @Description: everTable插件，使用方法：TODO
   * @author fuyongbo@everjiankang.com
   * @date 2019-04-02
   */
  const doc = document
  // 默认的主键 依次查看 id code name 是否存在于columns中，如果都不存在则会在选择是报错
  const primaryKeys = ['id', 'code', 'name']
  export default {
    components: {everTableCell, everTableConfig},
    props: {
      columns: {
        type: Array,
        default () {
          return []
        },
        required: true
      },
      data: {
        type: Array,
        default () {
          return []
        },
        required: true
      },
      tableClass: {
        type: String,
        default: ''
      },
      border: {
        type: Boolean,
        default: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      isSingleTable: {
        type: Boolean,
        default: false
      },
      isDragTable: {
        type: Boolean,
        default: false
      },
      showCheckbox: {
        type: Boolean,
        default: false
      },
      primaryKey: {
        type: String
      },
      specialCellConfig: {
        type: [Object, Array]
      },
      configOption: {
        type: Object
      }
    },
    computed: {
      tableClz () {
        const classObj = {}
        if (this.tableClass) {
          this.tableClass.split(' ').forEach(key => {
            classObj[key] = true
          })
        }
        return {
          'el-td-border': this.border,
          'moving': this.dragState.dragging,
          'draggable-table': this.isDragTable,
          ...classObj
        }
      },
      key () {
        let primaryKey = this.primaryKey || primaryKeys.find(key => this.localColumns.some(item => item.prop === key))
        if (!primaryKey) {
          throw Error('请指定表格的主键primaryKey')
        }
        return primaryKey
      }
    },
    data () {
      return {
        localColumns: this.columns,
        currentRow: null,
        multipleSelection: [],
        dragState: {
          start: -9,
          end: -9,
          dragging: false,
          direction: undefined
        },
        dialogVisible: false,
        configData: []
      }
    },
    watch: {
      columns (val) {
        this.localColumns = val
      }
    },
    created () {
      if (this.configOption) {
        api.getConfig({
          tableId: this.configOption.tableConfigId,
          // todo 测试阶段
          thcCOrigId: 1,
          thcCDoctorId: 1
        }).then(res => {
          if (res.data.config) {
            this.setData(res.data.config)
          } else {
            // 初始化数据
            api.getStaticConfig().then((resp) => {
              if (resp.head.errCode === 0) {
                this.setData(resp.data.config)
              }
            })
          }
        })
      }
    },
    mounted () {
    },
    methods: {
      /* 多选时记录选中的条目，并将选中的数据加上标记 */
      handleSelectionChange (val) {
        if (this.showCheckbox) {
          this.multipleSelection = val
          // 尽量不去改变父组件的数据，TODO
          this.data.forEach(data => {
            data._selected = val.some(item => item[this.key] === data[this.key])
          })
        }
      },
      /* 给选中的行加上特殊类 */
      classNameFormatter ({row}) {
        return this.showCheckbox ? (row._selected ? 'selected' : '') : ''
      },
      /* 单选时记录当前选中的行 */
      handleCurrentChange (val) {
        if (this.isSingleTable) this.currentRow = val
      },
      /* 获取拖拽下表头的样式 */
      headerCellClassNameFn ({column}) {
        // 判断哪些表头可以拖拽，哪些不能
        let dragClass = ''
        const crtColumn = this.localColumns.find(item => column.property === item.prop)
        if (crtColumn && !crtColumn.undraggable) {
          dragClass = 'draggable'
        }
        const active = column.columnKey - 0 === this.dragState.end ? `drag-active-${this.dragState.direction}` : ''
        const start = column.columnKey - 0 === this.dragState.start ? `drag-start` : ''
        return `${active} ${start} ${dragClass}`
      },
      /* 单元格的样式 */
      cellClassNameFn ({row, column}) {
        let specialCellClassName = ''
        // 存在特殊单元格配置 则根据特殊单元格配置 为单元格的className赋值
        if (this.specialCellConfig && (Array.isArray(this.specialCellConfig) || this.specialCellConfig.prop)) {
          specialCellClassName = 'spe-cell'
          // 如果配置是单个对象，则根据该配置为匹配的单元格赋值
          if (this.specialCellConfig.prop &&
            row[this.specialCellConfig.prop] === this.specialCellConfig.value &&
            column.property === this.specialCellConfig.prop) {
            specialCellClassName += ' ' + this.specialCellConfig.className
          } else if (Array.isArray(this.specialCellConfig)) {
            this.specialCellConfig.forEach(item => {
              if (row[item.prop] === item.value && column.property === item.prop) {
                specialCellClassName += ' ' + item.className
              }
            })
          }
        }
        // const dragClassName = columnIndex === this.dragState.start ? 'drag-start' : ''
        return specialCellClassName
      },

      /* 拖拽事件处理 */
      handleMouseDown (e, column) {
        this.dragState.dragging = true
        this.dragState.start = parseInt(column.columnKey)
        doc.addEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseUp () {
        this.dragColumn(this.dragState)
        // TODO 问题1：拖拽最后一列时（如果最后一列允许拖拽）会产生index不对的问题，再次拖拽会导致表格内容更新不即使的问题
        this.dragState = {
          start: -9,
          end: -8,
          dragging: false,
          direction: undefined
        }
        doc.removeEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseMove (e, column) {
        if (this.dragState.dragging) {
          const index = parseInt(column.columnKey)
          if (index - this.dragState.start !== 0) {
            this.dragState.direction = index - this.dragState.start < 0 ? 'left' : 'right'
          } else {
            this.dragState.direction = undefined
          }
          this.dragState.end = parseInt(column.columnKey)
        } else {
          return false
        }
      },
      dragColumn ({start, end}) {
        if (start !== end && start >= 0 && end >= 0) {
          const tempData = []
          const min = Math.min(start, end)
          const max = Math.max(start, end)
          for (let i = 0; i < this.localColumns.length; i++) {
            if (i === end) {
              tempData.push(this.localColumns[start])
            } else if (i < min || i > max) {
              // 不受影响的列
              tempData.push(this.localColumns[i])
            } else if (min === end) {
              // 向左划 tempData中第end的位置存start的列，end + i的位置存
              if (i > min && i <= max) {
                tempData.push(this.localColumns[i - 1])
              }
            } else if (min === start) {
              if (i >= min && i < max) {
                tempData.push(this.localColumns[i + 1])
              }
            }
            // if (i === end) {
            //   tempData.push(this.localColumns[start])
            // } else if (i > min && i < max) {
            //   tempData.push(this.localColumns[isLeft ? i - 1 : i + 1])
            // } else {
            //   tempData.push(this.localColumns[i])
            // }
          }
          this.localColumns = [...tempData]
          // 在调整顺序之后，需要将此时的配置信息保存到后台，并且同步到配置表格
          this.setConfigData()
          this.save(false)
        }
      },
      headerDragend (nw, ow, c) {
        // 在localColumns上和configData上都改变对应列都宽度
        const localItem = this.localColumns.find(item => item.prop === c.property)
        localItem.width = nw
        // this.localColumns = [...this.localColumns]
        const configItem = this.configData.find(item => item.prop === c.property)
        configItem.width = nw
        // this.configData = [...this.configData]
        this.save(false)
      },
      eventChange ($event) {
        this.$emit('eventChange', $event)
      },
      /* 配置表格相关事件 */
      /* 恢复默认 */
      setData (config) {
        try {
          this.configData = JSON.parse(config)
        } catch (e) {
          throw Error('配置文件转换失败')
        }
        // 将this.localColumns的配置信息修改成从配置文件中取出来的配置
        this.setLocalColumns()
      },
      restore () {
        api.getStaticConfig().then((res) => {
          if (res.head.errCode === 0) {
            this.setData(res.data.config)
            this.save()
          }
        })
      },
      save (close = true) {
        // 将数据保存到后台
        if (this.configOption) {
          api.saveConfig({
            tableId: this.configOption.tableConfigId,
            config: JSON.stringify(this.configData),
            // todo 测试阶段
            thcCOrigId: 1,
            thcCDoctorId: 1
          }).then(res => {
            if (res.head.errCode === 0) {
              // 提示保存成功
              // 恢复默认之后需要将弹窗关闭，若不关闭，则需要解决勾选框与数据同步的问题（需要发送事件）
              if (close) {
                this.dialogVisible = false
              }
            }
          })
        }
      },
      /* 保存配置 */
      submit () {
        // TODO 在配置的过程中配置如何避免auto的列别隐藏的问题
        // 执行保存操作
        const configTable = this.$refs.configTable
        const mergedData = [...configTable.localConfigData.map(item => {
          const viewItem = configTable.viewArray.find(v => v.prop === item.prop)
          return {
            ...item,
            ...viewItem
          }
        })]
        // 在配置列表中修改数据时候，同步到数据展示页面
        this.configData = [...mergedData]
        this.setLocalColumns()
        this.save()
      },
      setLocalColumns () {
        // 一般来说，localColumns中存在，configData中却不存在数据就是操作列了，一般来说只有1个操作列
        this.localColumns = [...this.configData.filter(item => !item.hidden).map(item => {
          // 找到本地配置的item，与configItem合并，得到最终item
          const localItem = this.localColumns.find(c => c.prop === item.prop)
          return {
            ...localItem,
            width: item.width === 'auto' ? undefined : item.width,
            align: item.align || 'left',
            hidden: item.hidden
          }
        }), ...this.configData.filter(item => item.hidden),
          ...this.localColumns.filter(item => !this.configData.some(c => c.prop === item.prop))]
      },
      setConfigData () {
        // 一般来说，configData是localColumns到子集，根据localColumns 同步configData
        // 此方法只同步width和顺序
        this.configData = [...this.localColumns.filter(item => this.configData.some(c => c.prop === item.prop)).map(item => {
          const configItem = this.configData.find(c => c.prop === item.prop)
          return {
            ...configItem,
            width: item.width
          }
        })]
      }
    }
  }
</script>


<style scoped lang="less">
  .w {
    width: 100%;
  }

  .moving {
    opacity: 0.5;
  }

  .icon.ever-table-config {
    float: right;
    color: #666;
    font-size: 14px;
    line-height: 14px;
    margin-top: 2px;
  }
  .restore {
    cursor: pointer;
    color: #1C7BEF;
    margin-left: 15px;
    font-size: 14px;
  }
</style>
