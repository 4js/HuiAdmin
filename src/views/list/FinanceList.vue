<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form-model
        ref="form"
        :model="queryParam"
        layout="inline"
        :label-col="{span: 6}"
        :wrapper-col="{span:18}"
        label-align="right"
      >
        <a-row :gutter="24">
          <a-col :md="6" :sm="24">
            <a-form-model-item label="状态" prop="order_status">
              <a-select v-model="queryParam.order_status" placeholder="请选择状态">
                <a-select-option value="1">待支付</a-select-option>
                <a-select-option value="2">待发货</a-select-option>
                <a-select-option value="3">已退款</a-select-option>
                <a-select-option value="4">已发货</a-select-option>
                <a-select-option value="5">已完成</a-select-option>
                <a-select-option value="-3">待退款</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <!-- <a-col :md="6" :sm="24">
            <a-form-model-item label="绑定时间" prop="user_itime">
              <a-range-picker
                v-model="queryParam.user_itime"
                style="width: 100%"
                format="YYYY-MM-DD"
              />
            </a-form-model-item>
          </a-col> -->
          <a-col :md="6" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
              <a-button style="margin-left: 8px" @click="reset">重置</a-button>
              <!-- <a-button style="margin-left: 8px" @click="exportExcel" icon="cloud-download">导出</a-button> -->
            </span>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
    <s-table
      ref="table"
      size="default"
      row-key="user_id"
      :columns="columns"
      :data="getList"
      show-pagination="auto"
    >
      <template slot="itime" slot-scope="text">
        <span>{{ text | formateTime }}</span>
      </template>
      <template slot="puser_name" slot-scope="puser_name">
        <span>{{ puser_name || '-' }}</span>
      </template>
      <template slot="status" slot-scope="text">
        <span v-if="text==='1'">启用</span>
        <span v-else>停用</span>
      </template>
    </s-table>
  </a-card>
</template>

<script>
import Vue from 'vue'
import qs from 'qs'
import moment from 'moment'
import { STable } from '@/components'
import { ACCESS_TOKEN, ADMIN_ID } from '@/store/mutation-types'
import { getFinanceList } from '@/api/list'

export default {
  name: 'TableList',
  components: {
    STable
  },
  data () {
    return {
      roleType: Number(Vue.ls.get('ROLE_TYPE')),
      description: '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',
      mdl: {},
      // 查询参数
      queryParam: {
        order_status: '1'
      },
      // 表头
      columns: [
         {
          title: '序号',
          align: 'center',
          customRender: (text, record, index) => index + 1
        },
        // {
        //   title: '用户id',
        //   dataIndex: 'user_id'
        // },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'user_name'
        },
        {
          title: '手机号',
          align: 'center',
          dataIndex: 'tel'
        },
        {
          title: '省份',
          align: 'center',
          dataIndex: 'province_name'
        },
        {
          title: '城市',
          align: 'center',
          dataIndex: 'city_name'
        },
        {
          title: '新增时间',
          dataIndex: 'itime',
          align: 'center',
          scopedSlots: { customRender: 'itime' }
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      data: [],
      areaList: []
    }
  },
  created () {
    // getAreaList().then(res => {
    //   console.log('res', res)
    //   this.areaList = res.data
    // })
  },
  methods: {
    reset () {
      this.$refs.form.resetFields()
      this.$refs.table.refresh(true)
    },
    getList (parameter) {
      // parameter = Object.assign(parameter, this.queryParam)
      // const { user_itime: userItime, area_id: areaID } = parameter
      // if (userItime && userItime.length > 0) {
      //   parameter.user_itime_start = moment(moment(userItime[0]).format('YYYY-MM-DD 00:00:00')).valueOf() / 1000
      //   parameter.user_itime_end = moment(moment(userItime[1]).format('YYYY-MM-DD 23:59:59')).valueOf() / 1000
      // } else {
      //   parameter.user_itime_start = ''
      //   parameter.user_itime_end = ''
      // }
      // delete parameter.user_itime
      // if (areaID.length) parameter.area_id = areaID[areaID.length - 1]
      return getFinanceList(parameter).then(res => {
        console.log(res)
        return res.data
      })
    },
    exportExcel () {
      let url = ''
      const parameter = Object.assign({}, this.queryParam)
      const { user_itime: userItime, area_id: areaID } = parameter
      if (userItime && userItime.length > 0) {
        parameter.user_itime_start = moment(moment(userItime[0]).format('YYYY-MM-DD 00:00:00')).valueOf() / 1000
        parameter.user_itime_end = moment(moment(userItime[1]).format('YYYY-MM-DD 23:59:59')).valueOf() / 1000
      } else {
        parameter.user_itime_start = ''
        parameter.user_itime_end = ''
      }
      delete parameter.user_itime
      if (areaID.length) parameter.area_id = areaID[areaID.length - 1]
      parameter.isexport = 1
      const token = Vue.ls.get(ACCESS_TOKEN)
      const adminId = Vue.ls.get(ADMIN_ID)
      if (token) {
        url = qs.stringify(Object.assign({ key_token: token, admin_id: adminId }, parameter)) // 让每个请求携带自定义 token 请根据实际情况自行修改
      }
      window.open('http://test.service.agent.topasst.com/?c=user&a=index&v=manager&site=useractivity&' + url)
    }
  }
}
</script>
