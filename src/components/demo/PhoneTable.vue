<template>
    <div>
    <ever-table
            :columns="columns"
            :tableData="tableData"
            @eventChange="eventChange"
    >
        <template #codeCol>
            <el-table-column prop="code" label="编号" :formatter="codeFormatter"></el-table-column>
        </template>
        <template #opCol>
            <el-table-column label="操作">
                <template>
                    <el-button type="primary" size="small">编辑</el-button>
                    <el-button type="danger" size="small">删除</el-button>
                </template>
            </el-table-column>
        </template>
    </ever-table>
    </div>
</template>

<script>
    import EverTable from '../EverTable'
    import urlMap from '../../util/common.js'
    import axios from 'axios'

    export default {
        name: 'PhoneTable',
        components: {
            EverTable,
        },
        data: function () {
            return {
                columns: [
                    {
                        slotName: 'codeCol'
                    },
                    {
                        prop: 'name',
                        label: '品牌',
                    },
                    {
                        prop: 'version',
                        label: '版本'
                    },
                    {
                        prop: 'price',
                        label: '价格'
                    },
                    {
                        slotName: 'opCol'
                    }
                ],
                tableData: [
                    {
                        code: '1',
                        name: '苹果',
                        version: 'iphonex max plus',
                        price: '14,400.00',
                    },
                    {
                        code: '2',
                        name: '华为',
                        version: 'ry max plus',
                        price: '14,400.00',
                    },
                    {
                        code: '3',
                        name: '三星',
                        version: '1.0 max plus',
                        price: '4,400.00',
                    },
                ]
            };
        },
        methods: {
            eventChange ({btnType, col, row}) {
                console.log(btnType, col, row)
            },
            codeFormatter (r, c, v) {
                return v + 'formatter'
            }
        },
        mounted () {
            const i = axios.create({baseURL: '/demo'})
            console.log(i.prototype)
        }
    }
</script>

<style scoped>

</style>
