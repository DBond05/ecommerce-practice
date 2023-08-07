import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { __values } from 'tslib';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private router:Router){} 
  ngOnInit(): void {
    
  }
  doSearch(value:string){
    console.log(`value=${__values}`);
    this.router.navigateByUrl(`/search/${value}`);
  }

}
