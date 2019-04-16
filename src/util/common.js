const path = '/to/path/'
const urlMap = {
  user: 'user'
}
for (const k in urlMap) {
  urlMap[k] = path + urlMap[k]
}
export default urlMap


// 改变数组的顺序
const list = [
  {
    name: 'a'
  },
  {
    name: 'b'
  },
  {
    name: 'c'
  },
  {
    name: 'd'
  },
]
/* 将list中 end的位置换为start， 中间的顺序改变如下
* 1. start > end 则 end 到 start 之间的依次提升一位 即 start变为 start - 1 ； start - 1 变为 start - 2 。。。
* 2. start < end 则 start 到 end 之间的依次减少一位 即 start 变为 start + 1； start + 1 变为 start + 2 。。。*/
function change (start, end) {

  console.log(list)
}
