import { Injectable } from '@angular/core';

@Injectable()
export class PricingProvider {

  pricingList: Array<{ name: string, price: number, description: string }> = []

  constructor(

  ) {
    this.setBasicPricing()
  }

  setBasicPricing() {
    this.pricingList = [
      { name: 'XS - 2 euro', price: 2, description: 'Wasser' },
      { name: 'S - 3 euro', price: 3, description: 'Bier' },
      { name: 'M - 5 euro', price: 5, description: 'Coca, Fanta, Sprite' },
      { name: 'L - 20 euro', price: 20, description:'Sekt, Baileys' },
      { name: 'XL - 40 euro', price: 40, description:'Jack Daniels, Hennesy' },
      { name: 'XXL - 60 euro', price: 60, description:'Black, Chivas' },
      { name: 'VIP 1 - 80 euro', price: 80, description:'' },
      { name: 'VIP 2 - 150 euro', price: 150, description:'Ruinart Blanc' },
      { name: 'VIP 3 - 250 euro', price: 250, description:'DOM Pe' },
    ]
  }
}
