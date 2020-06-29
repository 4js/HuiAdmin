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
            <a-form-model-item label="姓名或手机号" prop="user_name_tel">
              <a-input v-model="queryParam.user_name_tel" placeholder="请输入用户手机号" />
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
              <a-button style="margin-left: 8px" type="primary" @click="showApplyModal()">新增</a-button>
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
      <template slot="action" slot-scope="text, scope">
        <a @click="showApplyModal(scope)">编辑</a>
      </template>
    </s-table>
    <a-modal v-model="addUserModal" title="编辑" @ok="handleOk" okText="确定" cancelText="取消">
      <a-form-model ref="addRoleForm" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="姓名" prop="user_name">
          <a-input v-model="form.user_name" :maxLength="11"/>
        </a-form-model-item>
        <a-form-model-item label="手机号" prop="tel">
          <a-input v-model="form.tel" :maxLength="11"/>
        </a-form-model-item>
        <a-form-model-item label="地区" prop="area">
          <a-cascader v-model="form.area" :options="areaOptions" :load-data="loadData" placeholder="地区"/>
        </a-form-model-item>
        <a-form-model-item label="抵扣券" prop="coupon_money">
          <a-input-number :step="1" :min="0" :max="100000" :precision="0" v-model="form.coupon_money" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </a-card>
</template>

<script>
import Vue from 'vue'
import qs from 'qs'
import moment from 'moment'
import { STable } from '@/components'
import { ACCESS_TOKEN, ADMIN_ID } from '@/store/mutation-types'
import { getUserList, getAreaList, updateUserInfo } from '@/api/list'

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
        user_name_tel: ''
      },
      // 表头
      columns: [
         {
          title: '序号',
          align: 'center',
          customRender: (text, record, index) => index + 1
        },
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
      // 编辑或者新增
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      addUserModal: false,
      modalTitle: '新增用户',
      form: {
        user_name: '',
        tel: '',
        area: [],
        coupon_money: 0
      },
      rules: {
        user_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        tel: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        area: [{ required: true, message: '请选择区域', trigger: 'blur' }]
      },
      areaOptions: []
    }
  },
  created () {
    getAreaList({ area_id: 100000 }).then(res => {
      const arr = res.data.list.map(item => {
        return {
          label: item.area_name,
          value: item.area_id,
          isLeaf: false
        }
      })
      this.areaOptions = arr
    })
  },
  methods: {
    reset () {
      this.$refs.form.resetFields()
      this.$refs.table.refresh(true)
    },
    loadData (selectedOptions) {
      const targetOption = selectedOptions[selectedOptions.length - 1]
      targetOption.loading = true
      getAreaList({ area_id: targetOption.value }).then(res => {
        const arr = res.data.list.map(item => {
          return {
            label: item.area_name,
            value: item.area_id
          }
        })
        targetOption.loading = false
        targetOption.children = arr
        this.areaOptions = [...this.areaOptions]
      })
    },
    getList (parameter) {
      parameter = Object.assign(parameter, this.queryParam)
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
      return getUserList(parameter).then(res => {
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
    },
    showApplyModal (user) {
      let modalTitle = '新增用户'
      let mdl = {}
      if (user) {
        this.form = {
          user_name: user.user_name,
          tel: user.tel,
          coupon_money: user.coupon_money
        }
        mdl = user
        modalTitle = '编辑用户'
      }
      this.mdl = mdl
      this.modalTitle = modalTitle
      this.addUserModal = true
    },
    handleOk () {
      this.$refs.addRoleForm.validate(valid => {
        if (valid) {
          const userData = Object.assign({}, this.form)
          userData.coupon_money = +userData.coupon_money
          userData.province_id = userData.area[0]
          userData.city_id = userData.area[1]
          userData.county_id = userData.area[1]
          delete userData.area
          updateUserInfo(userData).then(res => {
            if (res) {
              this.$refs.table.refresh()
              this.$message.success('更新成功')
              this.addUserModal = false
            }
          })
        }
      })
    }
  }
}
</script>
