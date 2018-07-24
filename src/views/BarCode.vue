<template>
    <p style="text-align:center">
      <!-- <p v-show="!dataList" class="page-container">暂无数据</p> -->
      <span v-for="d in dataList"><span style="font-size:20px">{{d.RName}}</span><br>
      <svg :id="'code'+d.DataID" ></svg><hr style="margin: 40px 0px">
    </span></p>
</template>
<script>
    import { getWARList } from '../api/api';
    var JsBarcode = require('jsbarcode');
    let qs = require('qs');
    export default {
    data() {
      return {
        filters: {
          WID: ''
        },
        dataList:[]
      }
    },
    methods: {
      renderingData(){
        if(!this.dataList){return}
        var options = {
          width:4,
          height:200,
          format:"CODE128"
        }
        this.dataList.forEach(function(item,index){
            //将数据转换为条形码
            JsBarcode('#code'+item.DataID, item.RCode,options)
        })
      }
    },
    watch: {
        dataList: function() {
            this.$nextTick(function(){
              /*数据已经渲染完毕*/
              this.renderingData()
            })
        }
    },
    filters: {
      
    },
    mounted() {
        getWARList(
          qs.stringify({
            WID:this.$route.query.WID, 
            FID:this.$route.query.FID
          })
        ).then((res) => {
          this.dataList = res.data.DataList;
        });
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