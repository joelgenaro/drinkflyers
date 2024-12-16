import { IAlertService } from '../../libs/ialert/ialerts.service'
import { ApiService } from '../../services/api.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { DataService } from './data.service'
import * as moment from 'moment'
import { ConstantsService } from 'src/app/services/constants.service'
import { ApexAxisChartSeries, ApexGrid, ApexXAxis, ApexDataLabels, ApexTitleSubtitle, ApexChart, ApexStroke, ChartComponent } from 'ng-apexcharts'

export type ChartOptionsTotalSales = {
    series: ApexAxisChartSeries
    chart: ApexChart
    xaxis: ApexXAxis
    dataLabels: ApexDataLabels
    grid: ApexGrid
    stroke: ApexStroke
    title: ApexTitleSubtitle
}
export type ChartOptionsAverageSales = {
    series: ApexAxisChartSeries
    chart: ApexChart
    xaxis: ApexXAxis
    dataLabels: ApexDataLabels
    grid: ApexGrid
    stroke: ApexStroke
    title: ApexTitleSubtitle
}
export type ChartOptionsAverageOrderValue = {
    series: ApexAxisChartSeries
    chart: ApexChart
    xaxis: ApexXAxis
    dataLabels: ApexDataLabels
    grid: ApexGrid
    stroke: ApexStroke
    title: ApexTitleSubtitle
}

@Component({
    selector: 'app-driver-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    @ViewChild('chart') chart: ChartComponent
    public ChartOptionsTotalSales: Partial<ChartOptionsTotalSales>
    public ChartOptionsAverageSales: Partial<ChartOptionsAverageSales>
    public ChartOptionsAverageOrderValue: Partial<ChartOptionsAverageOrderValue>

    dataStatus = 'fetching'
    dateFormat: any
    dashboardData: any = []
    sellingProductCategory: any = []
    sellingProductDesign: any = []
    ownedChannelSalesRevenue: any = []
    clientSalesRevenue: any = []

    filters = {
        orderBy: '',
        order: '',
        perPage: 15,
    }
    loaderOptions = {
        rows: 5,
        cols: 3,
        colSpans: {
            0: 1,
        }
    }
    bsRangeValue: Date[]
    dateFilters = {
        fromDate: '',
        toDate: ''
    }
    constructor(
        public api: ApiService,
        public ds: DataService,
        public cs: ConstantsService,
        public alert: IAlertService
    ) {
        this.dateFormat = cs.DATE_TIME_FORMAT.SHORT_DATE

        this.ds.dashboardData().subscribe((resp) => {
            if (resp.success == true) {
                this.dashboardData = resp.data
                this.sellingProductCategory = resp.data.topSallingCategoires
                this.sellingProductDesign = resp.data.topSallingProduct
                this.ownedChannelSalesRevenue = resp.data.topProducts
                this.clientSalesRevenue = resp.data.topClients
                this.dataStatus = 'done'
                this.showGraphs()
            } else {
                this.alert.error(resp.errors)
            }
        })
    }

    ngOnInit() {

    }
    rangeDate() {
        if (this.bsRangeValue != null) {
            this.dateFilters.fromDate = moment(this.bsRangeValue[0]).format('YYYY-MM-DD')
            this.dateFilters.toDate = moment(this.bsRangeValue[1]).format('YYYY-MM-DD')
        }
    }
    showGraphs() {
        this.ChartOptionsTotalSales = {
            series: [
                {
                    name: '',
                    data: [10, 41, 35, 51]
                }
            ],
            chart: {
                height: 250,
                type: 'line',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight'
            },
            title: {
                text: '',
                align: 'left'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                }
            },
            xaxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr'
                ]
            }
        }

        this.ChartOptionsAverageSales = {
            series: [
                {
                    name: '',
                    data: [20, 51, 55, 71]
                }
            ],
            chart: {
                height: 250,
                type: 'line',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight'
            },
            title: {
                text: '',
                align: 'left'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                }
            },
            xaxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr'
                ]
            }
        }

        this.ChartOptionsAverageOrderValue = {

            series: [
                {
                    name: '',
                    data: [0, 150, 200, 71]
                }
            ],
            chart: {
                height: 250,
                type: 'line',
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'straight'
            },
            title: {
                text: '',
                align: 'left'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                }
            },
            xaxis: {
                categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr'
                ]
            }
        }
    }

    logOut(): void {
        this.api.logOutSession().subscribe((resp: any) => {
            const check = this.api.logOut()
            if (check) {
                location.reload()
            }
        })
    }

    getArrowClass(fieldName, order) {
        const className = 'arrow ' + order
        if (
            this.filters.orderBy === fieldName &&
            this.filters.order === order
        ) {
            return className + ' active'
        }
        return className
    }

    doSort(orderBy, order) {
        this.filters.orderBy = orderBy
        this.filters.order = order

        // this.getList()
    }

    getSerialNumber(i: number) {
        return i + 1
    }
}
