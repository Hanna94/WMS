// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  install (Vue, options) {
    Vue.prototype.getPdf = function () {
      let title = this.htmlTitle
      let pdfDom = document.querySelector('#pdfDom')
      let inputCanvas = document.querySelector('#inputCanvas')
      let app = document.querySelector('#app')
      
      html2Canvas(document.querySelector('#pdfDom'), { allowTaint: true })
        .then(canvas => {
          let PDF, canvas2d, inputCanvas2d, svgHeight, svgWidth, svgQuantity, canvasWidth,
              svgMargin = 0

          canvas2d = canvas.getContext("2d")
          inputCanvas2d = inputCanvas.getContext("2d")
          svgHeight = pdfDom.querySelectorAll('._svg')[0].clientHeight 
          svgWidth = document.querySelector('#code0').clientWidth
          inputCanvas.width = svgWidth
          svgQuantity = pdfDom.querySelectorAll('._svg').length
          canvasWidth = pdfDom.clientWidth 
          console.log(document.body.scrollHeight)
          console.log(app.scrollHeight)
          console.log(app.clientHeight)
          // console.log(pdfDom.clientWidth)
          // (document.body.offsetWidth - document.body.clientWidth)

          PDF = new JsPDF('l', 'px', [255, 80])

          // 循环裁剪canvas
          for (let i = 1; i <= svgQuantity; i++) {
            let x_axis, y_axis, newCanvas, newCanvas2d, cut, pageData
            //判断是否存在滚动条
            if(app.scrollHeight > app.clientHeight){
              // 计算裁剪的x轴偏移量
              x_axis = canvasWidth / 2 - svgWidth / 2 + 17 / 2
              console.log(5555)
            }else{
              x_axis = canvasWidth / 2 - svgWidth / 2
            }
            console.log(x_axis)
            // 计算裁剪的y轴偏移量
            y_axis = (svgHeight + svgMargin) * (i - 1)

            // 裁剪canvas
            // cut = canvas2d.getImageData(x_axis, y_axis, svgWidth, svgHeight)
            cut = canvas2d.getImageData(x_axis, y_axis, svgWidth, svgHeight)
            // 放置裁剪后的imageData到自定义的canvas中
            inputCanvas2d.putImageData(cut, 0, 0)

            // canvas转化为base64
            pageData = inputCanvas.toDataURL('image/jpeg', 1.0)
            // 插入PDF中
            PDF.addImage(pageData, 'JPEG', 0, 0, 255, 80)
            // 如果非最后一项，则新建一页
            if (i < svgQuantity) PDF.addPage()
          }

          PDF.save(title + '.pdf')
        })
    }
  }
}