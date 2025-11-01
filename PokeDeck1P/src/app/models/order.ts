
export interface OrderDetail {
    cantidad: number;
    precio_unidad: number;
    producto_nombre: string;
    producto_imagen: string;
}

export interface Order {
    id: number;
    fecha: string;
    total: number;
    estado: string;
    detalles: OrderDetail[]; 
}