interface ReceiptProps {
  orderNumber: string;
}

export default function Receipt({
  orderNumber,
}: ReceiptProps) {
  return (
    <div className="bg-white text-black p-6 rounded-xl w-full max-w-sm mx-auto">
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-black">
          J&JAY
        </h1>

        <p className="text-sm">
          POS & Inventory System
        </p>
      </div>

      <div className="py-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Order #</span>
          <span>{orderNumber}</span>
        </div>

        <div className="flex justify-between">
          <span>Date</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Cashier</span>
          <span>Admin</span>
        </div>
      </div>

      <div className="border-t border-b py-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Hammer x2</span>
          <span>₱700</span>
        </div>

        <div className="flex justify-between">
          <span>PVC Pipe x3</span>
          <span>₱540</span>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₱1,240</span>
        </div>
      </div>

      <div className="text-center mt-6 text-xs">
        Thank you for shopping!
      </div>
    </div>
  );
}