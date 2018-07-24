<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" size="mini">
        <el-form-item label="仓库属性 :">
          <el-select v-model="filters.WID" placeholder="仓库列表" @change="getWA" size="small">
            <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.WAID" placeholder="库区" @change="getWAR" size="small">
            <el-option v-for="item in WAList" :key="item.DataID" :value="item.DataID" :label="item.ACode+' - '+item.Types">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.WARID" placeholder="所有库位" @change="getWS" size="small">
            <el-option v-for="item in WARList" :key="item.DataID" :value="item.DataID" :label="item.RName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.OwnerID" placeholder="货主" @change="getWS" size="small">
            <el-option v-for="item in ownerList" :key="item.DataID" :value="item.DataID" :label="item.Code">
            </el-option>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item label="库存属性 :">
          <el-input v-model="filters.KeyWord" placeholder="库存编码/包裹编码" size="small"></el-input>
        </el-form-item>
        <el-form-item label="流水时间 :">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="开始日期" v-model="filters.StartTime" style="width: 100%;" size="small"></el-date-picker>
          </el-col>
          <el-col :span="1" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-date-picker type="date" placeholder="结束日期" v-model="filters.EndTime" style="width: 100%;" size="small"></el-date-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="有库存">
          <el-checkbox name="type" v-model="filters.IsStock"></el-checkbox>
        </el-form-item>
        <br>
        <el-form-item label="产品属性 :">
          <el-select v-model="filters.ProductTypes" placeholder="产品类型" @change="getWS" size="small">
            <el-option value="True" label="显示包裹内产品"></el-option>
            <el-option value="False" label="不显示包裹内产品"></el-option>
          </el-select>
        </el-form-item>
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
            v-model="skuName"   
            :fetch-suggestions="querySearchAsync"   
            @select="handleSelectSearch"  
            placeholder="ID / SKU / Name"
            size="small"  
          >  
          </el-autocomplete>  
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getWS" size="small">查询</el-button>
        </el-form-item>
        <el-form-item class="pull-right">
          <el-button type="primary" v-on:click="exportStockCode" size="small">导出库存条码</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="stockList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column prop="DataID" label="序号" sortable width="100">
      </el-table-column>
      <el-table-column prop="" label="位置" width="120">
        <template slot-scope="scope">
            <p>{{scope.row.Rack.Rcode}} <br> {{scope.row.Rack.Types}}</p>
        </template>
      </el-table-column>
      <el-table-column label="库存编码" prop="OrderID" width="">
      </el-table-column>
      <el-table-column label="包裹编码" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Package.FreightNo}} <br> {{scope.row.Package.Name}}</p>
        </template>
      </el-table-column>
      <el-table-column label="包裹规格" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Package.Weight}}g <br>{{scope.row.Package.Length}}cm <br>{{scope.row.Package.Width}}cm<br>{{scope.row.Package.Height}}cm</p>
        </template>
      </el-table-column>
      <el-table-column label="报关信息" prop="" width="">
        <template slot-scope="scope">
            <p>{{scope.row.DeclareName}} <br> {{scope.row.DeclareValue}}</p>
        </template>
      </el-table-column>
      <el-table-column label="库存" prop="" width="">
        <template slot-scope="scope">
            <p>{{scope.row.QuantityAll}} / {{scope.row.Quantity}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="" label="时间">
        <template slot-scope="scope">
            <p>{{scope.row.Date | cutDate}} <br> {{scope.row.UpdateDate | cutDate}}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">流水</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-size="pageSize" :page-sizes="[20, 30, 50, 100]" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog :title="'指定包裹的库存流水: '+activeStock" v-model="editFormVisible" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-form-item label="流水时间 :">
          <el-col :span="5">
            <el-date-picker type="date" placeholder="开始日期" v-model="filters.StartTime" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col :span="1" style="text-align: center;">-</el-col>
          <el-col :span="5">
            <el-date-picker type="date" placeholder="结束日期" v-model="filters.EndTime" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-button class="pull-right" size="small" type="primary" @click="downloadFlow">导出流水</el-button>
        </el-form-item>
        <el-table :data="editForm.Flow" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border max-height="400">
          <el-table-column label="库存编码" prop="FreightNo">
          </el-table-column>
          </el-table-column>
          <el-table-column label="原数量" width="100" prop="OldQuantity">
          </el-table-column>
          <el-table-column label="流水" width="100" prop="Quantity">
          </el-table-column>
          <el-table-column label="来源单号" width="" prop="ReferenceID">
          </el-table-column>
          <el-table-column label="时间" width="" prop="Date">
          </el-table-column>
        </el-table>
      </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">关闭</el-button>
        <!-- <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button> -->
      </div>
    </el-dialog>
  </section>
</template>

<script>
  import util from '../../common/js/util'
  import { getWSList, WPSkuSearch, SpuSearch, getWarehouseList, getWAListTree, getWARList, getOwnerListTree, queryStockFlow, WSFlowDownLoad } from '../../api/api';
  let qs = require('qs');
  const format = require('date-fns/format');
  export default {
    data() {
      return {
        filters: {
          WID: '',
        },
        //仓库列表
        warehouses: [],
        //库区列表
        WAList:[],
        //库位列表
        WARList:[],
        //库存列表
        stockList:[],
        //货主列表
        ownerList:[],
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
          OrderID: '',
        },
        //当前库存编码
        activeStock:'',
        //变更状态
        changeStatus:'',
        //搜索完成的显示名称
        skuName: ''
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.page = val;
        this.getWS();
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.getWS();
      },
      //获取库存列表
      getWS() {
        let para = qs.stringify({
          Page: this.page,
          QueryLimitNumber: this.pageSize,
          WID: this.filters.WID,
          WAID: this.filters.WAID,
          WARID: this.filters.WARID,
          OwnerID: this.filters.OwnerID,
          StartTime: format(this.filters.StartTime, 'YYYY-MM-DD'),
          EndTime: format(this.filters.EndTime, 'YYYY-MM-DD'),
          SkuID: this.filters.SkuID,
          SkuIDs: this.filters.SkuIDs,
          IsStock: this.filters.IsStock?'True':'False',
          ProductTypes: this.filters.ProductTypes,
          KeyWord: this.filters.KeyWord
        });
        this.listLoading = true;
        // NProgress.start();
        getWSList(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.stockList = res.data.Stock;
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
        this.getWS()
         
          //do something  
      },
      //搜索sku
      //queryString 为在框中输入的值  
      //callback 回调函数,将处理好的数据推回  
      querySearchAsync(queryString, callback) {
        if (!queryString) {
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
        this.getWS()
         
          //do something  
      },
      //显示编辑界面,查看库存流水
      handleEdit: function (index, row) {
        console.log(row.OrderID);
        this.activeStock = row.OrderID
        this.editFormVisible = true;
        let para = {
          DataID: row.DataID
        }
        queryStockFlow(para).then((res) => {
          this.editForm = res.data
        })
      },
      //下载指定库存流水
      downloadFlow: function(){
        let para = {
          DataID: this.editForm.Head.DataID
        }
        WSFlowDownLoad(para).then((res) => {
          if(res.data.Ack){
            location.href = util.baseUrl("/"+res.data.Create.File);
          }
        });
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //获取仓库列表,用于搜索查询
      getWSListehouses() {
        getWarehouseList().then((res) => {
          this.warehouses = res.data.DataList;
        });
      },
      //获取库区简化列表,用于搜索查询
      getWA() {
        let para = qs.stringify({
          WID: this.filters.WID
        })
        getWAListTree(para).then((res) => {
          this.WAList = res.data.WarehouseArea;
        });
      },
      //获取库位列表,用于搜索查询
      getWAR() {
        let para = qs.stringify({
          WID: this.filters.WID,
          FID: this.filters.WAID
        })
        getWARList(para).then((res) => {
          this.WARList = res.data.DataList;
        });
      },
      //获取货主简化列表，用于查询
      getOwnerList() {
        getOwnerListTree().then((res) => {
          this.ownerList = res.data.DataList
        })
      },
      //导出库存条码
      exportStockCode(){
        let routeData = this.$router.resolve({path: '/stockCode'});
        window.open(routeData.href, '_blank');
      }
    },
    filters: {
      cutDate: function(date) {
        return date.split(' ')[0]
      },
    },
    mounted() {
      this.getWS();
      this.getWSListehouses();
      this.getOwnerList()
    }
  }

</script>

<style scoped>
.el-form-item{
  margin-bottom: 10px!important
}
</style>