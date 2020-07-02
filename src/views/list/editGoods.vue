<template>
  <a-card :bordered="false">
    <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-row>
        <a-col :span="12">
          <a-form-model-item label="商品名">
            <a-input v-model="form.goods_name" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="商品编号">
            <a-input v-model="form.goods_sn" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="型号">
            <a-input v-model="form.model" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="规格">
            <a-input v-model="form.specification" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="价格">
            <a-input-number :step="1" :min="0" :max="100000" :precision="2" v-model="form.goods_price" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="原价">
            <a-input-number :step="1" :min="0" :max="100000" :precision="2" v-model="form.goods_original_price" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="描述">
            <a-input v-model="form.goods_describe" type="textarea" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="排序">
            <a-input-number :step="1" :min="0" :max="100000" :precision="0" v-model="form.sort" />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-form-model-item label="封面图">
        <a-upload
          name="avatar"
          list-type="picture-card"
          class="avatar-uploader"
          :show-upload-list="false"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :before-upload="beforeUpload"
          @change="fengChange"
        >
          <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
          <div v-else>
            <a-icon :type="loading ? 'loading' : 'plus'" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
      </a-form-model-item>
      <a-form-model-item label="轮播图">
        <a-upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          list-type="picture-card"
          :file-list="fileList"
          @preview="handlePreview"
          @change="handleChange"
        >
          <div v-if="fileList.length < 8">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
      </a-form-model-item>
      <a-form-model-item label="详情图">
        <a-upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          list-type="picture-card"
          :file-list="fileList"
          @preview="handlePreview"
          @change="handleChange"
        >
          <div v-if="fileList.length < 8">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
      </a-form-model-item>
      <a-form-model-item label="运费">
        <a-table
          style="width: 500px"
          :columns="columns"
          :dataSource="data"
          :pagination="false"
          :loading="memberLoading"
        >
          <template slot="area" slot-scope="text, record">
            <a-cascader
              v-if="record.editable"
              :value="text"
              :options="areaOptions"
              :load-data="loadData"
              placeholder="地区"
              @change="(v, options) => areaChange(v, record.key, 'area', options)"
            />
            <template v-else>{{ text }}</template>
          </template>
          <template slot="fee" slot-scope="text, record">
            <a-input-number
              v-if="record.editable"
              :value="text"
              :step="1"
              :min="0"
              :max="100000"
              :precision="0"
              @change="value => feiChange(value, record.key, 'fee')"
            />
            <template v-else>{{ text }}</template>
          </template>
          <template slot="operation" slot-scope="text, record">
            <template v-if="record.editable">
              <span v-if="record.isNew">
                <a @click="saveRow(record)">添加</a>
                <a-divider type="vertical" />
                <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key)">
                  <a>删除</a>
                </a-popconfirm>
              </span>
              <span v-else>
                <a @click="saveRow(record)">保存</a>
                <a-divider type="vertical" />
                <a @click="cancel(record.key)">取消</a>
              </span>
            </template>
            <span v-else>
              <a @click="toggle(record.key)">编辑</a>
              <a-divider type="vertical" />
              <a-popconfirm title="是否要删除此行？" @confirm="remove(record.key)">
                <a>删除</a>
              </a-popconfirm>
            </span>
          </template>
        </a-table>
        <a-button style="width: 500px; margin-top: 16px; margin-bottom: 8px" type="dashed" icon="plus" @click="newMember">新增运费</a-button>
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">提交</a-button>
        <a-button style="margin-left: 10px;">取消</a-button>
      </a-form-model-item>
    </a-form-model>
  </a-card>
</template>
<script>
// import Vue from 'vue'
// import qs from 'qs'
// import moment from 'moment'
// import { STable } from '@/components'
// import { ACCESS_TOKEN, ADMIN_ID } from '@/store/mutation-types'
import { getAreaList } from '@/api/list'
function getBase64 (img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
export default {
  name: 'TableList',
  data () {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        goods_name: '',
        goods_sn: '',
        goods_price: 0,
        goods_original_price: 0,
        model: '',
        sort: 10,
        specification: '',
        goods_describe: '',
        banner_img: '',
        cover_img: '',
        detail_img: ''
      },
      loading: false,
      imageUrl: '',
      // 上传图片
      previewVisible: false,
      previewImage: '',
      fileList: [],
      // 运费
      memberLoading: false,
      columns: [
        {
          title: '地区',
          dataIndex: 'area',
          key: 'area',
          scopedSlots: { customRender: 'area' }
        },
        {
          title: '运费(元)',
          dataIndex: 'fee',
          key: 'fee',
          scopedSlots: { customRender: 'fee' }
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      data: [
        {
          key: '1',
          area: [],
          province_name: '',
          city_name: '',
          fee: 20,
          editable: false
        },
        {
          key: '2',
          area: [],
          province_name: '',
          city_name: '',
          fee: 20,
          editable: false
        },
        {
          key: '3',
          area: [],
          province_name: '',
          city_name: '',
          fee: 20,
          editable: false
        }
      ],
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
    onSubmit () {
      console.log('submit!', this.form)
    },
    fengChange (info) {
      if (info.file.status === 'uploading') {
        this.loading = true
        return
      }
      if (info.file.status === 'done') {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, imageUrl => {
          this.imageUrl = imageUrl
          this.loading = false
        })
      }
    },
    beforeUpload (file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        this.$message.error('You can only upload JPG file!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('Image must smaller than 2MB!')
      }
      return isJpgOrPng && isLt2M
    },
    handleCancel () {
      this.previewVisible = false
    },
    async handlePreview (file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },
    handleChange ({ fileList }) {
      this.fileList = fileList
    },
    areaChange (value, key, column, options) {
      console.log(value, key, column, options)
      const newData = [...this.data]
      const target = newData.find(item => key === item.key)
      if (target) {
        target[column] = value
        target.province_name = options[0].label
        target.city_name = options[1].label
        this.data = newData
      }
    },
    feiChange (value, key, column) {
      const newData = [...this.data]
      const target = newData.find(item => key === item.key)
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    saveRow (record) {
      this.memberLoading = true
      const { key, name, workId, department } = record
      if (!name || !workId || !department) {
        this.memberLoading = false
        this.$message.error('请填写完整成员信息。')
        return
      }
      // 模拟网络请求、卡顿 800ms
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ loop: false })
        }, 800)
      }).then(() => {
        const target = this.data.find(item => item.key === key)
        target.editable = false
        target.isNew = false
        this.memberLoading = false
      })
    },
    remove (key) {
      const newData = this.data.filter(item => item.key !== key)
      this.data = newData
    },
    toggle (key) {
      const target = this.data.find(item => item.key === key)
      target._originalData = { ...target }
      target.editable = !target.editable
    },
    getRowByKey (key, newData) {
      const data = this.data
      return (newData || data).find(item => item.key === key)
    },
    cancel (key) {
      const target = this.data.find(item => item.key === key)
      Object.keys(target).forEach(key => { target[key] = target._originalData[key] })
      target._originalData = undefined
    },
    newMember () {
      const length = this.data.length
      this.data.push({
        key: length === 0 ? '1' : (parseInt(this.data[length - 1].key) + 1).toString(),
        area: '',
        fee: 5,
        editable: false
      })
    }
  }
}
</script>
<style lang='less' scoped>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
