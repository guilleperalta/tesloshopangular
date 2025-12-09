import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { FrontNavbar } from "../../components/front-navbar/front-navbar"

@Component({
  selector: 'store-front-layout',
  imports: [RouterOutlet, FrontNavbar],
  templateUrl: './store-front-layout.html',
})
export class StoreFrontLayout { }
