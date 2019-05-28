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
      { name: 'XS - 5 euro', price: 5, description: 'Water, Redbull, Bier' },
      { name: 'S - 10 euro', price: 3, description: 'Limo, Baileys 0.2L, Whisky Cola' },
      { name: 'M - 60 euro', price: 5, description: 'Asti, Baileys 0.7L' },
      { name: 'L - 100 euro', price: 20, description:'Black, Red, Chivas 12Y, Jack' },
      { name: 'XL - 120 euro', price: 40, description:'Chivas 18Y, Gold, Hennesy, Ciroc' },
      { name: 'XL - 120 euro', price: 60, description:'Ruinart, MOET, Remy' },
      { name: 'VIP 1 - 150 euro', price: 150, description:'Hennesy Fine de Cognac' },
      { name: 'VIP 2 - 180 euro', price: 0, description:'' },
      { name: 'VIP 3 - 250 euro', price: 0, description:'' },
    ]
  }
}
