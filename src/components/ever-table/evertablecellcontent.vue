<template>
  <span class="cell-content">
    <span v-if="col.beforeHtmlFormatter" v-html="getStaticHtml(col.beforeHtmlFormatter)"></span><span>{{content}}</span><span v-if="col.afterHtmlFormatter" v-html="getStaticHtml(col.afterHtmlFormatter)"></span>
  </span>
</template>

<script>
  // 内置默认按钮映射关系
  export default {
    props: ['scope', 'col', 'content'],
    methods: {
      getStaticHtml (htmlFormatter) {
        return typeof htmlFormatter === 'function' ? htmlFormatter(this.scope.row[this.col.prop], this.scope.row, this.col) : htmlFormatter
      }
    }
  }
</script>

<style scoped lang="less">

  /*.cell-content {*/
  /*  display: inline-flex;*/
  /*}*/
</style>
