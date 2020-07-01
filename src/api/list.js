/*
 * @Author: your name
 * @Date: 2020-05-11 10:04:27
 * @LastEditTime: 2020-05-28 15:06:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cloud.manager\src\api\list.js
 */
import request from '@/utils/request'

// 订单列表
export function getOrderList (data) {
  return request({
    url: '/?c=order&a=index&v=manager&site=goods',
    method: 'post',
    data
  })
}

// 用户列表
export function getUserList (data) {
  return request({
    url: '/?c=user&a=index&v=manager&site=user',
    method: 'post',
    data
  })
}

// 编辑或者更新用户
export function updateUserInfo (data) {
  const affix = data.user_id ? 'edit' : 'add'
  return request({
    url: `/?c=user&a=${affix}info&v=manager&site=user`,
    method: 'post',
    data
  })
}

// 商品列表
export function getGoodsList (data) {
  return request({
    url: '/?c=goods&a=index&v=manager&site=goods',
    method: 'post',
    data
  })
}

// 区域列表
export function getAreaList (data) {
  return request({
    url: '/?c=user&a=arealist&v=manager&site=user',
    method: 'post',
    data
  })
}

// 财务列表
export function getFinanceList (data) {
  return request({
    url: '/?c=statistics&a=index&v=manager&site=goods',
    method: 'post',
    data
  })
}

// 发货
export function faLogis (data) {
  return request({
    url: '/?c=order&a=updatewaybillnumber&v=manager&site=goods',
    method: 'post',
    data
  })
}
