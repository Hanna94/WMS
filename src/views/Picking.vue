<template>
  <section>
    <div ref="pageShow">
      <table class="table table-bordered table-condensed">
        <thead>
            <tr>
              <th rowspan="2">
                <svg class="orderID" ref="topSvg"></svg>
              </th>
              <th colspan="4">
                <h2>{{pickingData.StockOut.Warehouse.Name}} {{pickingData.StockOut.Freight.Code}} {{pickingData.StockOut.Types}} {{pickingData.StockOut.OrderID}} 拣货单</h2>
              </th>
            </tr>
            <tr>
              <th><h2>订单总数：{{countData.OrderAll}}</h2></th>
              <th colspan="2"><h2>总包裹数：{{countData.PackageAll}}</h2></th>
              <th><el-button type="primary" @click="printPage">打印</el-button></th>
            </tr>
            <tr>
                <th width="10%">包裹</th>
                <th>包含产品</th>
                <th>包裹数量</th>
                <th>拣出数量</th>
                <th>操作人</th>
            </tr>
        </thead>
        <tbody v-cloak ref="tableBody">
            <tr v-for="t in pickingList">
                <td style="padding-left: 0px"><svg :id="t.FreightNo"></svg></td>
                <td><p style="font-size:18px" v-for="p in t.Product">[{{p.FullSKU}}] {{p.FullName}} * {{p.Quantity*t.Quantity}}</p></td>
                <td>{{t.Quantity}}</td>
                <td></td>
                <td></td>
            </tr>
        </tbody>
    </table>
  </div>
  <div ref="printShow" style="display: none;"></div>
  </section>
</template>
<script>
    import { getWSOPicking } from '../api/api';
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
        pickingList:[],
        countData:{}
      }
    },
    methods: {
      printPage () {
        let pageShow, printShow, topSvg, trList, trQuantity, listQuantity, printTemplate, printTemplateFooter, count, regexp, replaceText, htmlResult

        pageShow = this.$refs.pageShow
        printShow = this.$refs.printShow
        pageShow.style = "display: none;"
        printShow.style = "display: block;"
        topSvg = this.$refs.topSvg.innerHTML
        trList = this.$refs.tableBody.querySelectorAll('tr')
        trQuantity = trList.length
        listQuantity = 13
        regexp = /(td)\s{1}data-v-[a-z0-9]{8}=""/g
        replaceText = '$1 style="border: 1px solid #000;padding-left:10px;"'
        htmlResult = ''
        printTemplate = `<table style="width: 100%;max-width: 100%;margin-bottom: 20px;border-collapse:collapse;">
                          <thead>
                            <tr>
                              <th rowspan="2" style="border: 1px solid #000;">
                                <svg class="printSvg" ref="topSvg"></svg>
                              </th>
                              <th colspan="4" style="border: 1px solid #000;">
                                <h2>${this.pickingData.StockOut.Warehouse.Name} ${this.pickingData.StockOut.Freight.Code} ${this.pickingData.StockOut.Types} ${this.pickingData.StockOut.OrderID} 拣货单</h2>
                              </th>
                            </tr>
                            <tr>
                              <th style="border: 1px solid #000;"><h2>订单总数：${this.countData.OrderAll}</h2></th>
                              <th colspan="3" style="border: 1px solid #000;"><h2>总包裹数：${this.countData.PackageAll}</h2></th>
                            </tr>
                            <tr>
                              <th width="10%" style="border: 1px solid #000;">包裹</th>
                              <th style="border: 1px solid #000;">包含产品</th>
                              <th style="border: 1px solid #000;">包裹数量</th>
                              <th style="border: 1px solid #000;">拣出数量</th>
                              <th style="border: 1px solid #000;">操作人</th>
                            </tr>
                          </thead>
                          <tbody>`
        printTemplateFooter = '</tbody></table>'

        // tr分组，按A4纸能放下的数量，每13条记录一页
        count = 1
        for (let i = 0; i < trQuantity; i++) {
          let templateResult = `<tr>${trList[i].innerHTML}</tr>`
          if (count === 1) htmlResult += printTemplate
          if (count < listQuantity) {
            htmlResult += templateResult
            count++
          } else {
            htmlResult += templateResult + printTemplateFooter
            count = 1
          }
          if (i === trQuantity - 1) htmlResult += printTemplateFooter
        }
        // 去除data-v-xxxx
        htmlResult = htmlResult.replace(regexp, replaceText)

        printShow.innerHTML = htmlResult
        JsBarcode(".printSvg", this.pickingData.StockOut.OrderID)

        window.print()
        pageShow.style = "display: block;"
        printShow.style = "display: none;"
      },
      rowStyle({row, column, rowIndex, columnIndex}) {
        console.log(row)
        // return 'border: 2px solid #000!important'
        // return 'padding: 0'
        return 'background: red'
      },
      renderingData(){
        if(!this.pickingList){return}
        var options = {
          width:2,
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
      }
    },
    watch: {
        pickingList: function() {
            this.$nextTick(function(){
              /*数据已经渲染完毕*/
              this.renderingData()
            })
        }
    },
    filters: {
      
    },
    mounted() {
        //查询指定出库单的订单包裹列表
        getWSOPicking(qs.stringify({DataID:this.$route.query.id})).then((res) => {
          this.pickingData = res.data
          JsBarcode(".orderID", this.pickingData.StockOut.OrderID)
          this.pickingList = res.data.Picking
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