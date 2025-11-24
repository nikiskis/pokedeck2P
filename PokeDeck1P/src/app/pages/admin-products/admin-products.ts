import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  successMsg = '';
  
  isModalOpen = false;
  isEditing = false;
  editForm: FormGroup;
  selectedFile: File | null = null;
  currentProductId: number | null = null;
  currentImagePreview: string | null = null;
  currentProductActive: number = 1;

  constructor(
      private productService: ProductService,
      private fb: FormBuilder
  ) {
      this.editForm = this.fb.group({
          nombre: ['', Validators.required],
          descripcion: ['', Validators.required],
          precio: [0, [Validators.required, Validators.min(0)]],
          stock: [0, [Validators.required, Validators.min(0)]]
      });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => console.error(err)
    });
  }

  saveStock(product: Product) {
    this.productService.updateStock(product.id, product.stock).subscribe({
      next: () => {
        this.successMsg = `Stock de "${product.nombre}" actualizado.`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => alert('Error al actualizar stock')
    });
  }

  openCreateModal() {
      this.isEditing = false;
      this.currentProductId = null;
      this.currentImagePreview = null;
      this.selectedFile = null;
      this.currentProductActive = 1; 
      this.editForm.reset({ precio: 0, stock: 0 });
      this.isModalOpen = true;
  }

  openEditModal(product: Product) {
      this.isEditing = true;
      this.currentProductId = product.id;
      this.currentImagePreview = product.imagen;
      this.currentProductActive = product.activo; 
      this.selectedFile = null;
      
      this.editForm.patchValue({
          nombre: product.nombre,
          descripcion: product.descripcion,
          precio: product.precio,
          stock: product.stock
      });
      
      this.isModalOpen = true;
  }

  closeModal() {
      this.isModalOpen = false;
  }

  onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
          this.selectedFile = file;
          const reader = new FileReader();
          reader.onload = () => {
              this.currentImagePreview = reader.result as string;
          };
          reader.readAsDataURL(file);
      }
  }

  submitForm() {
      if (this.editForm.invalid) return;
      
      if (!this.isEditing && !this.selectedFile) {
          alert("Debes seleccionar una imagen para el nuevo producto.");
          return;
      }

      const formData = new FormData();
      formData.append('nombre', this.editForm.get('nombre')?.value);
      formData.append('descripcion', this.editForm.get('descripcion')?.value);
      formData.append('precio', this.editForm.get('precio')?.value);
      formData.append('stock', this.editForm.get('stock')?.value);

      if (this.selectedFile) {
          formData.append('imagen', this.selectedFile);
      }

      if (this.isEditing && this.currentProductId) {
          this.productService.updateProductFull(this.currentProductId, formData).subscribe({
              next: () => {
                  this.successMsg = 'Producto editado correctamente';
                  this.finalizeAction();
              },
              error: (err) => alert('Error al editar producto')
          });
      } else {
          this.productService.createProduct(formData).subscribe({
              next: () => {
                  this.successMsg = 'Producto creado correctamente';
                  this.finalizeAction();
              },
              error: (err) => alert('Error al crear producto')
          });
      }
  }

  deleteProduct() {
      if (!this.isEditing || !this.currentProductId) return;

      if (confirm('¿Estás seguro de que quieres desactivar este producto?')) {
          this.productService.deleteProduct(this.currentProductId).subscribe({
              next: () => {
                  this.successMsg = 'Producto desactivado correctamente';
                  this.finalizeAction();
              },
              error: (err) => alert('Error al desactivar el producto.')
          });
      }
  }

  restoreProduct() {
      if (!this.isEditing || !this.currentProductId) return;

      if (confirm('¿Quieres reactivar este producto y hacerlo visible nuevamente?')) {
          this.productService.activateProduct(this.currentProductId).subscribe({
              next: () => {
                  this.successMsg = 'Producto reactivado correctamente';
                  this.finalizeAction();
              },
              error: (err) => alert('Error al reactivar el producto.')
          });
      }
  }

  finalizeAction() {
      this.loadProducts();
      this.closeModal();
      setTimeout(() => this.successMsg = '', 3000);
  }
}