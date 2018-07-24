<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.Mode" placeholder="仓库列表" @change="getWP">
            <el-option value="All" label="全部"></el-option>
            <el-option value="Used" label="正常"></el-option>
            <el-option value="Stop" label="禁止"></el-option>
            <el-option value="Delete" label="下架"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.KeyWord" placeholder="库存编码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-autocomplete   
            :fetch-suggestions="querySearchAsync"   
            @select="handleSelectSearch"  
            placeholder="ID / SKU / Name"  
          >  
          </el-autocomplete>  
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getWP">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="WPList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column prop="DataID" label="序号" sortable width="100">
      </el-table-column>
      <el-table-column label="库存编码" sortable prop="FreightNo" width="180">
      </el-table-column>
      <el-table-column label="重量" sortable width="100">
        <template slot-scope="scope">
            <p>{{scope.row.Weight}} g</p>
        </template>
      </el-table-column>
      <el-table-column label="规格" width="100">
        <template slot-scope="scope">
            <p>{{scope.row.Length}}cm <br>{{scope.row.Width}}cm<br>{{scope.row.Height}}cm</p>
        </template>
      </el-table-column>
      <el-table-column label="产品匹配" sortable>
        <template slot-scope="scope">
            <p v-for="p in scope.row.Product">[{{p.Product.Status}}] [{{p.Product.FullName}}] {{p.Product.FullSKU}} * {{p.Product.Quantity}}</p>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="状态" sortable prop="Status" width="100">
      </el-table-column>
      <el-table-column prop="Date" label="时间" sortable>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">设置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-sizes="[20, 30, 50, 100]" :page-size="pageSize" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="库存编码">
          <el-col :span="10">
            <el-input v-model="editForm.FreightNo" auto-complete="off" :disabled="true"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="重量">
            <el-col :span="3"><el-input v-model="editForm.Weight" auto-complete="off"></el-input></el-col> 
            <el-col :span="5"><label>单位g</label></el-col>
            <el-col :span="2"><label>规格</label></el-col> 
            <el-col :span="3"><el-input v-model="editForm.Length" auto-complete="off"></el-input></el-col>
            <el-col :span="3"><el-input v-model="editForm.Width" auto-complete="off"></el-input></el-col>
            <el-col :span="3"><el-input v-model="editForm.Height" auto-complete="off"></el-input></el-col>
            <el-col :span="5"><label>长宽高，单位cm</label></el-col>
        </el-form-item>
        <el-form-item label="状态设置">
          <el-select v-model="changeStatus">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="禁止" value="禁止"></el-option>
            <el-option label="下架" value="下架"></el-option>
          </el-select>
          <el-button type="primary" @click.native="setStatus(editForm.DataID)">变更状态</el-button>
        </el-form-item>
        <el-form-item label="" label-width="0px">
        <el-col :span="16">
          <strong class="title">产品列表</strong>
        <el-table :data="editForm.Product" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
        <el-table-column label="产品" sortable>
          <template slot-scope="scope">
              <p>[{{scope.row.Product.Status}}] [{{scope.row.Product.FullName}}] {{scope.row.Product.FullSKU}} * {{scope.row.Product.Quantity}}</p>
          </template>
        </el-table-column>
        </el-table-column>
        <el-table-column label="数量" sortable width="100">
          <template slot-scope="scope">
            <el-input v-model="scope.row.Quantity"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      </el-col>
      <el-col :span="8" style="padding-bottom: 20px;">
        <el-form-item>
          <el-autocomplete   
            v-model="searchName"   
            :fetch-suggestions="querySearchAsync"   
            @select="handleSelectEdit"  
            placeholder="ID / SKU / Name"  
          >  
          </el-autocomplete>  
        </el-form-item>
      </el-col>
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
        <el-form-item label="库存编码">
          <el-col :span="10">
            <el-input v-model="addForm.FreightNo" auto-complete="off" :disabled="true"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="重量">
            <el-col :span="3"><el-input v-model="addForm.Weight" auto-complete="off"></el-input></el-col> 
            <el-col :span="5"><label>单位g</label></el-col>
            <el-col :span="2"><label>规格</label></el-col> 
            <el-col :span="3"><el-input v-model="addForm.Length" auto-complete="off"></el-input></el-col>
            <el-col :span="3"><el-input v-model="addForm.Width" auto-complete="off"></el-input></el-col>
            <el-col :span="3"><el-input v-model="addForm.Height" auto-complete="off"></el-input></el-col>
            <el-col :span="5"><label>长宽高，单位cm</label></el-col>
        </el-form-item>
        <el-form-item label="" label-width="0px">
          <el-col :span="16">
            <strong class="title">产品列表</strong>
            <el-table :data="addForm.Product" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="产品" sortable>
                <template slot-scope="scope">
                    <p>[{{scope.row.Product.Status}}] [{{scope.row.Product.FullName}}] {{scope.row.Product.FullSKU}} * {{scope.row.Product.Quantity}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="数量" sortable width="100">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.Quantity"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                  <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="8" style="padding-bottom: 20px;">
            <el-form-item>
              <el-autocomplete   
                v-model="skuName"   
                :fetch-suggestions="querySearchAsync"   
                @select="handleSelectEdit"  
                placeholder="ID / SKU / Name"  
              >  
              </el-autocomplete>  
            </el-form-item>
          </el-col>
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
  import { getWPList, WPSkuSearch, WPSave, WPSetStatus, WPProductDelete, getWAList } from '../../api/api';
  let qs = require('qs');
  export default {
    data() {
      return {
        filters: {
          WID: '',
          Mode:'Used'
        },
        //包裹列表
        WPList: [],
        total: 0,
        page: 1,
        pageSize:20,
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
          Weight: '',
          Length: '',
          Width: '',
          Height: '',
          Product: [],
          Status:''
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
          DataID: 0,
          Weight: '',
          Length: '',
          Width: '',
          Height: '',
          Product: [],
        },
        //搜索完成的显示名称
        skuName: '',
        searchName:''
      }
    },
    methods: {
      //改变页数
      handleCurrentChange(val) {
        this.page = val;
        this.getWP();
      },//改变每页显示数量
      handleSizeChange(val) {
        this.pageSize = val;
        this.getWP();
      },
      //获取包裹
      getWP() {
        let para = {
          Page: this.page,
          Mode: this.filters.Mode,
          SkuID: this.filters.SkuID,
          KeyWord: this.filters.KeyWord
        };
        this.listLoading = true;
        // NProgress.start();
        getWPList(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.WPList = res.data.DataList;
          this.listLoading = false;
          // NProgress.done();
        });
      },
      //搜索
      //queryString 为在框中输入的值  
      //callback 回调函数,将处理好的数据推回  
      querySearchAsync(queryString, callback) {
        if (!queryString) {
          this.filters.SkuID = ''
          return
        }
        let para = qs.stringify({
          KeyWord: queryString
        });
        var list = [{}];  
         //从后台获取到对象数组  
        WPSkuSearch(para).then((res)=>{  
            //在这里为这个数组中每一个对象加一个value字段, 因为autocomplete只识别value字段并在下拉列中显示  
            for(let i of res.data.DataList){  
                i.value  = '[' + i.Status + ']' + '[' + i.FullSKU + ']' + i.FullName;  //将CUSTOMER_NAME作为value  
            }  
            list = res.data.DataList;  
            callback(list);  
        }).catch((error)=>{  
        console.log(error);  
        });  
      },
      //搜索栏选中后的处理函数
      handleSelectSearch(item) {  
        this.filters.SkuID = item.DataID
        this.searchName = item.FullName
        this.getWP()
         
          //do something  
      },
      //编辑新增弹出框中搜索产品选中后的处理函数
      handleSelectEdit(item) {  
        if (!this.addFormVisible) {
          this.editForm.Product.push({Product:item,Quantity:1})
        }else{
          this.addForm.Product.push({Product:item,Quantity:1})
        } 
          //do something  
      },
      //删除产品
      handleDel: function (index, row) {
        console.log(222)
        if(!row.SkuID){
          this.addFormVisible || this.editForm.Product.splice(index, 1);
          this.addFormVisible && this.addForm.Product.splice(index, 1);
          return
        }
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = qs.stringify({ FID: this.editForm.DataID, SkuID: row.SkuID});
          WPProductDelete(para).then((res) => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.getWP();
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
          DataID: 0,
          Weight: '',
          Length: '',
          Width: '',
          Height: '',
          Product: [],
        };
      },
      //编辑
      editSubmit: function () {
        this.editLoading = true;
        let productJson = {};
        productJson.Product = [];
        this.editForm.Product.forEach(function (item, index) {
          productJson.Product.push({"SkuID": item.Product.DataID, "Quantity": item.Quantity});
        })
        let para = qs.stringify({
          DataID: this.editForm.DataID,
          Weight: this.editForm.Weight,
          Length: this.editForm.Length,
          Width: this.editForm.Width,
          Height: this.editForm.Height,
          Product: JSON.stringify(productJson)
        });
        WPSave(para).then((res) => {
          this.editLoading = false;
          this.$message({
            message: '提交成功',
            type: 'success'
          });
          this.$refs['editForm'].resetFields();
          this.editFormVisible = false;
          this.getWP();
        });
      },
      //新增
      addSubmit: function () {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.addLoading = true;
              let productJson = {};
              productJson.Product = [];
              this.addForm.Product.forEach(function (item, index) {
                productJson.Product.push({"SkuID": item.Product.DataID, "Quantity": item.Quantity});
              })
              let para = qs.stringify({
                DataID: 0,
                Weight: this.addForm.Weight,
                Length: this.addForm.Length,
                Width: this.addForm.Width,
                Height: this.addForm.Height,
                Product: JSON.stringify(productJson)
              });
              WPSave(para).then((res) => {
                this.editLoading = false;
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['addForm'].resetFields();
                this.addFormVisible = false;
                this.getWP();
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
        WPSetStatus(para).then((res) => {
          this.listLoading = false;
          this.$message({
            message: '包裹的状态设置成功',
            type: 'success'
          });
          this.editFormVisible = false;
          this.getWP();
        });
      },
    },
    filters: {
      
    },
    mounted() {
      this.getWP();
    }
  }

</script>

<style scoped>

</style>