<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters" size="mini">
        <el-form-item>
          <el-select v-model="filters.Mode" placeholder="" @change="getList" size="small">
            <el-option value="UnComplete" label="待处理"></el-option>
            <el-option value="Complete" label="完成"></el-option>
            <el-option value="Cancel" label="取消"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.WID" placeholder="仓库列表" @change="getList" size="small">
            <el-option v-for="item in warehouses" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.FreightID" placeholder="货代" @change="getList" size="small">
            <el-option v-for="item in freightList" :key="item.DataID" :value="item.DataID" :label="item.ERPFreight.Code+' ['+item.ERPFreight.Name+']'"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.Types" placeholder="出库单类别" @change="getList" size="small">
            <el-option value="销售出库" label="销售出库"></el-option>
            <el-option value="盘点出库" label="盘点出库"></el-option>
            <el-option value="退货出库" label="退货出库"></el-option>
            <el-option value="调拨出库" label="调拨出库"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.KeyWord" placeholder="search..." size="small"></el-input>
        </el-form-item>
        <el-form-item label="预报时间">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="开始日期" v-model="filters.StartTime" style="width: 100%;" size="small"></el-date-picker>
          </el-col>
          <el-col :span="1" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-date-picker type="date" placeholder="结束日期" v-model="filters.EndTime" style="width: 100%;" size="small"></el-date-picker>
          </el-col>
        </el-form-item>
        <!-- <el-form-item>
         
          <el-input v-model="filters.Waybill" placeholder="开始日期"></el-input>
          <el-input v-model="filters.Waybill" placeholder="结束日期"></el-input>
        </el-form-item> -->
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
        </el-form-item>
        <el-form-item class="pull-right">
          <el-button type="primary" v-on:click="exportOrder" :disabled="this.sels.length===0" size="small">导出匹配单</el-button>
          <el-button type="primary" v-on:click="exportPicking" :disabled="this.sels.length===0" size="small">导出拣货单</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="stockOutList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column type="selection" width="50">
      </el-table-column>
      <el-table-column prop="DataID" label="序号" width="80">
      </el-table-column>
      <el-table-column label="单号 / 预报单" prop="OrderID" width="">
        <template slot-scope="scope">
            <span v-html="renderingOrder(scope.row.OrderID)"></span> <br> <span v-html="renderingOrder(scope.row.ReferenceID)"></span>
        </template>
      </el-table-column>
      <el-table-column label="出库单属性" width="">
        <template slot-scope="scope">
          <span>{{scope.row.Warehouse.Code}}</span>
          <span>{{scope.row.Warehouse.Name}}</span><br>
          <span>{{scope.row.Freight.Code}}</span>
          <img :src="returnUrl(scope.row.Freight.Logo)" style="width:20px" /><br>
          <el-tag type="info" v-show="scope.row.Types !=='普通' && scope.row.Types!==''">{{scope.row.Types | changePara}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="包裹订单 / 包裹" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Count.OrderAll}} / {{scope.row.Count.PackageAll}} </p>
        </template>
      </el-table-column>
      <el-table-column label="出库进度" width="">
        <template slot-scope="scope">
            <p>{{((scope.row.Count.OrderComplete/scope.row.Count.OrderAll)*100).toFixed(2)}}% </p>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="Status" width="80">
      </el-table-column>
      <el-table-column prop="Date" label="时间" sortable>
        <template slot-scope="scope">
            <span>{{scope.row.UpdateDate | cutDate}}</span><br><span style="font-size:12px">{{scope.row.Date | cutDate}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="">
        <template slot-scope="scope">
          <!-- <el-button type="primary" icon="el-icon-edit" circle></el-button> -->
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row, '出库订单')">设置</el-button>
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row, '操作流水')">流水 </el-button>
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row, '日志')">日志</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <!-- <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button> -->
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-size="pageSize" :page-sizes="[20, 30, 50, 100]" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog width="60%" title="出库单详情" v-model="editFormVisible" :close-on-click-modal="false" custom-class="el-dialog--large" top="10%">
      <!--<div slot="title" class="dialog-title" style="font-size: 18px">
        入出库单详情 ：{{editForm.OrderID}} -->
        <!-- <el-tag type="danger" v-show="editForm.Level!=='普通'">{{editForm.Level | changePara}}</el-tag>
        <el-tag type="primary" v-show="editForm.NewProduct!=='普通'">{{editForm.NewProduct | changePara}}</el-tag>
        <el-tag type="info" v-show="editForm.Types !=='普通' && editForm.Types!==''">{{editForm.Types | changePara}}</el-tag> 
      </div>-->
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-tabs type="card" @tab-click="" v-model="activeTab">
          <el-tab-pane label="出库订单" name="出库订单">
            <el-table :data="[editForm]" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="序号" prop="DataID" width="80">
              </el-table-column>
              <el-table-column label="单号 / 预报单" prop="">
                <template slot-scope="scope">
                  <span v-html="renderingOrder(scope.row.OrderID)"></span> <br> <span v-html="renderingOrder(scope.row.ReferenceID)"></span>
                </template>
              </el-table-column>
              <el-table-column label="出库单属性" width="">
                <template slot-scope="scope">
                  <span>{{scope.row.Warehouse.Code}}</span>
                  <span>{{scope.row.Warehouse.Name}}</span><br>
                  <span>{{scope.row.Freight.Code}}</span>
                  <img :src="returnUrl(scope.row.Freight.Logo)" style="width:20px;"/>
                  <el-tag type="info">{{scope.row.Types | changePara}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="包裹订单 / 包裹" width="">
                <template slot-scope="scope">
                    <p>{{scope.row.Count.OrderAll}} / {{scope.row.Count.PackageAll}} </p>
                </template>
              </el-table-column>
              <el-table-column label="出库进度" sortable width="">
                <template slot-scope="scope">
                    <p>{{((scope.row.Count.OrderComplete/scope.row.Count.OrderAll)*100).toFixed(2)}}% </p>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="">
              </el-table-column>
              <el-table-column label="时间">
                <template slot-scope="scope">
                  <span>{{scope.row.UpdateDate | cutDate}}</span><br><span style="font-size:12px">{{scope.row.Date | cutDate}}</span>
                </template>
              </el-table-column>
            </el-table>
            <br>
            <el-table :data="WSOOList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border max-height="350">
              <el-table-column label="顺序号" prop="SN" width="100">
              </el-table-column>
              <el-table-column label="运单号" width="180">
                <template slot-scope="scope">
                    <p><span v-html="renderingOrder(scope.row.ReferenceID)"></span> <br> {{scope.row.Logistics.Buyer}} <br> {{scope.row.Logistics.Remark}}</p>
                </template>
              </el-table-column>
              <el-table-column label="地址">
                <template slot-scope="scope">
                    <!-- <p v-for="s in scope.row.Stock"><span v-for="p in s.Product">[{{p.Status}}] [{{p.FullSKU}}] {{p.FullName}} * {{p.Quantity}}</span></p> -->
                </template>
              </el-table-column>
              <el-table-column label="货代单号 / 挂号" width="150">
                <template slot-scope="scope">
                    <p>{{scope.row.Logistics.InsideOrder}} <br> {{scope.row.Logistics.TrackingNumber}}</p>
                </template>
              </el-table-column>
              <el-table-column label="包裹">
                <template slot-scope="scope">
                    <p v-for="s in scope.row.Stock">{{s.FreightNo}}<br> {{scope.row.Logistics.OrderID}} * {{s.Quantity}}</p>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="80">
              </el-table-column>
              <el-table-column label="时间" width="120">
                <template slot-scope="scope">
                  <span>{{scope.row.Date | cutDate}}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="70">
                <template slot-scope="scope">
                  <el-button type="success" size="small" @click="">查看</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="操作流水" name="操作流水">
            <el-table :data="[editForm]" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="序号" prop="DataID">
              </el-table-column>
              <el-table-column label="单号 / 预报单" prop="">
                <template slot-scope="scope">
                  <span v-html="renderingOrder(scope.row.OrderID)"></span> <br> <span v-html="renderingOrder(scope.row.ReferenceID)"></span>
                </template>
              </el-table-column>
              <el-table-column label="出库单属性" width="">
                <template slot-scope="scope">
                  <span>{{scope.row.Warehouse.Code}}</span>
                  <span>{{scope.row.Warehouse.Name}}</span><br>
                  <span>{{scope.row.Freight.Code}}</span>
                  <img :src="returnUrl(scope.row.Freight.Logo)" style="width:20px" />
                  <el-tag type="info">{{scope.row.Types | changePara}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="包裹订单 / 包裹" width="">
                <template slot-scope="scope">
                    <p>{{scope.row.Count.OrderAll}} / {{scope.row.Count.PackageAll}} </p>
                </template>
              </el-table-column>
              <el-table-column label="出库进度" sortable width="">
                <template slot-scope="scope">
                    <p>{{((scope.row.Count.OrderAll/scope.row.Count.PackageAll)*100).toFixed(2)}}% </p>
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="80">
              </el-table-column>
              <el-table-column label="时间">
                <template slot-scope="scope">
                  <span>{{scope.row.UpdateDate | cutDate}}</span><br><span style="font-size:12px">{{scope.row.Date | cutDate}}</span>
                </template>
              </el-table-column>
            </el-table>
            <br>
            <el-table :data="editForm.Flow" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border max-height="400">
              <el-table-column label="时间" prop="" width="200" sortable>
                <template slot-scope="scope">
                    <p>{{scope.row.Date}}</p>
                </template>
              </el-table-column>
              <el-table-column label="操作人" prop="TrueName" width="" sortable>
              </el-table-column>
              </el-table-column>
              <el-table-column label="运单号">
                <template slot-scope="scope">
                    <p>{{scope.row.ReferenceID}}<br> {{scope.row.Buyer}}</p>
                </template>
              </el-table-column>
              <el-table-column label="货代单号 / 挂号">
                <template slot-scope="scope">
                    <p>{{scope.row.InsideOrder}}<br> {{scope.row.TrackingNumber}}</p>
                </template>
              </el-table-column>
              <el-table-column label="包裹">
                <template slot-scope="scope">
                    <p>{{scope.row.Package.FreightNo}}<br> {{scope.row.Stock.OrderID}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="数量" prop="Quantity" width="">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="日志" name="日志">
            <el-table :data="editForm.Log" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border max-height="400">
              </el-table-column>
              <el-table-column label="操作人" prop="Name" width="100">
              </el-table-column>
              <el-table-column label="操作记录" prop="Remark">
              </el-table-column>
              <el-table-column label="时间" prop="" width="110">
                <template slot-scope="scope">
                    <p>{{scope.row.Date | cutDate}}</p>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <el-form-item label="" label-width="0px">
          <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="orderCurrentChange" :page-size="orderPageSize" :page-sizes="[20, 30, 50, 100]" :total="orderTotal" style="float:right;" @size-change="orderSizeChange">
          </el-pagination>
        </el-form-item>
      </el-form>
      
      <!-- <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div> -->
    </el-dialog>

  </section>
</template>

<script>
  import util from '../../common/js/util'
  //import NProgress from 'nprogress'
  import { getStockOutList, queryStockOut, updateStockOut, getWarehouseList, getFreightList, WPSkuSearch, getWSOOList} from '../../api/api';
  let qs = require('qs');
  const format = require('date-fns/format');
  export default {
    data() {
      return {
        filters: {
          FreightID: '',
          WID: '',
          Types: '销售出库',
          KeyWord: '',
          StartTime: '',
          EndTime: '',
          Mode:'UnComplete',
          SkuID:''
        },
        activeTab: '出库订单',
        warehouses: [],
        freightList: [],
        stockOutList: [],
        WSOOList:[],
        total: 0,
        page: 1,
        pageSize:20,
        // 指定出库单包裹列表的分页参数
        orderTotal: 0,
        orderPage: 1,
        // orderPageSize:20,
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
          OrderID: '',
          WID: 0,
          ReferenceID: '',
          Warehouse: {},
          FreightID: '',
          Freight: {},
          Count: {},
          Types: '',
          UpdateDate: '',
          Date: '',
          Status:''
        },
        errorMessage:'',
        //收货
        receive:{
            'ReceiveCount': 0,
            'NewStatus':'',
            'flag':false
        },
        //收货调整
        receiveAdjust:{
            'ReceiveCount': 0,
            'NewStatus':'',
            'flag':false,
            'Subject':''
        },

        //产品提交数据模型
        // productJson: {
        //   Quantity:'',
        //   Product: []
        // },

        //变更状态
        changeStatus:'',

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            { required: true, message: '请输入姓名', trigger: 'blur' }
          ]
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
        this.getList();
      },//改变每页显示数量
      handleSizeChange(val) {
        this.pageSize = val;
        this.getList();
      },
      //指定出库单包裹列表 改变页数
      orderCurrentChange(val) {
        this.orderPage = val;
        this.getOrderPackageList(this.editForm);
      },//指定出库单包裹列表 改变每页显示数量
      orderSizeChange(val) {
        this.orderPageSize = val;
        this.getOrderPackageList(this.editForm);
      },
      //获取出库单列表
      getList() {
        let para = {
          Page: this.page,
          QueryLimitNumber: this.pageSize,
          Mode: this.filters.Mode,
          Types: this.filters.Types,
          WID: this.filters.WID,
          FreightID: this.filters.FreightID,
          SkuID: this.filters.SkuID,
          StartTime: format(this.filters.StartTime, 'YYYY-MM-DD'),
          EndTime: format(this.filters.EndTime, 'YYYY-MM-DD'),
          KeyWord: this.filters.KeyWord
          // Mode: 'InService'
        };
        this.listLoading = true;
        // NProgress.start();
        getStockOutList(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.stockOutList = res.data.DataList;
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
      //显示编辑界面
      handleEdit: function (index, row, tab) {
        this.activeTab = tab;
        this.editFormVisible = true;
        let para = { DataID: row.DataID};
        queryStockOut(para).then((res) => {
          // this.listLoading = false;
          // //NProgress.done();
          // this.$message({
          //   message: '删除成功',
          //   type: 'success'
          // });
          // this.getList();
          this.editForm = res.data.StockOut;
          
        });
        //查询指定出库单的订单包裹列表
        this.getOrderPackageList(row);
      },
      //查询指定出库单的订单包裹列表
      getOrderPackageList: function(row){
        let para = {
          FID:row.DataID,
          Page:this.orderPage,
          QueryLimitNumber:this.orderPageSize
        }
        getWSOOList(para).then((res) => {
          this.WSOOList = res.data.DataList
          this.orderTotal = res.data.Pagination.TotalNumberOfEntries
        });
      },
      //确认入库，更新数量
      editSubmit: function () {
        // this.$refs.editForm.validate((valid) => {
          // if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
              let $this = this
              var productJson = [];
              this.editForm.ApplyProduct.forEach(function(item,index){
                  if(item.receiveNum && $this.receiveCheck(item)){
                      productJson.push({"SkuID": item.Product.DataID, "Quantity": item.receiveNum});
                  }
              });
              let para = JSON.stringify({
                DataID: this.editForm.DataID,
                OrderID: this.editForm.OrderID,
                Product: productJson
              });
              updateStockOut(para).then((res) => {
                this.editLoading = false;
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['editForm'].resetFields();
                // this.editFormVisible = false;
                this.getList();
              });
            // });
          // }
        // });
      },
      //本次收货的数量及状态变更
      reRealTime: function (data,obj) {
        console.log(data)
          var total = 0;
          var $this = this;
          this.receive.flag = true;
          this.editForm.ApplyProduct.forEach(function (item, index) {
            if(!($this.receiveCheck(item))){

              item.receiveNum = '';
            }else if(item.receiveNum){
                item.receiveNum == '' && (item.receiveNum = '');
                total += parseInt(item.receiveNum);
            }
          });
          total <= 0 && (this.receive.flag = false);
          this.receive.ReceiveCount =  total;
          this.editForm.Receive + total < this.editForm.Quantity?this.receive.NewStatus = '待处理':this.receive.NewStatus = '已完成'
      },
      //收货单调整的数量及状态变更
      adRealTime: function(){
          var total = 0;
          this.editForm.ApplyProduct.forEach(function(item,index){
              if(item.adjustNum){
                  total += parseInt(item.adjustNum);
              }
          });
          this.receiveAdjust.ReceiveCount =  total;
          this.editForm.Receive + total < this.editForm.Quantity?this.receiveAdjust.NewStatus = '待处理':this.receiveAdjust.NewStatus = '已完成'
      },
      //收货校验
      receiveCheck: function(item){
          if(item.receiveNum && parseInt(item.receiveNum) < 0){
            this.$message.error('收货数量不能为负数，请重新核对收货数量！');
            return false;
          }else if(item.receiveNum && (parseInt(item.receiveNum) + parseInt(item.Recieve) > parseInt(item.Quantity))){
            this.$message.error('本次收货数量及已收数量之和不能大于应收数量，请重新核对收货数量！');
            return false;
          }else if(item.receiveNum && parseInt(item.receiveNum) > 0 && !item.BlnSkuComplete){
            this.$message.error('收货产品物流属性不完整（物流属性按钮显示为红色），请先补全属性后收货！');
            return false;
          }else{
              console.log('true')
              return true;
          }
      },
      //调整收货单
      AdjustSubmit: function () {
        // this.$refs.editForm.validate((valid) => {
          // if (valid) {
            // this.$confirm('确认提交吗？', '提示', {}).then(() => {
              var productJson = [];
              this.editForm.ApplyProduct.forEach(function(item,index){
                if(item.adjustNum){
                    productJson.push({"SkuID": item.Product.DataID, "Quantity": item.adjustNum});
                }
              });
              let para = JSON.stringify({
                DataID: this.editForm.DataID,
                OrderID: this.editForm.OrderID,
                Subject: this.receiveAdjust.Subject,
                Product: productJson
              });
              adjustStockOut(para).then((res) => {
                this.editLoading = false;
                this.$message({
                  message: '提交成功',
                  type: 'success'
                });
                this.$refs['editForm'].resetFields();
                // this.editFormVisible = false;
                this.getList();
              });
            // });
          // }
        // });
      },
      selsChange: function (sels) {
        this.sels = sels;
      },
      //获取仓库简化列表,用于搜索查询
      getwarehouses() {
        getWarehouseList().then((res) => {
          this.warehouses = res.data.DataList;
        });
      },
      //获取货代列表，用于搜索查询
      getFreight() {
        getFreightList().then((res) => {
          this.freightList = res.data.DataList;
        });
      },
      //渲染单号
      renderingOrder: function(value){
        return value.replace(/(\d{8}|\d{6})/ig, '<span class="el-tag el-tag--primary">$1</span>')
      },
      //返回完整图片资源URL
      returnUrl: function(url){
        return util.baseUrl(url)
      },
      //导出拣货单
      exportPicking(){
        // util.exportData = this.sels
        let routeData = this.$router.resolve({ path: '/picking', query: {  id: this.sels[0].DataID } });
        window.open(routeData.href, '_blank');
        // this.$router.push({ path: '/picking' });
      },
      //导出匹配单
      exportOrder(){
        // util.exportData = this.sels
        let routeData = this.$router.resolve({ path: '/outStockOrder', query: {  id: this.sels[0].DataID } });
        window.open(routeData.href, '_blank');
        // this.$router.push({ path: '/outStockOrder' });
      }
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
      this.getFreight();
    }
  }

</script>

<style scoped>
.el-form-item{
  margin-bottom: 10px!important
}
.el-dialog--small{
  width: 60% !important;
}
.w60 {
  width: 60%
}
</style>