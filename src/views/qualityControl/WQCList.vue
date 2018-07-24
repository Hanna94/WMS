<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.WID" placeholder="仓库列表" @change="getList" size="small">
            <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.OwnerID" placeholder="货主" @change="getList" size="small">
            <el-option v-for="item in ownerList" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.KeyWord" placeholder="库存编码/包裹编码" size="small"></el-input>
        </el-form-item>
        <!-- <el-form-item>
          <el-input v-model="filters.SPU" placeholder="SPU"></el-input>
        </el-form-item> -->
        <el-form-item>
          <el-autocomplete   
            :fetch-suggestions="querySearchSpu"   
            @select="handleSelectSpu"  
            placeholder="SPU / Name / SkuID"  
            size="small"
          >  
          </el-autocomplete>  
        </el-form-item>
        <el-form-item>
          <el-autocomplete   
            :fetch-suggestions="querySearchAsync"   
            @select="handleSelectSearch"  
            placeholder="ID / SKU / Name"  
            size="small"
          >  
          </el-autocomplete>  
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getList" size="small">查询</el-button>
          <el-button type="primary" v-on:click="downloadFile" size="small">下载库存编码</el-button>
          <!-- <button type="button" class="btn btn-primary"v-on:click="getPdf()">导出PDF</button> -->
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table id="pdfDom" :data="WQCList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column prop="DataID" label="序号" width="80">
      </el-table-column>
      <el-table-column label="位置" width="80">
        <template slot-scope="scope">
            <p>{{scope.row.GeoCode.Code}}</p>
        </template>
      </el-table-column>
      <el-table-column label="库存编码/包裹编码" width="180">
        <template slot-scope="scope">
            <p>{{scope.row.OrderID}}/{{scope.row.Package.FreightNo}}</p>
        </template>
      </el-table-column>
      <el-table-column label="包含产品" width="300">
        <template slot-scope="scope">
            <p v-for="p in scope.row.Package.Product">[{{p.Product.Status}}] [{{p.Product.FullName}}] {{p.Product.FullSKU}} * {{p.Product.Quantity}}</p>
        </template>
      </el-table-column>
      <el-table-column label="包裹规格" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Package.Weight}} g<br>{{scope.row.Package.Length}}*{{scope.row.Package.Width}}*{{scope.row.Package.Height}}cm</p>
        </template>
      </el-table-column>
      <el-table-column label="属性" width="80">
        <template slot-scope="scope">
          <el-tag type="danger" v-show="scope.row.StockIn.Level!=='普通'">{{scope.row.StockIn.Level | changePara}}</el-tag>
          <el-tag type="primary" v-show="scope.row.StockIn.NewProduct!=='普通'">{{scope.row.StockIn.NewProduct | changePara}}</el-tag>
        </template>
      </el-table-column>
      </el-table-column>
      <el-table-column label="待质检数量" prop="Quantity" width="100">
      </el-table-column>
      <el-table-column label="执行数量" prop="">
        <template slot-scope="scope">
        <el-input placeholder="" v-model="scope.row.executeQuantuty"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="UpdateDate" label="时间" width="">
        <template slot-scope="scope">
            <p>{{scope.row.UpdateDate | cutDate}}</p>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->

    <el-col :span="24" class="toolbar">
      转入库区 
      <el-select v-model="WARID" placeholder="库区列表" size="small">
        <el-option v-for="item in WAList" :key="item.DataID" :value="item.DataID" :label="item.Warehouse.Name+' - '+item.Types">
        </el-option>
      </el-select>
      <el-button type="primary" @click="execute" :disabled="this.sels.length===0" size="small">执行</el-button>
      <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-sizes="[20, 30, 50, 100]" :page-size="pageSize" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>


  </section>
</template>

<script>
  import util from '../../common/js/util'
  //import NProgress from 'nprogress'
  import { getWQCList, WPSkuSearch, getWarehouseList, getOwnerListTree, getWAList, executeWQC, SpuSearch, WQCDownLoad} from '../../api/api';
  let qs = require('qs');
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
        WQCList:[],
        WAList:[],
        WARID:'',
        total: 0,
        page: 1,
        pageSize:20,
        // size: 20,
        listLoading: false,
        sels: [],//列表选中列
        //搜索完成的显示名称
        skuName: '',
        searchName:'',
        htmlTitle: '质检单'

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
          SkuID: this.filters.SkuID,
          SkuIDs: this.filters.SkuIDs,
          OwnerID: this.filters.OwnerID,
          WID: this.filters.WID,
          KeyWord: this.filters.KeyWord
          // Mode: 'InService'
        };
        this.listLoading = true;
        // NProgress.start();
        getWQCList(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.WQCList = res.data.DataList;
          this.listLoading = false;
          // NProgress.done();
        });
      },
      //搜索SPU
      //queryString 为在框中输入的值  
      //callback 回调函数,将处理好的数据推回  
      querySearchSpu(queryString, callback) {
        if (!queryString) {
          this.filters.SkuIDs = ''
          return
        }
        let para = qs.stringify({
          KeyWord: queryString
        });
        var list = [{}];  
         //从后台获取到对象数组  
        SpuSearch(para).then((res)=>{  
            //在这里为这个数组中每一个对象加一个value字段, 因为autocomplete只识别value字段并在下拉列中显示  
            for(let i of res.data.Spu){  
                i.value  = '[' + i.SPU + ']' + i.Name;  //将CUSTOMER_NAME作为value  
            }  
            list = res.data.Spu;  
            callback(list);  
        }).catch((error)=>{  
        console.log(error);  
        });  
      },
      //搜索栏选中后的处理函数
      handleSelectSpu(item) {  
        this.filters.SkuIDs = item.SkuIDList
        // this.searchName = item.FullName
        this.getList()
         
          //do something  
      },
      //搜索SKU
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
        console.log(sels)
      },
      //执行质检操作
      execute: function(){
        let stockJson = []
        this.sels.forEach(function(item, index){
          console.log(item)
          item.executeQuantuty && stockJson.push({DataID:item.DataID,Quantity:item.executeQuantuty})
        })
        let para = JSON.stringify({ WARID: this.WARID, Stock:stockJson});
        executeWQC(para).then((res) => {
          this.listLoading = false;
          //NProgress.done();
          this.$message({
            message: '执行质检操作成功',
            type: 'success'
          });
          this.getList();
          });
      },
      //批量删除
      batchRemove: function () {
        var ids = this.sels.map(item => item.id,).toString();
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
      //导出库存编码表格
      downloadFile: function(){
        let para = qs.stringify({ 
          SkuID: this.filters.SkuID,
          SkuIDs: this.filters.SkuIDs,
          OwnerID: this.filters.OwnerID,
          WID: this.filters.WID,
          KeyWord: this.filters.KeyWord,
        });
        WQCDownLoad(para).then((res) => {
          this.listLoading = false;
          this.$message({
            message: '导出库存编码表格',
            type: 'success'
          });
          location.href = util.baseUrl(res.data.Create.File);
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
      //获取库区列表
      getWA() {
        getWAList().then((res) => {
          this.WAList = res.data.DataList;
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
      this.getWA();
    }
  }

</script>

<style scoped>
.el-form-item{
  margin-bottom: 10px!important
}
</style>