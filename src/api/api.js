import axios from 'axios';
// let qs = require('qs');

// let ajax = axios.create({
//     headers: {'content-type': 'application/x-www-form-urlencoded'},
//     withCredentials: true
// });

// let base = 'http://demo.hhherp.com';
let base = 'http://demowms.hhherp.com/';
// let base = '';

export const requestLogin = params => { return axios.post(`http://demo.hhherp.com/Login.aspx?Do=Login`, params).then(res => res.data); };

// export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/user/listpage`, { params: params }); };



export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editUser = params => { return axios.get(`${base}/user/edit`, { params: params }); };

export const addUser = params => { return axios.get(`${base}/user/add`, { params: params }); };

/* *********************************用户管理部分******************************************************/
//获取用户列表
export const getUserList = params => { return axios.get(`${base}/Api/?Do=UserList`, { params: params }); };
//设置用户状态
export const userSetStatus = params => { return axios.post(`${base}/Api/?Do=UserSetStatus`, params ); };
//设置管理员
export const userSetAdmin = params => { return axios.post(`${base}/Api/?Do=UserSetAdmin`, params ); };
//保存用户信息
export const userSave = params => { return axios.post(`${base}/Api/?Do=UserSave`, params ); };
//删除用户
export const userDelete = params => { return axios.get(`${base}/Api/?Do=UserDelete`, params ); };

/* *********************************货主配置部分******************************************************/
//获取货主列表
export const getOwnerList = params => { return axios.get(`${base}Api/?Do=OwnerList`, { params: params }); };
//获取货主简化列表
export const getOwnerListTree = params => { return axios.get(`${base}Api/?Do=OwnerListTree`, { params: params }); };
//设置货主状态
export const ownerSetStatus = params => { return axios.post(`${base}Api/?Do=OwnerSetStatus`, params ); };
//保存货主信息
export const ownerSave = params => { return axios.post(`${base}Api/?Do=OwnerSave`, params ); };

/* *********************************仓库配置部分******************************************************/
//获取全部仓库列表
export const getWarehouseList = params => { return axios.get(`${base}Api/?Do=WarehouseList`, { params: params }); };
//设置仓库状态
export const warehouseSetStatus = params => { return axios.post(`${base}Api/?Do=WarehouseSetStatus`, params ); };
//保存仓库信息
export const warehouseSave = params => { return axios.post(`${base}Api/?Do=WarehouseSave`, params ); };
//获取库区列表
export const getWAList = params => { return axios.post(`${base}Api/?Do=WAList`, params ); };
//获取库区简化列表
export const getWAListTree = params => { return axios.post(`${base}Api/?Do=WAListTree`, params ); };
//保存库区信息
export const WASave = params => { return axios.post(`${base}Api/?Do=WASave`, params ); };
//设置仓区状态
export const WASetStatus = params => { return axios.post(`${base}Api/?Do=WASetStatus`, params ); };
//获取库位列表
export const getWARList = params => { return axios.post(`${base}Api/?Do=WARList`, params ); };
//保存库位信息
export const WARSave = params => { return axios.post(`${base}Api/?Do=WARSave`, params ); };
//设置库位状态
export const WARSetStatus = params => { return axios.post(`${base}Api/?Do=WARSetStatus`, params ); };

/* *********************************包裹管理部分******************************************************/
//获取包裹列表
export const getWPList = params => { return axios.get(`${base}Api/?Do=WPList`, { params: params }); };
//新建更新包裹信息
export const WPSave = params => { return axios.post(`${base}Api/?Do=WPSave`, params); };
//删除产品列表中的产品
export const WPProductDelete = params => { return axios.post(`${base}Api/?Do=WPProductDelete`, params); };
//代理产品搜索
export const WPSkuSearch = params => { return axios.post(`${base}Api/?Do=WPSkuSearch`, params); };
//检索SPU
export const SpuSearch = params => { return axios.post(`${base}Api/?Do=WPSpuSearch`, params); };
//设置库位状态
export const WPSetStatus = params => { return axios.post(`${base}Api/?Do=WPSetStatus`, params ); };

/* *********************************库存管理部分******************************************************/
//获取库存列表
export const getWSList = params => { return axios.post(`${base}Api/?Do=WSList`, params ); };
//新建更新库存信息
export const WSSave = params => { return axios.post(`${base}Api/?Do=WSSave`, params); };
//查询指定库存
export const queryStock = params => { return axios.get(`${base}Api/?Do=WSQuery`, { params: params }); };
//查询指定库存的流水
export const queryStockFlow = params => { return axios.get(`${base}Api/?Do=WSFlowList`, { params: params }); };
//下载指定库存的流水
export const WSFlowDownLoad = params => { return axios.get(`${base}Api/?Do=WSFlowDownLoad`, {params: params}); };
//库存条码导出
export const WSLabelExport = params => { return axios.post(`${base}Api/?Do=WSLabelExport`, params); };

/* *********************************入库单部分******************************************************/
//获取入库单列表
export const getStockInList = params => { return axios.get(`${base}Api/?Do=StockInList`, { params: params }); };
//创建入库单
export const creatData = params => { return axios.post(`${base}Api/?Do=StockInCreate`, params); };
//查询指定入库单
export const queryStockIn = params => { return axios.get(`${base}Api/?Do=StockInQuery`, { params: params }); };
//确认入库，更新数量
export const updateStockIn = params => { return axios.post(`${base}Api/?Do=StockInProduct`, params); };
//调整入库单
export const adjustStockIn = params => { return axios.post(`${base}Api/?Do=StockInAdjust`, params); };

/* *********************************质检单部分******************************************************/
//获取质检单列表
export const getWQCList = params => { return axios.get(`${base}Api/?Do=WQCList`, { params: params }); };
//获取质检流水
export const getWQCFlow = params => { return axios.get(`${base}Api/?Do=WQCFlow`, { params: params }); };
//质检操作
export const executeWQC = params => { return axios.post(`${base}Api/?Do=WQCExecute`, params); };
//导出库存编码表格
export const WQCDownLoad = params => { return axios.post(`${base}Api/?Do=WQCDownLoad`, params); };

/* *********************************出库单部分******************************************************/
//获取出库单列表
export const getStockOutList = params => { return axios.get(`${base}Api/?Do=WSOList`, { params: params }); };
//创建出库单
export const creatStockOut = params => { return axios.post(`${base}Api/?Do=StockOutCreate`, params); };
//查询指定出库单
export const queryStockOut = params => { return axios.get(`${base}Api/?Do=WSOQuery`, { params: params }); };
//确认出库，更新数量
export const updateStockOut = params => { return axios.post(`${base}Api/?Do=StockOutProduct`, params); };
//调整出库单
export const adjustStockOut = params => { return axios.post(`${base}Api/?Do=StockOutAdjust`, params); };
//查询指定出库单的包裹列表
export const getWSOOList = params => { return axios.get(`${base}Api/?Do=WSOOList`, { params: params }); };
//获取拣货数据
export const getWSOPicking = params => { return axios.post(`${base}Api/?Do=WSOPicking`, params); };

/* *********************************出库单部分******************************************************/
//获取货代列表
export const getFreightList = params => { return axios.get(`${base}Api/?Do=WFList`, { params: params }); };