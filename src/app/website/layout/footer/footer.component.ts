import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router'

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    filters: any = {
        title: ''
    }
    constructor(
        public router: Router,
        private route: ActivatedRoute,
    ) {
        this.route.queryParams.subscribe((param: Params) => {
            if (param.country) {
                this.filters.country = param.country
            }else {
                this.filters.country = 'USA'
            }
        })
    }

    ngOnInit() {
    }
    redirectToSearch() {
        const filtersParam = {
            country: this.filters.country,
            title: this.filters.title
        }
        this.router.navigate(['/search'], { queryParams: filtersParam, replaceUrl: true })
    }

}
