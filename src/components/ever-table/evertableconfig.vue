<template>
  <el-table
    ref="configTable"
    :data="localConfigData"
    border
    class="el-td-border config-table no-vertical-border no-th mini"
    @select="handleSelectChange"
    :row-class-name="rowClassNameFn"
  >
    <el-table-column type="selection" :selectable="selectableFn"></el-table-column>
    <el-table-column prop="label" label="" class-name="draggable-td">
      <template slot-scope="scope">
        <div :class="{bold: !getRowState(scope.row).hidden}" @mousedown="handleMouseDown(scope)" @mousemove="handleMouseMove(scope)">{{scope.row.label}}</div>
      </template>
    </el-table-column>
    <el-table-column prop="width" label="" width="110">
      <template slot-scope="scope">
        <span class="dif">
          <span class="dib w30">宽度</span>
          <el-input class="config-width-input ml2" autocomplete="off" v-model="scope.row.width"></el-input>
          <span class="dib w20 ml2">px</span>
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="align" label="" width="120">
      <template slot-scope="scope">
        <span @click="changeCellValue('left', scope)" class="config-span" :class="{active: getRowState(scope.row).align === 'left'}">左</span>
        /
        <span @click="changeCellValue('center', scope)" class="config-span" :class="{active: getRowState(scope.row).align === 'center'}">中</span>
        /
        <span @click="changeCellValue('right', scope)" class="config-span" :class="{active: getRowState(scope.row).align === 'right'}">右</span>
      </template>
    </el-table-column>
    <el-table-column prop="hidden" label="" width="120">
      <template slot-scope="scope">
        <span @click="changeCellValue(false, scope)" class="config-span" :class="{active: !getRowState(scope.row).hidden, cna: scope.row.required}">显示</span>
        /
        <span @click="changeCellValue(true, scope)" class="config-span" :class="{active: getRowState(scope.row).hidden, cna: scope.row.required}">隐藏</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  const doc = document
  export default {
    props: {
      configData: Array
    },
    created () {
      // 处理数据
      this.localConfigData.forEach(item => {
        // width赋默认值
        item.width = item.width || 'auto'
        // 用viewArray来存储显示隐藏的数据
        this.viewArray.push({
          prop: item.prop,
          align: item.align || 'left',
          hidden: !!item.hidden
        })
      })
    },
    mounted () {
      // 默认勾选
      this.toggleRowSelection()
    },
    data () {
      return {
        localConfigData: this.configData,
        viewArray: [],
        dragState: {
          dragging: false,
          direction: undefined,
          start: -9,
          end: -8
        }
      }
    },
    watch: {
      configData (val) {
        this.localConfigData = val
      }
    },
    methods: {
      handleSelectChange (selection, row) {
        const viewItem = this.viewArray.find(v => row.prop === v.prop)
        if (viewItem) {
          viewItem.hidden = !selection.some(item => item.prop === row.prop)
        }
      },
      toggleRowSelection () {
        this.localConfigData.forEach(item => {
          const viewItem = this.viewArray.find(v => v.prop === item.prop)
          this.$refs.configTable.toggleRowSelection(item, !viewItem.hidden)
        })
      },
      selectableFn (row) {
        return !(row && row.required)
      },
      getRowState (row) {
        return this.viewArray.find(val => val.prop === row.prop)
      },
      rowClassNameFn ({rowIndex}) {
        let className = ''
        if (rowIndex === this.dragState.end) {
          className = `drag-end-row ${this.dragState.direction}`
        } else if (rowIndex === this.dragState.start) {
          className = `drag-start-row ${this.dragState.direction}`
        }
        return className
      },
      changeCellValue (value, {row, column}) {
        if (column.property === 'align') {
          row[column.property] = value
          this.getRowState(row).align = value
          this.viewArray = [...this.viewArray]
        } else if (column.property === 'hidden') {
          if (row.required) return
          this.getRowState(row).hidden = value
          this.toggleRowSelection()
        }
      },
      handleMouseDown ({row, $index}) {
        if (row.undraggable) return
        this.dragState.dragging = true
        this.dragState.start = $index
        doc.addEventListener('mouseup', this.handleMouseUp)
      },
      handleMouseMove ({row, $index}) {
        if (this.dragState.dragging && !row.undraggable) {
          if (this.dragState.start !== $index) {
            this.dragState.direction = this.dragState.start > $index ? 'up' : 'down'
          } else {
            this.dragState.direction = undefined
          }
          this.dragState.end = $index
        }
      },
      handleMouseUp () {
        const {start, end} = this.dragState
        if (start !== end && start >= 0 && end >= 0) {
          // 改变数据的顺序
          const tempData = []
          const isUp = start > end
          const min = isUp ? end : start - 1
          const max = isUp ? start + 1 : end
          for (let i = 0; i < this.localConfigData.length; i++) {
            if (i === end) {
              tempData.push(this.localConfigData[start])
            } else if (i > min && i < max) {
              tempData.push(this.localConfigData[isUp ? i - 1 : i + 1])
            } else {
              tempData.push(this.localConfigData[i])
            }
          }
          this.localConfigData = [...tempData]
          this.$nextTick(() => {
            this.toggleRowSelection()
          })
        }
        // 清除状态
        this.dragState = {
          dragging: false,
          direction: undefined,
          start: -9,
          end: -9
        }
        doc.removeEventListener('mouseup', this.handleMouseUp)
      }
    }
  }
</script>

<style scoped lang="less">
  .dif {
    display: inline-flex;
  }
  .dib {
    display: inline-block;
  }
  .w30 {
    width: 30px;
  }
  .w20 {
    width: 20px;
  }
  .ml2 {
    margin-left: 2px;
  }
  .cna {
    cursor: not-allowed;
  }
  .config-span {
    &:not(.cna) {
      cursor: pointer;
      &:hover {
        background-color: #fff;
      }
    }
    &.active {
      color: #1C7BEF;
      font-weight: bold;
    }
  }
  .drag-to-row {
    border: 1px dotted #666;
  }
</style>
