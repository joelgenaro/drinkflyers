import { DataService } from './data.service'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-sepod-store',
  templateUrl: './sepod-store.component.html',
  styleUrls: ['./sepod-store.component.css']
})
export class SepodStoreComponent implements OnInit {

  constructor(public ds:DataService) { }

  ngOnInit() {
  }

}
