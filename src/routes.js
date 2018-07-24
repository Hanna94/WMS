import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import BarCode from './views/BarCode.vue'
import Picking from './views/Picking.vue'
import OutStockOrder from './views/OutStockOrder.vue'
import StockCode from './views/StockCode.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import UserList from './views/userManage/userList.vue'
import Form from './views/userManage/Form.vue'
import OwnerList from './views/ownerConfig/ownerList.vue'
import WarehouseList from './views/warehouseConfig/warehouseList.vue'
import WAList from './views/warehouseConfig/WAList.vue'
import WARList from './views/warehouseConfig/WARList.vue'
import PackageList from './views/packageManage/packageList.vue'
import StockList from './views/stockManage/stockList.vue'
import StockFlow from './views/stockManage/stockFlow.vue'
import StockInList from './views/stockIn/stockInList.vue'
import WQCList from './views/qualityControl/WQCList.vue'
import WQCFlow from './views/qualityControl/WQCFlow.vue'
import StockOutList from './views/stockOut/stockOutList.vue'
import echarts from './views/charts/echarts.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/barCode',
        component: BarCode,
        // name: '导出条形码',
        hidden: true
    },
    {
        path: '/picking',
        component: Picking,
        // name: '导出拣货单',
        hidden: true
    },
    {
        path: '/outStockOrder',
        component: OutStockOrder,
        // name: '导出拣货单',
        hidden: true
    },
    {
        path: '/stockCode',
        component: StockCode,
        // name: '导出库存条码',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '用户管理',
        hidden: true,
        iconCls: 'fa fa-user-circle-o',//图标样式class
        children: [
            // { path: '/main', component: Main, name: '主页', hidden: true },
            // { path: '/userList', component: UserList, name: '用户列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '货主配置',
        hidden: true,
        iconCls: 'fa fa-truck',
        children: [
            // { path: '/ownerList', component: OwnerList, name: '货主列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '仓库配置',
        iconCls: 'fa fa-area-chart',
        // leaf: true,//只有一个节点
        children: [
            // { path: '/warehouseList', component: WarehouseList, name: '仓库列表' },
            { path: '/waList', component: WAList, name: '库区列表' },
            { path: '/warList', component: WARList, name: '库位列表' }
        ]
    },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '仓库配置',
    //     iconCls: 'fa fa-area-chart',
    //     leaf: true,//只有一个节点
    //     children: [
    //         { path: '/warehouseList', component: WarehouseList, name: '仓库配置' }
    //     ]
    // },
    {
        path: '/',
        component: Home,
        name: '包裹管理',
        iconCls: 'fa fa-cube',
        children: [
            // { path: '/echarts', component: echarts, name: 'echarts' },
            { path: '/package', component: PackageList, name: '包裹列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '库存管理',
        iconCls: 'fa fa-cubes',
        children: [
            { path: '/stock', component: StockList, name: '库存列表' },
            // { path: '/stockFlow', component: StockFlow, name: '库存流水' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '入库单',
        iconCls: 'fa fa-indent',
        children: [
            { path: '/stockIn', component: StockInList, name: '入库单列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '质检',
        iconCls: 'fa fa-check-square-o',
        children: [
            { path: '/wqcList', component: WQCList, name: '待处理质检单' },
            { path: '/wqcFlow', component: WQCFlow, name: '质检流水' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '盘点单',
        iconCls: 'fa fa-th-large',
        children: [
            // { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '出库单',
        iconCls: 'fa fa-outdent',
        children: [
            { path: '/stockOut', component: StockOutList, name: '出库单列表' }
            // { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;