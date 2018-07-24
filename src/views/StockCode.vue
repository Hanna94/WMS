<template>
    <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" ref="form" label-width="80px" @submit.prevent="onSubmit">
        <el-form-item label="库存编码">
          <el-input type="text" v-model="orderID" placeholder="库存编码"></el-input>
        </el-form-item>
        <el-form-item label="数量">
          <el-input type="text" v-model="number" placeholder="数量"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addData"><i class="el-icon-plus"></i> 添加</el-button>
          <el-button type="primary" @click="exportData">导出</el-button>
        </el-form-item>
        <el-form-item class="pull-right">
          <el-button type="danger" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table :data="dataArr" border>
      <el-table-column prop="OrderID" label="库存编码" width="">
         <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.OrderID" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="" label="数量" width="">
        <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.Quantity" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="">
        <template slot-scope="scope">
            <el-button type="danger" size="small" @click="deleteData(scope.$index)"><i class="el-icon-delete"></i> 删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-col :span="24">
      <p style="text-align:center" id="pdfDom">
        <span class="_svg" style="display: block;" v-for="(item, index) in dataArr"><span style="font-weight: bold" v-for="p in item.Product">{{p.FullSKU}}{{p.FullName}}</span><br>
          <svg :id="'code'+index" style="margin-top: -15px"></svg>
        </span>
      </p>
    </el-col>
    <el-col :span="24">
      <canvas id="inputCanvas" height="82" style="display:none "></canvas>
    </el-col> -->
  </section>
</template>
<script>
    import { WSLabelExport } from '../api/api';
    import util from '../common/js/util'
    var JsBarcode = require('jsbarcode');
    let qs = require('qs');
    export default {
    data() {
      return {
        filters: {
          WID: ''
        },
        codeArr:[],
        dataArr:[],
        stockCode:'',
        htmlTitle: '库存条码',
        orderID:'',
        number:1
      }
    },
    methods: {
      //添加一行数据
      addData(){
        this.dataArr.push({"OrderID":this.orderID, "Quantity": this.number})
        this.orderID = '';
        this.number = 1;
      },
      //删除一行数据
      deleteData(index){
        console.log(index)
        this.dataArr.splice(index, 1);
      },
      //导出库存条码
      exportData(){
        let para = JSON.stringify({'Stock':this.dataArr})
        WSLabelExport(para).then((res) => {
          if(res.data.Ack){
            this.$message({
              message: '导出库存编码表格',
              type: 'success'
              });
            location.href = util.baseUrl(res.data.Create.File);
          }
        });
      },
      //重置
      reset(){
        this.orderID = '';
        this.number = 1;
        this.dataArr = []
      },
      getBarCode(){
        if(!this.codeArr){return}
        var options = {
          width:2,
          height:50,
          format:"CODE128"
        }
        // console.log(this.stockCode)
        let $this = this
        this.codeArr = this.stockCode.trim().split(/\s+|\n|\r/)
        this.codeArr.forEach(function(item,index){
          queryStock({OrderID:item}).then((res) => {
            let stockData = res.data.Stock;
            let productModal = []
            stockData.Package.Product.forEach(function($item,$index){
              productModal.push({'FullSKU': $item.Product.FullSKU})
            })
            $this.dataArr.push({'Product':productModal,'Code':item})
          });
            
        })
      },
      renderingData(){
        if(!this.codeArr){return}
        var options = {
          width:2,
          height:25,
          format:"CODE128",
          fontSize:14,//设置文本的大小
          textMargin:0,//设置条形码和文本之间的间距
          margin:0,//设置条形码周围的空白边距
          marginBottom:15,
          marginRight:50,
          marginLeft:5,
        }
        this.dataArr.forEach(function(item,index){
            //将数据转换为条形码
            JsBarcode('#code'+index, item.Code,options)
        })
      }
    },
    watch: {
        dataArr: function() {
            this.$nextTick(function(){
              /*数据已经渲染完毕*/
              this.renderingData()
              //将数据转换为条形码
            // JsBarcode('#code'+index, item,options)
            })
        }
    },
    filters: {
      
    },
    mounted() {
      
    }
  }
</script>
<style lang="scss" scoped>
    .page-container {
        font-size: 20px;
        text-align: center;
        color: rgb(192, 204, 218);
    }
</style>