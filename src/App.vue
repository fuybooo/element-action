<template>
  <div id="app">
    <p>使用columns进行渲染</p>
    <user-table></user-table>
    <hr>
    <p>使用slot进行渲染</p>
    <phone-table></phone-table>
    <hr>
    <p>含有多选框的表格</p>
<!--    <multiple-table></multiple-table>-->
    <hr>
    <p>表单测试</p>
    <user-form></user-form>
  </div>
</template>

<script>
import UserTable from './components/demo/UserTable.vue'
import PhoneTable from './components/demo/PhoneTable.vue'
import MultipleTable from './components/demo/MultipleTable.vue'
import UserForm from './components/demo/UserForm'

export default {
  name: 'app',
  components: {
    UserTable,
    PhoneTable,
    MultipleTable,
    UserForm
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 40px;
}
  hr {
    margin-top: 30px;
    margin-bottom: 30px;
  }
</style>
