const methods = {
  post (url, data) {
    console.log('post', url, data)
  },
  get (url, data) {
    console.log('get', url, data)
  }
}
function ajax (url, data, method) {
  methods[method](url, data)
}
export const getUrl = (url) => url + '/'
export default {
  ...methods, ajax
}
