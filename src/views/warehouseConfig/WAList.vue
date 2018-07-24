<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.WID" placeholder="仓库列表" @change="getWA">
            <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getWA">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="waList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" border>
      <!-- <el-table-column type="selection" width="55"> -->
      </el-table-column>
      <el-table-column prop="DataID" width="100" label="编号">
      </el-table-column>
      <el-table-column label="编码" width="180">
        <template slot-scope="scope">
            <p>{{scope.row.Warehouse.Code}} {{scope.row.Code}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="Types" width="100" label="类型">
      </el-table-column>
      <el-table-column prop="Name" width="180" label="库区名称">
      </el-table-column>
      <el-table-column label="状态" min-width="100" prop="Status">
      </el-table-column>
      <el-table-column prop="Date" label="时间" min-width="180">
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">设置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <!-- <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
      </el-pagination>
    </el-col> -->

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="编码" placeholder="此编码在仓库启用后，不能修改，只能使用一个">
          <el-col :span="10">
            <el-select v-model="editForm.WID" placeholder="仓库列表">
              <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name">
              </el-option>
            </el-select>
            </el-col>
            <el-col :span="14">
              <el-input v-model="editForm.Code" auto-complete="off" :disabled="true"></el-input>
            </el-col>
        </el-form-item>
        <el-form-item label="地址">
          <el-col :span="10">
            <el-select v-model="editForm.Types" placeholder="库区类型">
              <el-option label="操作区" value="操作区"></el-option>
              <el-option label="存储区" value="存储区"></el-option>
              <el-option label="待检区" value="待检区"></el-option>
              <el-option label="集货区" value="集货区"></el-option>
              <el-option label="活动区" value="活动区"></el-option>
              <el-option label="残次区" value="残次区"></el-option>
            </el-select>
          </el-col>
            <el-col :span="14">
              <el-input v-model="editForm.Name" auto-complete="off" placeholder="名称"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="状态设置">
          <el-select v-model="changeStatus">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="停用" value="停用"></el-option>
          </el-select>
          <el-button type="primary" @click.native="setStatus(editForm.DataID)">变更状态</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--新增界面-->
    <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="编码" placeholder="此编码在仓库启用后，不能修改，只能使用一个">
          <el-col :span="10">
            <el-select v-model="addForm.WID" placeholder="仓库列表">
              <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name">
              </el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="地址">
          <el-col :span="10">
            <el-select v-model="addForm.Types" placeholder="库区类型">
              <el-option label="操作区" value="操作区"></el-option>
              <el-option label="存储区" value="存储区"></el-option>
              <el-option label="待检区" value="待检区"></el-option>
              <el-option label="集货区" value="集货区"></el-option>
              <el-option label="活动区" value="活动区"></el-option>
              <el-option label="残次区" value="残次区"></el-option>
            </el-select>
          </el-col>
            <el-col :span="14">
              <el-input v-model="addForm.Name" auto-complete="off" placeholder="名称"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="状态设置">
          <el-select v-model="addForm.Status">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="停用" value="停用"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--状态设置-->
<!--     <el-dialog title="变更状态" v-model="statusFormVisible" :close-on-click-modal="false">
      <el-form :model="statusForm" label-width="100px" ref="statusForm">
        <el-form-item label="当前状态">
          <el-input v-model="editForm.Status" :disabled="true" auto-complete="off" style="width:215px"></el-input>
        </el-form-item>
        <el-form-item label="其完全够">
          <el-input v-model="addForm.Code" style="width:215px"></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="addForm.Contacts" style="width:215px"></el-input>
        </el-form-item>
        <el-form-item label="状态设置">
          <el-select v-model="addForm.Status" :disabled="true">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="停用" value="停用"></el-option>
          </el-select>
          <el-button type="primary" @click.native="setStatus(editForm.DataID)">变更状态</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog> -->


  </section>
</template>

<script>
  import { getWarehouseList, getWAList, WASave, WASetStatus } from '../../api/api';
  let qs = require('qs');
  export default {
    data() {
      return {
        filters: {
          WID: ''
        },
        warehouses: [],
        waList: [],
        total: 0,
        page: 1,
        listLoading: false,
        sels: [],//列表选中列

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ]
        },
        //编辑界面数据
        editForm: {
          DataID: 0,
          Name:'',
          WID: '',
          Types: '',
        },

        //变更状态
        changeStatus:'',

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ]
        },
        //新增界面数据
        addForm: {
          DataID: '',
          Name:'',
          WID: '',
          Status:'正常'
        }

      }
    },
    methods: {
      handleCurrentChange(val) {
        this.page = val;
        this.getWA();
      },
      //获取仓库列表
      getWA() {
        let para = qs.stringify({
          page: this.page,
          WID: this.filters.WID
        });
        this.listLoading = true;
        // NProgress.start();
        getWAList(para).then((res) => {
          this.total = res.data.total;
          this.waList = res.data.DataList;
          this.listLoading = false;
          // NProgress.done();
        });
      },
      //删除
      handleDel: function (index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = qs.stringify({ DataID: row.id });
          userDelete(para).then((res) => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.getWarehouses();
          });
        }).catch(() => {

        });
      },
      //显示编辑界面
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.changeStatus = row.Status;
      },
      //显示新增界面
      handleAdd: function () {
        this.addFormVisible = true;
        this.addForm = {
          DataID: '',
          Code: '',
          Name: '',
          Contacts: '',
          Status:'正常'
        };
      },
      //编辑
      editSubmit: function () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              let para = qs.stringify(Object.assign({}, this.editForm));
              WASave(para).then((res) => {
                this.editLoading = false;
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['editForm'].resetFields();
                this.editFormVisible = false;
                this.getWA();
              });
            // });
          }
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              let para = qs.stringify(Object.assign({}, this.addForm));
              WASave(para).then((res) => {
                this.addLoading = false;
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['addForm'].resetFields();
                this.addFormVisible = false;
                this.getWA();
              });
            // });
          }
        });
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //状态设置
      setStatus: function(id){
        let para = qs.stringify({ DataID: id, Status: this.changeStatus});
        WASetStatus(para).then((res) => {
          this.listLoading = false;
          this.$message({
            message: '库区状态设置成功',
            type: 'success'
          });
          this.getWA();
        });
      },
      //获取仓库列表,用于搜索查询
      getWarehouses() {
        getWarehouseList().then((res) => {
          this.warehouses = res.data.DataList;
        });
      },
    },
    filters: {
      
    },
    mounted() {
      this.getWA();
      this.getWarehouses();
    }
  }

</script>

<style scoped>

</style>