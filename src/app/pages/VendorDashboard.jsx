import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const VendorDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        fetchVendorData();
    }, []);

    const fetchVendorData = async () => {
        const user = (await supabase.auth.getUser()).data.user;

        // 1. Fetch Orders assigned to this vendor
        const { data: orderData } = await supabase
            .from('orders')
            .select('*, medicines(brand_name), users(name)')
            .eq('vendor_id', user.id);
        setOrders(orderData || []);

        // 2. Fetch Inventory
        const { data: invData } = await supabase
            .from('inventory')
            .select('*, medicines(brand_name)')
            .eq('vendor_id', user.id);
        setInventory(invData || []);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        fetchVendorData(); // Refresh list
    };

    const updateStock = async (invId, newStock) => {
        await supabase.from('inventory').update({ stock_quantity: newStock }).eq('id', invId);
        fetchVendorData();
    };

    return (
        <div className="vendor-container">
            <h1>Vendor Command Center</h1>

            <section>
                <h2>Active Customer Orders</h2>
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <p><strong>Medicine:</strong> {order.medicines.brand_name}</p>
                        <p><strong>Customer:</strong> {order.users.name}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                        {order.status === 'pending' && (
                            <>
                                <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="btn-accept">Accept Order</button>
                                <button onClick={() => updateOrderStatus(order.id, 'rejected')} className="btn-reject">Reject Order</button>
                            </>
                        )}
                    </div>
                ))}
            </section>

            <section>
                <h2>Stock Management</h2>
                <table>
                    <thead>
                        <tr><th>Medicine</th><th>In Stock</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => (
                            <tr key={item.id}>
                                <td>{item.medicines.brand_name}</td>
                                <td>
                                    <input
                                        type="number"
                                        defaultValue={item.stock_quantity}
                                        onBlur={(e) => updateStock(item.id, e.target.value)}
                                    />
                                </td>
                                <td>{item.stock_quantity > 0 ? "✅ Available" : "❌ Out of Stock"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default VendorDashboard;