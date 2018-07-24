<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.Mode" placeholder="" @change="getList" size="small">
            <el-option value="All" label="全部"></el-option>
            <el-option value="UnComplete" label="待入库"></el-option>
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
          <el-select v-model="filters.OwnerID" placeholder="货主" @change="getList" size="small">
            <el-option v-for="item in ownerList" :key="item.DataID" :value="item.DataID" :label="item.Code+item.Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.KeyWord" placeholder="单号/采购单号" size="small"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.Waybill" placeholder="快递单号" size="small"></el-input>
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
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table :data="stockInList" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
      <el-table-column type="selection">
      </el-table-column>
      <el-table-column prop="DataID" label="序号" sortable width="100">
      </el-table-column>
      <el-table-column label="单号" prop="OrderID" width="">
      </el-table-column>
      <el-table-column label="来源单号" prop="ReferenceID" width="">
      </el-table-column>
      <el-table-column label="属性" width="">
        <template slot-scope="scope">
          <el-tag type="danger" v-show="scope.row.Level!=='普通'">{{scope.row.Level | changePara}}</el-tag>
          <el-tag type="primary" v-show="scope.row.NewProduct!=='普通'">{{scope.row.NewProduct | changePara}}</el-tag>
          <el-tag type="info" v-show="scope.row.Types !=='普通' && scope.row.Types!==''">{{scope.row.Types | changePara}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Quantity}} / {{scope.row.StockIn}} </p>
        </template>
      </el-table-column>
      <el-table-column label="待收数量" width="">
        <template slot-scope="scope">
            <p>{{scope.row.Quantity}} - {{scope.row.StockIn}} </p>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="Status" width="80">
      </el-table-column>
      <el-table-column prop="Date" label="时间">
        <template slot-scope="scope">
            <p>{{scope.row.Date | cutDate}}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">设置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange" :page-size="pageSize" :page-sizes="[20, 30, 50, 100]" :total="total" style="float:right;" @size-change="handleSizeChange">
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog width="60%" title="入库单详情：" v-model="editFormVisible" :close-on-click-modal="false" custom-class="el-dialog--large" top="10%">
      <span slot="title" class="dialog-title" style="font-size: 18px">
        入库单详情：{{editForm.OrderID}}
        <el-tag type="danger" v-show="editForm.Level!=='普通'">{{editForm.Level | changePara}}</el-tag>
        <el-tag type="primary" v-show="editForm.NewProduct!=='普通'">{{editForm.NewProduct | changePara}}</el-tag>
        <el-tag type="info" v-show="editForm.Types !=='普通' && editForm.Types!==''">{{editForm.Types | changePara}}</el-tag>
      </span>
      <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
        <el-tabs type="card" @tab-click="" v-model="activeTab">
          <el-tab-pane label="入库单" name="入库单">
            <el-table :data="[editForm]" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="单号" prop="OrderID">
              </el-table-column>
              </el-table-column>
              <el-table-column label="来源单号" width="" prop="ReferenceID">
              </el-table-column>
              <el-table-column label="属性" width="">
                <template slot-scope="scope">
                  <el-tag type="danger" v-show="scope.row.Level!=='普通'">{{scope.row.Level | changePara}}</el-tag>
                  <el-tag type="primary" v-show="scope.row.NewProduct!=='普通'">{{scope.row.NewProduct | changePara}}</el-tag>
                  <el-tag type="info" v-show="scope.row.Types !=='普通' && scope.row.Types!==''">{{scope.row.Types | changePara}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="计划数量" prop="Quantity" width="">
              </el-table-column>
              <el-table-column label="已入数量" prop="Receive" width="">
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="">
              </el-table-column>
            </el-table>
            <br>
            <el-table :data="editForm.ApplyProduct" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="产品">
                <template slot-scope="scope">
                    <p>[{{scope.row.Product.Status}}] [{{scope.row.Product.FullName}}] {{scope.row.Product.FullSKU}} * {{scope.row.Product.Quantity}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="计划数量" prop="Quantity" width="">
              </el-table-column>
              <el-table-column label="已入数量" prop="Recieve" width="">
              </el-table-column>
              <el-table-column label="本次入库" width="150">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.receiveNum" @change="reRealTime(scope.row,$event)" :readonly="scope.row.Receive == scope.row.Quantity" :placeholder="scope.row.Receive == scope.row.Quantity?'已完成':''"></el-input>
                </template>
              </el-table-column>
             <!--  <el-table-column label="操作" width="70">
                <template slot-scope="scope">
                  <el-button :type="scope.row.BlnSkuComplete?'success':'danger'" size="small" @click="">物流</el-button>
                </template>
              </el-table-column> -->
            </el-table>
            <el-col :span="24" style="margin-top:15px">
              本次收货：{{receive.ReceiveCount}}个，提交后本收货单的状态将变更为 {{receive.NewStatus}}  
              <div class="pull-right">
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
              </div>
            </el-col>
          </el-tab-pane>
          <el-tab-pane label="入库单调整" name="入库单调整">
            <el-table :data="[editForm]" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="单号" prop="OrderID">
              </el-table-column>
              </el-table-column>
              <el-table-column label="来源单号" width="" prop="ReferenceID">
              </el-table-column>
              <el-table-column label="属性" width="">
                <template slot-scope="scope">
                  <el-tag type="danger" v-show="scope.row.Level!=='普通'">{{scope.row.Level | changePara}}</el-tag>
                  <el-tag type="primary" v-show="scope.row.NewProduct!=='普通'">{{scope.row.NewProduct | changePara}}</el-tag>
                  <el-tag type="info" v-show="scope.row.Types !=='普通' && scope.row.Types!==''">{{scope.row.Types | changePara}}</el-tag>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="计划数量" prop="Quantity" width="">
              </el-table-column>
              <el-table-column label="已入数量" prop="Receive" width="">
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="">
              </el-table-column>
            </el-table>
            <br>
            <el-table :data="editForm.ApplyProduct" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="产品">
                <template slot-scope="scope">
                    <p>[{{scope.row.Product.Status}}] [{{scope.row.Product.FullName}}] {{scope.row.Product.FullSKU}} * {{scope.row.Product.Quantity}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="计划数量" prop="Quantity" width="">
              </el-table-column>
              <el-table-column label="已入数量" prop="Recieve" width="">
              </el-table-column>
              <el-table-column label="调整数量" width="150">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.adjustNum" @change="adRealTime"></el-input>
                </template>
              </el-table-column>
            </el-table>
            <el-col :span="24" style="margin-top:15px">
              本次调整：{{receiveAdjust.ReceiveCount}}个，提交后本收货单的状态将变更为 {{receiveAdjust.NewStatus}}  
              <div class="pull-right">
                事由：
                <el-select v-model="receiveAdjust.Subject" placeholder="选择事由">
                  <el-option value="" label="请选择"></el-option>
                  <el-option value="退回供应商" label="退回供应商"></el-option>
                  <el-option value="收货错误" label="收货错误"></el-option>
                  <el-option value="供应商发错数量" label="供应商发错数量"></el-option>
                </el-select>
                <el-button type="primary" @click.native="AdjustSubmit" :loading="editLoading">提交</el-button>
              </div>
            </el-col>
          </el-tab-pane>
          <el-tab-pane label="入库流水" name="入库流水">
            <el-table :data="[editForm]" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border>
              <el-table-column label="单号" prop="OrderID">
              </el-table-column>
              </el-table-column>
              <el-table-column label="来源单号" width="" prop="ReferenceID">
              </el-table-column>
              <el-table-column label="属性" width="">
                <template slot-scope="scope">
                  <el-tag type="danger" v-show="scope.row.Level!=='普通'">{{scope.row.Level | changePara}}</el-tag>
                  <el-tag type="primary" v-show="scope.row.NewProduct!=='普通'">{{scope.row.NewProduct | changePara}}</el-tag>
                  <el-tag type="info" v-show="scope.row.Types !=='普通' && scope.row.Types!==''">{{scope.row.Types | changePara}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="计划数量" prop="Quantity" width="">
              </el-table-column>
              <el-table-column label="已入数量" prop="Receive" width="">
              </el-table-column>
              <el-table-column label="状态" prop="Status" width="">
              </el-table-column>
            </el-table>
            <br>
            <el-table :data="editForm.Flow" highlight-current-row v-loading="listLoading" @selection-change="selsChange" border max-height="350">
              <el-table-column label="时间" prop="" width="200" sortable>
                <template slot-scope="scope">
                    <p>{{scope.row.Date}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="包裹">
                <template slot-scope="scope">
                    <p>{{scope.row.Stock.Package.FreightNo}}<br> {{scope.row.Stock.OrderID}}</p>
                </template>
              </el-table-column>
              <el-table-column label="产品">
                <template slot-scope="scope">
                    <p v-for="p in scope.row.Stock.Package.Product">[{{p.Product.Status}}] [{{p.Product.FullName}}] {{p.Product.FullSKU}} * {{p.Product.Quantity}}</p>
                </template>
              </el-table-column>
              </el-table-column>
              <el-table-column label="操作数量" prop="Quantity" width="100">
              </el-table-column>
              <el-table-column label="操作人" prop="TrueName" width="80">
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
  import { getStockInList, queryStockIn, updateStockIn, adjustStockIn, getWarehouseList, getOwnerListTree, WPSkuSearch} from '../../api/api';
  let qs = require('qs');
  export default {
    data() {
      return {
        filters: {
          OwnerID: '',
          WID: '',
          KeyWord: '',
          Waybill: '',
          Mode:'All'
        },
        activeTab: '入库单',
        warehouses: [],
        ownerList: [],
        stockInList: [],
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
          OrderID: '',
          ApplyID: 0,
          TrueName: '',
          ReferenceID: '',
          Quantity: '',
          Receive: '',
          Level: '',
          NewProduct: '',
          Types: '',
          ApplyProduct: [],
          Flow: [],
          Adjust: [],
          Log: [],
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
      //获取入库单列表
      getList() {
        let para = {
          Page: this.page,
          QueryLimitNumber: this.pageSize,
          Mode: this.filters.Mode,
          SkuID: this.filters.SkuID,
          OwnerID: this.filters.OwnerID,
          WID: this.filters.WID,
          Waybill: this.filters.Waybill,
          KeyWord: this.filters.KeyWord
          // Mode: 'InService'
        };
        this.listLoading = true;
        // NProgress.start();
        getStockInList(para).then((res) => {
          this.total = res.data.Pagination.TotalNumberOfEntries;
          this.stockInList = res.data.DataList;
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
      handleEdit: function (index, row) {
        this.editFormVisible = true;
        let para = { DataID: row.DataID};
        queryStockIn(para).then((res) => {
          // this.listLoading = false;
          // //NProgress.done();
          // this.$message({
          //   message: '删除成功',
          //   type: 'success'
          // });
          // this.getList();
          this.editForm = res.data;
        });
        
        // this.changeStatus = row.Status;
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
              updateStockIn(para).then((res) => {
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
              adjustStockIn(para).then((res) => {
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
.el-dialog--small{
  width: 60% !important;
}
.w60 {
  width: 60%
}
</style>