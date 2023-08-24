import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
//rxjs is short for reactive javaScript
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  


  private baseUrl = environment.apiUrl +  '/products';

  private categoryUrl = environment.apiUrl + '/product-category';
  constructor(private httpClient: HttpClient) { }

  // method returns observable and maps the JSON data 
  //  from spring Data REST to product array
  getProductList(theCategoryId: number): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl);
  }

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number):
   Observable<GetResponseProducts> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
    + `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(url);
  }

  searchProductsPaginate(thePage: number, thePageSize: number, theKeyword: string):
  Observable<GetResponseProducts> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
   + `&page=${thePage}&size=${thePageSize}`;
   return this.httpClient.get<GetResponseProducts>(searchUrl);
 }

  
  searchProducts(theKeyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products));
  }
  getProduct(theProductId: number): Observable<Product> {
  const productUrl=`${this.baseUrl}/${theProductId}`;
  return this.httpClient.get<Product>(productUrl);
  }


}
// supporting interface to help with maping 
// unwraps the JSON from Spring Data REST
//_embedded entry is the highest level of the JSON
interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page:{
    size:number,
    totalElements: number,
    totalPages: number,
    number:number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}