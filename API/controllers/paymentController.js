import client from '../config/paypal.js';
import paypal from '@paypal/checkout-server-sdk';
import db from '../config/db.js'; 

const createOrderInDB = async (paypalCaptureData, cartItems, userId) => {
    const purchaseUnit = (paypalCaptureData.purchase_units && paypalCaptureData.purchase_units.length > 0) ? paypalCaptureData.purchase_units[0] : null;
    const capture = (purchaseUnit && purchaseUnit.payments && purchaseUnit.payments.captures && purchaseUnit.payments.captures.length > 0) ? purchaseUnit.payments.captures[0] : null;
                    
    if (!capture || !capture.amount || !purchaseUnit || !cartItems) {
        console.error("Error: No se pudo obtener el total.");
        throw new Error("Datos de PayPal insuficientes.");
    }
    
    const paypalTotalString = capture.amount.value;
    const total = parseFloat(paypalTotalString); 
    try {
        const orderSql = "INSERT INTO pedido (id_usuario, total, estado, fecha) VALUES (?, ?, 'COMPLETADO', NOW())";
        const [orderResult] = await db.query(orderSql, [userId, total]);
        const orderId = orderResult.insertId;

        const detailsPromises = cartItems.map(cartItem => { 
            const detailSql = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unidad) VALUES (?, ?, ?, ?)";
            const unitPrice = parseFloat(cartItem.product?.precio || 0);
            return db.query(detailSql, [orderId, cartItem.product.id, cartItem.quantity, unitPrice]);
        });
        
        await Promise.all(detailsPromises);
        
        const stockUpdatePromises = cartItems.map(cartItem => {
            const updateSql = "UPDATE producto SET stock = stock - ? WHERE id = ?";
            const cantidadDescontar = cartItem.quantity;
            const productoId = cartItem.product.id;
            return db.query(updateSql, [cantidadDescontar, productoId]);
        });
        
        await Promise.all(stockUpdatePromises);
        return orderId;

    } catch (err) {
        console.error('ERROR al guardar pedido o actualizar stock:', err.message || err);
        throw new Error('Falló la actualización de stock.');
    }
};

export const createOrder = async (req, res) => {
    const { items, userId } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "El carrito de compras está vacío." });
    }

    try {
        for (const item of items) {
            const [rows] = await db.query('SELECT stock, nombre, activo FROM producto WHERE id = ?', [item.product.id]);
            
            if (rows.length === 0) {
                return res.status(400).json({ error: `El producto "${item.product.nombre}" ya no existe.` });
            }

            const productoDB = rows[0];

            if (productoDB.activo === 0) {
                return res.status(400).json({ error: `El producto "${productoDB.nombre}" ya no está disponible.` });
            }

            if (productoDB.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Stock insuficiente para "${productoDB.nombre}". Disponibles: ${productoDB.stock}.` 
                });
            }
        }
        const subtotal = items.reduce((sum, i) => {
            const price = parseFloat(i.product?.precio || 0); 
            return sum + (price * (i.quantity || 1));
        }, 0);

        const totalValue = (subtotal * 1.16).toFixed(2);
        const taxAmount = (parseFloat(totalValue) - subtotal).toFixed(2);

        const paypalItems = items.map(cartItem => {
            const rawPrice = cartItem.product?.precio || 0; 
            const unitPrice = parseFloat(rawPrice); 
            return {
                name: cartItem.product?.nombre || 'Producto',
                quantity: cartItem.quantity.toString(),
                unit_amount: { currency_code: "MXN", value: unitPrice.toFixed(2) },
                sku: cartItem.product?.id?.toString() || ''
            };
        });

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            application_context: {
                brand_name: "Pokedeck Store",
                locale: "es-MX",
                user_action: "PAY_NOW",
                return_url: "http://localhost:4200/cart", 
                cancel_url: "http://localhost:4200/cart" 
            },
            purchase_units: [
                {
                    amount: {
                        currency_code: "MXN",
                        value: totalValue, 
                        breakdown: {
                            item_total: { currency_code: "MXN", value: subtotal.toFixed(2) },
                            tax_total: { currency_code: "MXN", value: taxAmount }
                        }
                    },
                    items: paypalItems, 
                    custom_id: userId.toString()
                }
            ]
        });

        const order = await client.execute(request);
        return res.status(201).json({ 
            id: order.result.id, 
            status: order.result.status,
            cartItems: items 
        });

    } catch (error) {
        console.error("Error al crear orden:", error);
        if (!res.headersSent) {
            const errorDetails = error.result?.details?.[0]?.description || error.message || "Error desconocido";
            return res.status(500).json({ error: "Error al procesar la orden.", details: errorDetails });
        }
    }
};

export const captureOrder = async (req, res) => {
    const { orderID, userId, cartItems } = req.body; 
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        const orderData = capture.result;

        if (orderData.status === "COMPLETED") {
            const newOrderId = await createOrderInDB(orderData, cartItems, userId); 
            res.json({ 
                status: "COMPLETED", 
                orderID: orderID,
                dbOrderId: newOrderId,
                message: "Pago completado y orden registrada."
            });
        } else {
            res.status(400).json({ status: orderData.status, message: "El pago no se completó." });
        }
    } catch (error) {
        console.error("Error al capturar el pago:", error);
        const errorDetails = error.message || "Error al procesar la captura de pago.";
        res.status(500).json({ error: "Error al procesar el pago.", details: errorDetails });
    }
};