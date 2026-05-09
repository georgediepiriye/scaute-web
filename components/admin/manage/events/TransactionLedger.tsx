// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TransactionLedger({ orders }: { orders: any[] }) {
  if (orders.length === 0)
    return (
      <p className="text-center py-10 text-gray-400 text-[10px] font-bold uppercase italic">
        No successful transactions yet.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-50">
            <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
              Buyer
            </th>
            <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
              Tier
            </th>
            <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest">
              Qty
            </th>
            <th className="pb-4 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order._id} className="group">
              <td className="py-4">
                <p className="text-xs font-black text-gray-900 leading-none mb-1">
                  {order.user?.name || "Guest"}
                </p>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  {order.buyerEmail}
                </p>
              </td>
              <td className="py-4">
                <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tighter">
                  {order.tierName}
                </span>
              </td>
              <td className="py-4 text-xs font-bold">{order.quantity}</td>
              <td className="py-4 text-right text-xs font-black italic">
                ₦{order.totalAmount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
