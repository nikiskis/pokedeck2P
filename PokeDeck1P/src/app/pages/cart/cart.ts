import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe, NgIf, NgFor } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/cart';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';

declare const paypal: any;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DecimalPipe, NavbarComponent, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('paypalButtonContainer', { static: false }) 
  paypalButtonContainer!: ElementRef;

  items: CartItem[] = [];
  paid = false;
  paymentError = '';
  ivaRate = 0.16; 
  
  
  //paypal id
  private PAYPAL_CLIENT_ID = 'AW8EjdlHjFUDqAnme17IlrWjBlBdldXV_D3sb3eu8T6DGsKQxOdxgVnm3hb5vu8G68zKoKljCOyuRCvw'; 

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
    });
  }

  ngAfterViewInit(): void {
    if (this.items.length > 0 && !this.paid) {
      setTimeout(() => this.loadPaypalScript(), 100);
    }
  }

  ngOnDestroy(): void {
    const script = document.getElementById('paypal-sdk');
    if (script) {
      script.remove();
    }
  }

  updateQty(productId: number, qty: number) {
    if (qty < 1) qty = 1;
    this.cartService.updateQuantity(productId, Number(qty));
    this.cleanupPaypal();
    this.renderPaypalButtons(); 
  }

  remove(productId: number) {
    this.cartService.remove(productId);
    this.cleanupPaypal();
    if (this.items.length > 0) {
        this.renderPaypalButtons();
    }
  }

  subtotal(): number {
    return this.items.reduce((sum, i) => sum + (i.product.precio * i.quantity), 0);
  }

  iva(): number {
    return this.subtotal() * this.ivaRate;
  }

  total(): number {
    return this.subtotal() + this.iva();
  }

  cleanupPaypal() {
    if (this.paypalButtonContainer && this.paypalButtonContainer.nativeElement) {
        this.paypalButtonContainer.nativeElement.innerHTML = '';
    }
  }

  loadPaypalScript(): void {
    if (document.getElementById('paypal-sdk')) {
        this.renderPaypalButtons();
        return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${this.PAYPAL_CLIENT_ID}&currency=MXN`;
    script.onload = () => this.renderPaypalButtons();
    document.body.appendChild(script);
  }

  renderPaypalButtons(): void {
    if (typeof paypal === 'undefined' || !this.paypalButtonContainer) return;

    this.cleanupPaypal();

    paypal.Buttons({
        createOrder: (data: any, actions: any) => {
            this.paymentError = '';

            const user = this.auth.currentUserValue;
            if (!user) {
                this.paymentError = "Debe iniciar sesión para pagar.";
                return actions.reject();
            }

            const outOfStock = this.items.find(i => i.product.stock <= 0 || i.quantity > i.product.stock);
            if (outOfStock) {
                this.paymentError = `No hay suficiente stock de: ${outOfStock.product.nombre}`;
                return actions.reject();
            }

            return this.http.post('http://189.163.49.6:4000/api/payment/create-order', {
                items: this.items,
                userId: user.id
            })
            .toPromise()
            .then((res: any) => res.id)
            .catch((err: any) => {
                console.error("Error createOrder:", err);
                if (err.error && err.error.error) {
                    this.paymentError = err.error.error;
                } else {
                    this.paymentError = "Error al iniciar el pago con PayPal.";
                }
                return actions.reject(err);
            });
        },
        
        onApprove: (data: any, actions: any) => {
            const user = this.auth.currentUserValue;
            if (!user) return;
            
            return this.http.post('http://189.163.49.6:4000/api/payment/capture-order', {
                orderID: data.orderID,
                userId: user.id,
                cartItems: this.items 
            })
            .toPromise()
            .then((res: any) => {
                this.handleSuccess(res, data); 
            })
            .catch((err: any) => {
                this.paymentError = "Error al procesar el pago.";
                return actions.reject(err);
            });
        },
        
        onError: (err: any) => {
            if (!this.paymentError) {
                this.paymentError = "Ocurrió un error inesperado con PayPal.";
            }
            console.error(err);
        }
    }).render(this.paypalButtonContainer.nativeElement);
  }
  
  handleSuccess(response: any, paypalData: any): void {
    if (response.status === 'COMPLETED') {
        this.paid = true;
        this.generateReceiptXML(paypalData.orderID, response.dbOrderId); 
        this.cartService.clear(); 
    } else {
        this.paymentError = "El pago no se registró como completado.";
    }
  }

  private generateReceiptXML(paypalId: string, dbOrderId: number) {
    const date = new Date().toISOString();
    const subtotal = this.subtotal().toFixed(2);
    const iva = this.iva().toFixed(2);
    const total = this.total().toFixed(2);

    const itemsXml = this.items.map(item => `
    <producto>
      <nombre>${this.escapeXml(item.product.nombre)}</nombre> 
      <cantidad>${item.quantity}</cantidad>
      <precioUnitario>${parseFloat(item.product.precio as any).toFixed(2)}</precioUnitario> 
      <subtotalProducto>${(item.quantity * parseFloat(item.product.precio as any)).toFixed(2)}</subtotalProducto> 
    </producto>
    `).join('');

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <encabezado>
    <tienda>Pokedeck Store</tienda>
    <fecha>${date}</fecha>
    <idTransaccionPayPal>${paypalId}</idTransaccionPayPal>
    <idPedidoDB>${dbOrderId}</idPedidoDB>
    <estado>COMPLETADO</estado>
  </encabezado>
  <detalleProductos>
    ${itemsXml}
  </detalleProductos>
  <resumenFinanciero>
    <moneda>MXN</moneda>
    <subtotal>${subtotal}</subtotal>
    <iva>${iva}</iva>
    <total>${total}</total>
  </resumenFinanciero>
</recibo>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_${paypalId}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}