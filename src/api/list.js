/*
 * @Author: your name
 * @Date: 2020-05-11 10:04:27
 * @LastEditTime: 2020-05-28 15:06:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cloud.manager\src\api\list.js
 */
import request from '@/utils/request'

// 员工列表
export function getMemberList (data) {
  return request({
    url: '?c=member&a=index&v=manager&site=useractivity',
    method: 'post',
    data
  })
}

// 领导列表
export function getLeaderList (data) {
  return request({
    url: '?c=leader&a=index&v=manager&site=useractivity',
    method: 'post',
    data
  })
}

// 新增或修改领导
export function updateLeader (data) {
  const affix = data.leader_id ? 'updateinfo' : 'addinfo'
  return request({
    url: `?c=leader&a=${affix}&v=manager&site=useractivity`,
    method: 'post',
    data
  })
}

// 导入员工
export function addJobNumber (data) {
  return request({
    url: '?c=member&a=importjobnumber&v=manager&site=useractivity',
    method: 'post',
    data
  })
}

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

// 区域公告列表
export function getNoticeList (data) {
  return request({
    url: '?c=areanotice&a=index&v=manager&site=useractivity',
    method: 'post',
    data
  })
}

// 更新公告
export function updateNotice (data) {
  return request({
    url: '?c=areanotice&a=updateinfo&v=manager&site=useractivity',
    method: 'post',
    data
  })
}
