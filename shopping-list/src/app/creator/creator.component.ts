import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { Component, OnInit } from '@angular/core';
import { ItemMode } from '../helpers/item-mode.enum';

const CUSTOM_DATE_FORMAT: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS'
  },
  display: {
    dateInput: 'DDY-MM-YYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  providers: [
    {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMAT}
  ]
})
export class CreatorComponent implements OnInit {
  public itemMode = ItemMode;
  public selectedMode: ItemMode = this.itemMode.Common;

  constructor() { }

  ngOnInit(): void {
  }

}
