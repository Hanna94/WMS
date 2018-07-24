<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-col :span="10">
        <svg id="orderID"></svg>
      </el-col>
      <el-col :span="14">
        <el-col :span="24">
          <h2>{{pickingData.StockOut.Warehouse.Name}} {{pickingData.StockOut.Freight.Code}} {{pickingData.StockOut.Types}} {{pickingData.StockOut.OrderID}} 匹配单</h2>
        </el-col>
        <el-col :span="8">
          <h2>订单总数：{{countData.OrderAll}}</h2>
        </el-col>
        <el-col :span="8">
          <h2>总包裹数：{{countData.PackageAll}}</h2>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="printPage">打印</el-button>
        </el-col>
      </el-col>
    </el-col>
   <!--  <el-table :data="pickingData.OutStockOrder" border>
      <el-table-column type="index" width="80" label="序号">
      </el-table-column>
      <el-table-column label="运单" prop="" width="200">
        <template slot-scope="scope">
            <p><span v-html="renderingOrder(scope.row.ReferenceID)"></span><br><span>{{scope.row.InsideOrder}}</span></p>
        </template>
      </el-table-column>
      <el-table-column label="包含产品" width="">
        <template slot-scope="scope">
            <p style="font-size:18px" v-for="s in scope.row.Package"><span v-for="p in s.Product">[{{p.FullSKU}}] {{p.FullName}} * {{p.Quantity*scope.row.Quantity}}</span></p>
        </template>
      </el-table-column>
      <el-table-column label="包裹数量" prop="Quantity" width="100">
      </el-table-column>
      <el-table-column label="完成/实际拣出" prop="" width="130">
      </el-table-column>
      <el-table-column prop="" label="操作人" width="150">
      </el-table-column>
    </el-table> -->
    <table class="table table-bordered table-condensed">
      <thead>
          <tr>
              <th width="11%">运单</th>
              <th>包含产品</th>
              <th>包裹数量</th>
              <th>拣出数量</th>
              <th>操作人</th>
          </tr>
      </thead>
      <tbody v-cloak>
          <tr v-for="t in pickingData.OutStockOrder">
              <td><p><!-- <span v-html="renderingOrder(t.ReferenceID)"></span> -->{{t.ReferenceID}}<br><span>{{t.InsideOrder}}</span></p></td>
              <td><p style="font-size:18px" v-for="s in t.Package"><span v-for="p in s.Product">[{{p.FullSKU}}] {{p.FullName}} * {{p.Quantity*t.Quantity}}</span></p></td>
              <td>{{t.Quantity}}</td>
              <td></td>
              <td></td>
          </tr>
      </tbody>
    </table>
  </section>
</template>
<script>
    import { getWSOPicking } from '../api/api';
    import util from '../common/js/util'
    var JsBarcode = require('jsbarcode');
    let qs = require('qs');
    export default {
    data() {
      return {
        filters: {
          WID: ''
        },
        pickingData:{
          StockOut:{
            DataID:'',
            Warehouse:{
              Name:''
            },
            Freight:{
              Code:''
            },
          },
          OrderID:'',
          ReferenceID:'',
          Types:'',
          Count:{
            OrderAll:'',
            PackageAll:''
          },
          Picking:[],
          OutStockOrder:[],
        },
        countData:{}
      }
    },
    methods: {
      renderingData(){
        if(!this.pickingList){return}
        var options = {
          width:1,
          height:50,
          format:"CODE128",
          displayValue:true,//是否在条形码下方显示文字
        }
        this.pickingList.forEach(function(item,index){
          //将数据转换为条形码
          JsBarcode('#'+item.FreightNo, item.FreightNo,options)
        })
      },
      //渲染单号
      renderingOrder: function(value){
        return value.replace(/(\d{8}|\d{6})/ig, '<span class="el-tag el-tag--primary">$1</span>')
      },
      //打印界面
      printPage: function(){
        window.print()
      }
    },
    watch: {
        pickingList: function() {
            this.$nextTick(function(){
              /*数据已经渲染完毕*/
              // this.renderingData()
            })
        }
    },
    filters: {
      
    },
    mounted() {
        //查询指定出库单的订单包裹列表
        getWSOPicking(qs.stringify({DataID:this.$route.query.id})).then((res) => {
          this.pickingData = res.data
          JsBarcode("#orderID", this.pickingData.StockOut.OrderID);
          this.countData = res.data.StockOut.Count
        });
    }
  }
</script>
<style lang="scss" scoped>
  .table-bordered {
    border: 1px solid #000;
  }
  .table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
  }
  table {
    background-color: transparent;
    display: table;
    border-spacing: 0;
    border-collapse: collapse;
  }
  .table-bordered>thead>tr>th, .table-bordered>tbody>tr>td{
    border: 1px solid #000;
  }
  .table-bordered>tbody>tr>td{
    padding-left:10px;
  }
</style>