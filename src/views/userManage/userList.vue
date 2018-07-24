<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getUsers">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="users" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;" border>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column prop="DataID" width="100" label="ID">
			</el-table-column>
			<!-- <el-table-column prop="sex" label="性别" width="100" :formatter="formatSex" sortable>
			</el-table-column> -->
			<el-table-column prop="Warehouse.Name" label="所属仓库" width="180" sortable>
			</el-table-column>
			<el-table-column label="ERP用户" width="180" sortable>
				<template slot-scope="scope">
				    <p>{{scope.row.User.Name}} [{{scope.row.User.TrueName}}]</p>
				</template>
			</el-table-column>
			<el-table-column prop="RFName" label="RF登录名" width="180" sortable>
			</el-table-column>
			<!-- <el-table-column prop="birth" label="生日" width="120" sortable>
			</el-table-column> -->
			<el-table-column label="状态" min-width="100" sortable>
			<template slot-scope="scope">
				    <p>{{scope.row.IsAdmin | IsAdmin}}<br > {{scope.row.Status}}</p>
				</template>
			</el-table-column>
			<el-table-column prop="Date" label="时间" min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<template slot-scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
				<el-form-item label="ERP用户">
				    <el-input v-model="editForm.User.Name" auto-complete="off" style="width:215px"></el-input>
				    <el-input v-model="editForm.User.Name" auto-complete="off" style="width:215px"></el-input>
					<el-button type="primary" @click.native="">搜索</el-button>
				</el-form-item>
				<el-form-item label="归属仓库">
					<el-select v-model="editForm.WID" placeholder="请选择活动区域">
						<el-option label="区域一" value="shanghai"></el-option>
						<el-option label="区域二" value="beijing"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="RF登录名称">
					<!-- <el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number> -->
					<el-input v-model="editForm.RFName" style="width:215px"></el-input>
				</el-form-item>
				<el-form-item label="RF登录密码">
					<el-input v-model="editForm.RFPassWord" style="width:215px"></el-input>
				</el-form-item>
				<el-form-item label="状态设置">
					<el-select v-model="changeStatus">
						<el-option label="正常" value="正常"></el-option>
						<el-option label="禁止" value="禁止"></el-option>
					</el-select>
					<el-button type="primary" @click.native="setStatus(editForm.DataID)">变更状态</el-button>
				</el-form-item>
				<el-form-item label="管理设置">
					<el-select v-model="changeAdmin">
						<el-option label="管理员" value="True"></el-option>
						<el-option label="非管理员" value="False"></el-option>
					</el-select>
					<el-button type="primary" @click.native="setAdmin(editForm.DataID)">变更状态</el-button>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item label="ERP用户">
					<el-input v-model="addForm.Name" auto-complete="off" style="width:215px"></el-input>
					<el-input v-model="editForm.User.Name" auto-complete="off" style="width:215px"></el-input>
					<el-button type="primary" @click.native="">搜索</el-button>
				</el-form-item>
				<el-form-item label="归属仓库">
					<el-select v-model="addForm.WID" placeholder="请选择活动区域">
						<el-option label="区域一" value="shanghai"></el-option>
						<el-option label="区域二" value="beijing"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="RF登录名称">
					<!-- <el-input-number v-model="editForm.age" :min="0" :max="200"></el-input-number> -->
					<el-input v-model="addForm.RFName" style="width:215px"></el-input>
				</el-form-item>
				<el-form-item label="RF登录密码">
					<el-input v-model="addForm.RFPassWord" style="width:215px"></el-input>
				</el-form-item>
				<el-form-item label="状态设置">
					<el-select v-model="changeStatus">
						<el-option label="正常" value="正常"></el-option>
						<el-option label="禁止" value="禁止"></el-option>
					</el-select>
					<el-button type="primary" @click.native="setStatus(editForm.DataID)">变更状态</el-button>
				</el-form-item>
				<el-form-item label="管理设置">
					<el-select v-model="changeAdmin">
						<el-option label="管理员" value="True"></el-option>
						<el-option label="非管理员" value="False"></el-option>
					</el-select>
					<el-button type="primary" @click.native="setAdmin(editForm.DataID)">变更状态</el-button>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserList, userDelete, batchRemoveUser, userSave, addUser, userSetStatus, userSetAdmin } from '../../api/api';
	let qs = require('qs');
	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				users: [],
				total: 0,
				page: 1,
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
					User:{Name: ''},
					UID: '',
					WID: '',
					RFName: '',
					RFPassWord: '',
				},

				//变更状态
				changeStatus:'',
				changeAdmin:'',

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					UID: '',
					WID: '',
					RFName: '',
					RFPassWord: ''
				}

			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getUsers();
			},
			//获取用户列表
			getUsers() {
				let para = {
					page: this.page,
					// name: this.filters.name
					// Mode: 'InService'
				};
				this.listLoading = true;
				// NProgress.start();
				getUserList(para).then((res) => {
					this.total = res.data.total;
					this.users = res.data.DataList;
					this.listLoading = false;
					// NProgress.done();
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = qs.stringify({ DataID: row.id });
					userDelete(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
				this.changeStatus = row.Status;
				this.changeAdmin = row.IsAdmin;
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = qs.stringify(Object.assign({}, this.editForm));
							// para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							userSave(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getUsers();
							});
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
							para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getUsers();
							});
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.DataID).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					userDelete(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getUsers();
					});
				}).catch(() => {

				});
			},
			//状态设置
			setStatus: function(id){
				let para = qs.stringify({ DataID: id, Status: this.changeStatus});
				userSetStatus(para).then((res) => {
					this.listLoading = false;
					//NProgress.done();
					this.$message({
						message: '用户状态设置成功',
						type: 'success'
					});
					this.getUsers();
				});
			},
			//管理状态设置
			setAdmin: function(id){
				let para = qs.stringify({ DataID: id, IsAdmin: this.changeAdmin});
				userSetAdmin(para).then((res) => {
					this.listLoading = false;
					//NProgress.done();
					this.$message({
						message: '管理员状态设置成功',
						type: 'success'
					});
					this.getUsers();
				});
			}
		},
		filters: {
			IsAdmin: function(status){
				return status === 'True'?'管理员':'非管理员'
			}
		},
		mounted() {
			this.getUsers();
		}
	}

</script>

<style scoped>

</style>