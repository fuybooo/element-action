<template>
  <span class="cell-span" :class="customCellClz">
    <!--显示type为undefined的内容 即正常内容，和可以通过formatter简单格式化的内容-->
    <template v-if="!col.type">
      <ever-table-cell-content :scope="scope" :col="col" :content="getCellContent(scope, col)"></ever-table-cell-content>
    </template>
    <!--显示type有值的内容 -->
    <!--显示纯btns-->
    <template v-else-if="col.type === 'btns' && col.btns">
      <!--TODO：需要增加判断如何动态显隐按钮-->
      <template v-for="(btn, index) of getBtns(scope, col).slice(0, 3)">
        <!--根据按钮的属性确定按钮的特殊操作-->
        <ever-confirm
          v-if="btn.prop === 'del' || btn === 'del'"
          :msg="btn.desc || '确定执行删除操作吗？'"
          :action="getBtnText(btn) || '删除'"
          :placement="'left'"
          @confirm="onClickHandle(col, btn, scope.row)"></ever-confirm>
        <el-button
          v-else-if="index <= 1 || (index === 2 && getBtns(scope, col).length === 3)"
          :key="index"
          size="small"
          :type="getBtnType(btn)"
          @click="onClickHandle(col, btn, scope.row)"
        >{{getBtnText(btn)}}
        </el-button>
      </template>
      <template v-if="getBtns(scope, col).length > 3">
        <el-dropdown trigger="click" @command="onClickHandle(col, $event, scope.row)">
                    <span class="el-dropdown-link cp">
                      更多<i class="el-icon-caret-bottom"></i>
                    </span>
          <el-dropdown-menu slot="dropdown" class="table-more-operate-menu">
            <el-dropdown-item
              v-for="(btn, index) of getBtns(scope, col).slice(2)"
              :key="index"
              :command="btn.prop || btn"
            >{{getBtnText(btn)}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </template>
    <template v-else-if="col.type === 'link' || col.linkRoot || col.urlFormatter">
      <router-link v-if="getCellContent(scope, col) !== defaultCellValue" :to="getLink(col, scope.row)">
        <ever-table-cell-content :scope="scope" :col="col" :content="getCellContent(scope, col)"></ever-table-cell-content>
      </router-link>
      <template v-else>{{defaultCellValue}}</template>
    </template>
    <template v-else-if="col.type === 'eventText' || col.event">
      <a class="cp" v-if="getCellContent(scope, col) !== defaultCellValue"
         v-on:click="onClickHandle(col, col.event.prop || col.event, scope.row)">
        <ever-table-cell-content :scope="scope" :col="col" :content="getCellContent(scope, col)"></ever-table-cell-content>
      </a>
      <template v-else>{{defaultCellValue}}</template>
    </template>
  </span>
</template>

<script>
  import everTableCellContent from './evertablecellcontent.vue'
  const defaultCellValue = '--'
  // 内置默认按钮映射关系
  const btnTextMap = {
    edit: {name: '编辑', type: 'primary'},
    del: {name: '删除', type: 'danger'}
  }
  const getSafeUrl = url => {
    return url.endsWith('/') ? url.slice(0, -1) : url
  }
  export default {
    components: {everTableCellContent},
    props: ['scope', 'col'],
    data () {
      return {
        defaultCellValue
      }
    },
    computed: {
      customCellClz () {
        const classObj = {}
        if (this.col.customCellSpanClassFormatter) {
          let customCellClass = this.col.customCellSpanClassFormatter
          if (typeof this.col.customCellSpanClassFormatter === 'function') {
            customCellClass = this.col.customCellSpanClassFormatter(this.scope.row[this.col.prop], this.scope.row, this.col)
          }
          customCellClass.split(' ').forEach(key => {
            classObj[key] = true
          })
        }
        return classObj
      }
    },
    methods: {
      /* 根据默认的按钮映射关系获取按钮的类型 */
      getBtnType (btn) {
        const defaultBtn = btnTextMap[btn.prop || btn]
        if (btn.type) {
          return btn.type
        } else if (defaultBtn) {
          return defaultBtn.type
        } else {
          return 'info'
        }
      },
      /* 根据默认的按钮映射关系获取按钮的文本 */
      getBtnText (btn) {
        return btn.label || btnTextMap[btn.prop || btn].name
      },
      /* 获取当前link的url */
      getLink (col, row) {
        if (col.urlFormatter) {
          // 按照给定的格式化方法拼接
          return typeof col.urlFormatter === 'function' ? col.urlFormatter(row, col) : col.urlFormatter
        } else {
          // 按照默认方式拼接
          return `${getSafeUrl(col.linkRoot || '')}/:${row.id}`
        }
      },
      getBtns ({row}, col) {
        if (typeof col.btns === 'function') {
          return col.btns(row, col)
        } else {
          return col.btns
        }
      },
      /* 处理点击事件 */
      onClickHandle (col, event, row) {
        this.$emit('eventChange', {col, prop: (event.prop || event), row})
      },
      /* 计算单元格显示的内容 */
      /* 根据columns中的formatter函数获取要显示的内容 */
      getCellContent ({row, $index}, col) {
        if (col.formatter) {
          return this.getDefaultFormatter(col.formatter(row[col.prop], row, $index, col))
        } else {
          return this.getDefaultFormatter(row[col.prop])
        }
      },
      /* 将undefined null ''转化为 this.defaultCellValue */
      getDefaultFormatter (value) {
        if (value === undefined || value === null || value === '') {
          return this.defaultCellValue
        }
        return value
      }
    }
  }
</script>

<style scoped lang="less">

  .cp {
    cursor: pointer;
  }

  .el-dropdown-menu.table-more-operate-menu {
    padding: 1px 0;
    .el-dropdown-menu__item {
      white-space: nowrap;
    }
    .el-dropdown-menu__item + .el-dropdown-menu__item {
      border-top: 1px solid #bbb;
    }
  }
</style>
