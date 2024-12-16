import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { apis } from 'src/environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
    private baseUrl = `${apis.baseUrl}`;
    private data = new BehaviorSubject<Array<any>>([{ fetching: true }]);
    $data = this.data.asObservable();

    constructor(private http: HttpClient) {}

    productDetail(params): Observable<any> {
        const url = `${this.baseUrl}/product/detail`;

        return this.http.post<any>(url, params);
    }

    productList(params): Observable<any> {
        const url = `${this.baseUrl}/supplier-product/supplier-product-list`;

        return this.http.get<any>(url, { params });
    }

    supplierList(): Observable<any> {
        const url = `${this.baseUrl}/supplier/list`;

        return this.http.get<any>(url, {});
    }

    variantList(params): Observable<any> {
        const url = `${this.baseUrl}/base-product-variant/list`;

        return this.http.get<any>(url, { params });
    }

    unitList(id): Observable<any> {
        const params = { id };
        const url = `${this.baseUrl}/public/unit/list`;

        return this.http.get<any>(url, { params });
    }

    savePoRequest(params): Observable<any> {
        const url = `${this.baseUrl}/po-request/add`;

        return this.http.post<any>(url, params);
    }
}
