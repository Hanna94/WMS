<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.WID" placeholder="仓库列表" @change="getList">
            <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.OwnerID" placeholder="货主" @change="getList">
            <el-option v-for="item in ownerList" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.KeyWord" placeholder="库存编码/包裹编码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.SPU" placeholder="SPU"></el-input>
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
          <el-button type="primary" v-on:click="getList">查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table id="pdfDom" :data="WQCFlow" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column prop="DataID" label="序号" sortable width="100">
      </el-table-column>
      <el-table-column label="操作类型" width="">
        <template slot-scope="scope">
            <p>{{scope.row.QC.Types}}</p>
        </template>
      </el-table-column>
      <el-table-column label="库存编码/包裹编码" width="180">
        <template slot-scope="scope">
            <p>{{scope.row.Stock.OrderID}}<br>{{scope.row.Package.FreightNo}}</p>
        </template>
      </el-table-column>
      <el-table-column label="包含产品" width="350">
        <template slot-scope="scope">
            <p v-for="p in scope.row.Package.Product">[{{p.Product.Status}}] [{{p.Product.FullName}}] {{p.Product.FullSKU}} * {{p.Product.Quantity}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="" label="操作数量" width="">
        <template slot-scope="scope">
            <p>{{scope.row.QC.Quantity}}</p>
        </template>
      </el-table-column>
      <el-table-column label="数据流向" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Stock.Rcode}} -> {{scope.row.MoveToStock.Rcode}}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作人" prop="" width="100">
        <template slot-scope="scope">
            <p>{{scope.row.User.TrueName}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="Date" label="时间" width="150">
        <template slot-scope="scope">
            <p>{{scope.row.Date | cutDate}}</p>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-sizes="[20, 30, 50, 100]" :page-size="pageSize" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>


  </section>
</template>

<script>
  import util from '../../common/js/util'
  //import NProgress from 'nprogress'
  import { getWQCFlow, WPSkuSearch, getWarehouseList, getOwnerListTree,} from '../../api/api';
  export default {
    data() {
      return {
        filters: {
          WID: '',
          OwnerID:'',
          SkuID:'',
          SkuIDs:'',
          KeyWord:'',
        },
        warehouses: [],
        ownerList:[],
        WQCFlow:[],
        total: 0,
        page: 1,
        pageSize:20,
        // size: 20,
        listLoading: false,
        sels: [],//列表选中列
        //搜索完成的显示名称
        skuName: '',
        searchName:'',
        htmlTitle: '页面导出PDF文件名'

      }
    },
    methods: {
      //改变页数
      handleCurrentChange(val) {
        this.page = val;
        this.getList();
      },//改变每页显示数量
      handleSizeChange(val) {
        this.pageSize = val;
        this.getList();
      },
      //获取包裹
      getList() {
        let para = {
          Page: this.page,
          QueryLimitNumber: this.pageSize,
          Mode: this.filters.Mode,
          SkuID: this.filters.SkuID,
          KeyWord: this.filters.KeyWord
          // Mode: 'InService'
        };
        this.listLoading = true;
        // NProgress.start();
        getWQCFlow(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.WQCFlow = res.data.DataList;
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
        this.getList()
         
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
      //删除
      handleDel: function (index, row) {
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
            this.getList();
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
        // this.$refs.editForm.validate((valid) => {
          // if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
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
                this.getList();
              });
            // });
          // }
        // });
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
                this.getList();
              });
            // });
          }
        });
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id).toString();
        this.$confirm('确认删除选中记录吗？', '提示', {
          type: 'warning'
        }).then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { ids: ids };
          batchRemoveUser(para).then((res) => {
            this.listLoading = false;
            //NProgress.done();
            this.$message({
              message: '删除成功',
              type: 'success'
            });
            this.getList();
          });
        }).catch(() => {

        });
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
          this.getList();
        });
      },
      //获取仓库列表,用于搜索查询
      getwarehouses() {
        getWarehouseList().then((res) => {
          this.warehouses = res.data.DataList;
        });
      },
      //获取货主简化列表，用于搜索查询
      getOwnerList() {
        getOwnerListTree().then((res) => {
          this.ownerList = res.data.DataList;
        });
      },
    },
    filters: {
      cutDate: function(date) {
        return date.split(' ')[0]
      },
      changePara: function(value) {
        value === "普通"?value = '':value = value    
        return value
      }
    },
    mounted() {
      this.getList();
      this.getwarehouses();
      this.getOwnerList();
    }
  }

</script>

<style scoped>
.el-form-item{
  margin-bottom: 10px!important
}
</style>